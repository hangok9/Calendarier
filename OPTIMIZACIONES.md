# Optimizaciones — Calenadarier Web

> Análisis de optimizaciones para preparar la aplicación para bases grandes de usuarios.
> Documento dividido en dos grandes bloques: (A) hiperoptimización con Rust y (B) optimizaciones generales web.

---

## A. Hiperoptimización Matemática con Rust

Candidatos a migrar a Rust (vía `napi-rs`, WASM, o microservicio) ordenados por impacto computacional.

### A1. Motor de Agregación de Disponibilidad (Stats Engine)

**Problema actual**: `ResumenView.tsx` computa O(P × D) completamente en el cliente en cada render.

| Operación | Coste actual |
|-----------|-------------|
| Conteo de códigos por persona | O(P × D) con `array.find()` |
| Cobertura diaria (libres, TM, TT, TN, otros) | O(P × D) |
| Análisis de umbrales (4 niveles) | O(4 × D) |
| Disponibilidad media | O(D) |

**Propuesta Rust**: Módulo que reciba `(person_id, date, code)[]` y devuelva estructuras agregadas usando:
- Procesamiento paralelo con `rayon` (dividir por persona/fecha)
- SIMD para operaciones de conteo
- `HashMap<Date, BitSet<PersonId>>` para cobertura diaria

```rust
// Pseudo-arquitectura
struct StatsEngine {
    availability: Vec<AvailRow>,
    n_people: usize,
}

impl StatsEngine {
    fn per_person_stats(&self) -> Vec<PersonStat> { /* rayon::par_iter */ }
    fn daily_coverage(&self) -> Vec<DayCoverage> { /* bitset operations */ }
    fn threshold_analysis(&self) -> ThresholdResult { /* parallel filter */ }
}
```

**Impacto**: Pasa de O(P × D) en JS single-thread a O((P × D)/cores) en Rust. Para 100 personas × 62 días (~1ms vs ~50ms).

---

### A2. Optimizador de Horarios / Cobertura (Constraint Solver)

**Problema**: No existe aún, pero sería el feature de mayor valor matemático.

**Propuesta Rust**: Algoritmo de optimización combinatoria que, dada la disponibilidad actual más restricciones, encuentre la asignación óptima de personas a días.

**Tipos de problemas a resolver**:
- "Necesitamos mínimo 2 personas con TM cada día en julio"
- "Distribuir equitativamente los turnos de noche entre 5 personas"
- "Encontrar los 3 mejores días para una actividad grupal"

```rust
struct ScheduleSolver {
    // bitset por día: qué personas están disponibles con qué código
    daily_availability: HashMap<Date, CodeBitSet>,
    constraints: Vec<Constraint>,
}

impl ScheduleSolver {
    fn solve(&self) -> Option<Schedule> {
        // backtracking con poda + propagación de restricciones
        // paralelizable con rayon para explorar ramas
    }
}
```

**Enfoques posibles**:
| Enfoque | Complejidad | Escalabilidad |
|---------|-------------|---------------|
| Backtracking con poda | O(2^n) peor caso | ~20 personas |
| SAT (SATISFIABILITY) | NP-completo, pero práctico | ~100 variables |
| Recocido simulado | O(n × iteraciones) | ~1000 variables |
| Programación lineal entera | Polinomial práctica | ~10,000 variables |

**Impacto**: En JS esto es inviable para N > 20 (single-thread + lack de libraries). Rust puede manejar cientos de personas con recocido simulado o restricción propagada.

---

### A3. Procesador Batch Paralelo

**Problema actual**: `batch/route.ts:55-57` itera día por día secuencialmente.

```typescript
// Actual: O(n) secuencial
for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
  dates.push(d.toISOString().split("T")[0])
}
```

**Propuesta Rust**: Procesamiento paralelo de rangos de fechas.

```rust
fn generate_dates_parallel(start: NaiveDate, end: NaiveDate) -> Vec<String> {
    let total_days = (end - start).num_days() as usize;
    let chunks: Vec<_> = (0..total_days).into_par_iter()
        .map(|offset| (start + chrono::Duration::days(offset as i64))
            .format("%Y-%m-%d").to_string())
        .collect();
    chunks
}
```

**Plus**: Además, el módulo Rust podría validar y sanitizar rangos, evitando que un request malicioso genere 5 años de fechas.

---

### A4. Detector de Conflictos en Tiempo Real (BitSet Engine)

**Propuesta Rust**: Mantener un grafo de disponibilidad en memoria usando **bitsets**, donde cada día tiene un entero de 64/128 bits y cada bit representa una persona.

```rust
struct AvailabilityGraph {
    // Un bitset por fecha: el bit i-ésimo = persona i está libre
    daily_free: HashMap<NaiveDate, FixedBitSet>,
    // Un bitset por código por fecha
    daily_codes: HashMap<(NaiveDate, Code), FixedBitSet>,
}

impl AvailabilityGraph {
    fn days_all_free(&self) -> Vec<NaiveDate> { /* AND bit a bit */ }
    fn day_free_count(&self, date: NaiveDate) -> usize { /* POPCOUNT */ }
    fn best_days(&self, min_free: usize) -> Vec<NaiveDate> { /* filter POPCOUNT */ }
}
```

**Operaciones**:
| Operación | Fórmula | Coste |
|-----------|---------|-------|
| Todos libres | `AND` de todos los bitsets | O(1) por día |
| Alguien libre | `OR` de todos los bitsets | O(1) por día |
| Cuántos libres | `POPCOUNT` del bitset | O(1) por día (intrinsic) |
| Días con mínimo N libres | `POPCOUNT >= N` | O(D) |
| Disponible para código X | intersección de bitsets de código | O(1) |

**Impacto**: Las consultas de disponibilidad pasan de O(P × D) a O(D) con operaciones a nivel de bit, ~64× más rápidas.

---

### A5. Generación de Reportes Excel

**Problema actual**: `generar_calendario.py` con `openpyxl` se vuelve lento con grupos grandes (más de 50 personas).

**Propuesta Rust**: Usar `rust_xlsxwriter` para generar el Excel como binario standalone.

```rust
fn generate_excel(calendar: &CalendarData) -> Vec<u8> {
    let mut workbook = Workbook::new();
    let sheet = workbook.add_worksheet();
    // Escribir datos + formatos condicionales + fórmulas
    // Todo precomputado, sin depender de Excel para recalcular
    workbook.save_to_buffer()
}
```

**Plus**: Se puede invocar como subproceso desde el backend Next.js o como CLI tool para los managers.

---

### Stack Rust Sugerido

| Crate | Propósito |
|-------|-----------|
| `napi-rs` | Bindings nativos Node.js-Rust (mínima latencia, sin HTTP) |
| `rayon` | Paralelismo de datos (stats, batch, solver) |
| `fixedbitset` / `bitvec` | Bitsets compactos para disponibilidad |
| `chrono` | Manipulación de fechas (tipado, seguro) |
| `rust_xlsxwriter` | Generación de Excel |
| `wasm-pack` | Opcional: compilar a WASM para ejecución en cliente |

**Arquitectura de integración**:
```
Next.js API Route (TS)
    │
    ├── napi-rs (llamada directa a Rust, 0 latencia de red)
    │     └── librust_calendar.so / .dll / .dylib
    │
    ├── WASM (ejecución en cliente para stats)
    │     └── stats_engine.wasm
    │
    └── Subprocess (para Excel generation)
          └── calendarier-cli (binario Rust)
```

---

## B. Optimizaciones Generales Web

### 🔴 Críticas (Alto Impacto, Bajo Esfuerzo)

#### B1. Eliminar Full Reload tras cada click

**Dónde**: `TableView.tsx:45-60`, `GridView.tsx:74-91`, `WeekView.tsx`

**Problema**: Cada click en una celda de disponibilidad hace **2 requests**:
1. `POST /api/calendars/[slug]/availability` → guarda un código
2. `GET /api/calendars/[slug]` → recarga **todo** el calendario (personas + availability completa)

Para 50 personas × 62 días, cada GET devuelve ~496 filas de availability. Siempre.

**Solución**:
- **Optimistic update**: Actualizar el estado React inmediatamente (sin esperar respuesta)
- Endpoint que devuelva solo lo modificado o `{ success: true }` y confiar en el estado local
- Usar un `useReducer` o estado global para availability y aplicar cambios localmente

```typescript
// En vez de:
async function handleCellClick(personId, date, currentCode) {
  await fetch(`/api/calendars/${slug}/availability`, { method: "POST", ... })
  const r = await fetch(`/api/calendars/${slug}`)  // ❌ full reload
  if (r.availability) onAvailabilityChange(r.availability)
}

// Hacer:
async function handleCellClick(personId, date, currentCode) {
  const newCode = nextCode(currentCode)
  // Optimistic: actualizar estado local INMEDIATAMENTE
  dispatch({ type: "SET_CODE", personId, date: dateStr, code: newCode })
  // Background sync (sin await para el render)
  fetch(`/api/calendars/${slug}/availability`, { method: "POST", ... }).catch(retry)
}
```

**Impacto**: Reduce requests a la mitad. La app se siente instantánea.

---

#### B2. Precomputar availability en Map (eliminar O(n²) con array.find)

**Dónde**: `GridView.tsx:7-9`, `TableView.tsx:7-9`, `WeekView.tsx`, `ResumenView.tsx:7-9`

**Problema**: `getAvailCode()` usa `array.find()` dentro de dobles/triples loops, resultando en O(P × D × A).

```typescript
// Actual: O(n) cada llamada, llamada P × D veces = O(P × D × A)
function getAvailCode(personId, dateStr, availability) {
  return availability.find(a => a.person_id === personId && a.date === dateStr)?.code
}
```

**Solución**: Precomputar un Map en el componente padre (o con un hook personalizado).

```typescript
// Precomputar una vez:
const availMap = useMemo(() => {
  const map = new Map<string, string | null>()
  for (const a of availability) {
    map.set(`${a.person_id}:${a.date}`, a.code)
  }
  return map
}, [availability])

// Lookup O(1):
function getCode(personId: string, dateStr: string): string | null {
  return availMap.get(`${personId}:${dateStr}`) ?? null
}
```

**Impacto**: Pasa de O(P × D × A) a O(A + P × D). Para 50 personas × 62 días con 496 availability rows → de ~15,000 iteraciones de `find` a una sola pasada de 496 + 3,100 lookups O(1).

---

#### B3. Parallelizar queries secuenciales en API routes

**Dónde**: `GET /api/calendars/[slug]` (`route.ts:17-36`), `POST /api/calendars/[slug]/availability` (`availability/route.ts:17-36`), y otros.

**Problema**: Consultas a Supabase secuenciales que no dependen entre sí.

```typescript
// Actual: 3 queries secuenciales (~30ms cada una = ~90ms total)
const { data: calendar } = await supabase.from("calendars").select("*").eq("slug", slug).single()
const { data: people } = await supabase.from("people").select("*").eq("calendar_id", calendar.id)
const { data: availability } = await supabase.from("availability").select("*").eq("calendar_id", calendar.id)
```

**Solución**: Ejecutar en paralelo las que no tienen dependencias.

```typescript
// Mejorado: 1 query secuencial + 2 en paralelo (~30ms + 30ms = ~60ms)
const { data: calendar } = await supabase.from("calendars").select("*").eq("slug", slug).single()

const [peopleResult, availResult] = await Promise.all([
  supabase.from("people").select("*").eq("calendar_id", calendar!.id).order("sort_order"),
  supabase.from("availability").select("*").eq("calendar_id", calendar!.id),
])
```

**Impacto**: Reduction de ~30-40% en latencia de los endpoints más llamados.

---

#### B4. Rate limiting y validación de rango en batch

**Dónde**: `batch/route.ts:38-57`

**Problema**:
- No hay límite máximo de rango (alguien podría marcar 5 años = 1826 días de golpe)
- No hay rate limiting por usuario
- El loop construye arrays de fechas que podrían ser enormes

**Solución**:
```typescript
const MAX_BATCH_DAYS = 93  // ~3 meses máximo

const start = new Date(start_date)
const end = new Date(end_date)
const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1

if (totalDays > MAX_BATCH_DAYS) {
  return NextResponse.json({ error: `Máximo ${MAX_BATCH_DAYS} días por operación` }, { status: 400 })
}
```

**Impacto**: Previene abusos y degradación del servicio.

---

### 🟡 Medias (Impacto Medio)

#### B5. Debouncing / cola de peticiones para clicks rápidos

**Dónde**: Todos los componentes de marcado (`GridView`, `TableView`, `WeekView`)

**Problema**: Clicks rápidos pueden enviar requests out-of-order (si el POST #2 llega antes que el #1) o saturar la red.

**Solución**: Cola secuencial de peticiones + debounce.

```typescript
// Cola FIFO para availability updates
const pendingQueue = useRef<Promise<any>>(Promise.resolve())

async function enqueueUpdate(personId: string, date: string, code: string | null) {
  const prev = pendingQueue.current
  pendingQueue.current = prev.then(() =>
    fetch(`/api/calendars/${slug}/availability`, {
      method: "POST",
      body: JSON.stringify({ person_id: personId, date, code }),
    })
  )
  return pendingQueue.current
}
```

**Impacto**: Elimina race conditions y posibles datos inconsistentes.

---

#### B6. Virtualización del TableView

**Dónde**: `TableView.tsx`

**Problema**: Renderiza **todo** el DOM de la tabla, incluido lo que no está en pantalla. Con 50 personas × 62 días = 3,250 celdas DOM interactivas.

**Solución**: Usar `react-window` o `@tanstack/react-virtual` para renderizar solo las filas visibles.

```typescript
import { useVirtualizer } from "@tanstack/react-virtual"

const virtualizer = useVirtualizer({
  count: rows.length,
  getScrollElement: () => scrollRef.current,
  estimateSize: () => 48, // altura de cada fila
})

// Render solo las filas visibles:
{virtualizer.getVirtualItems().map((virtualRow) => (
  <TableRow key={rows[virtualRow.index].dateStr} row={rows[virtualRow.index]} />
))}
```

**Impacto**: DOM ~90% más pequeño en grupos grandes. Render inicial más rápido.

---

#### B7. Caching server-side de datos de calendario

**Problema**: Los datos de calendario (metadata, people, availability) cambian con poca frecuencia pero se recalculan en cada request.

**Solución**: Añadir caché en memoria con TTL.

```typescript
// Caché simple en memoria
const calendarCache = new Map<string, { data: any; timestamp: number }>()
const CACHE_TTL = 10_000 // 10 segundos

function getCachedCalendar(slug: string) {
  const cached = calendarCache.get(slug)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data
  }
  return null
}

function setCachedCalendar(slug: string, data: any) {
  calendarCache.set(slug, { data, timestamp: Date.now() })
}
```

**Extra**: Usar headers HTTP `Cache-Control: public, max-age=5, s-maxage=10` en respuestas GET para caching en CDN/Vercel Edge.

**Impacto**: Reduce carga en Supabase y latencia para datos que cambian poco.

---

#### B8. Evitar recreación de Date objects en loops

**Dónde**: `GridView.tsx:56`, `TableView.tsx:29`, `ResumenView.tsx:41`

**Problema**: Aunque están dentro de `useMemo`, la dependencia `[currentMonth, calendar.year]` causa recreación en cada cambio de mes.

**Solución**: Además de memoizar, usar `dayjs` o `date-fns` para manipulación más eficiente, o precalcular las fechas una sola vez al cargar el calendario y almacenarlas en un contexto global.

---

#### B9. Compresión y cabeceras HTTP

**Problema**: No hay configuración explícita de compresión ni cabeceras de caché.

**Solución en Next.js**: Configurar en `next.config.ts`:
```typescript
// next.config.ts
const nextConfig = {
  compress: true, // habilitar compresión
  async headers() {
    return [
      {
        source: "/api/(.*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=0, s-maxage=10, stale-while-revalidate=30" },
        ],
      },
    ]
  },
}
```

**Impacto**: Reduce tamaño de respuestas ~70-80% con Brotli.

---

#### B10. Extraer lógica de stats a un worker/server

**Dónde**: `ResumenView.tsx`

**Problema**: El O(P × D) de stats se ejecuta en el hilo principal del navegador, bloqueando el render.

**Solución**: Mover a Web Worker o, mejor, a un endpoint de API dedicado:

```
GET /api/calendars/[slug]/stats → { personStats, dailyCoverage, thresholds, avgAvailability }
```

**Impacto**: La página de resumen deja de congelarse con grupos grandes.

---

### 🟢 Bajas (Mejora de calidad / mantenibilidad)

#### B11. bcryptjs → bcrypt (binding nativo)

**Dónde**: `package.json`

**Problema**: `bcryptjs` es implementación pura en JavaScript. `bcrypt` usa binding nativo en C.

**Impacto**: `bcryptjs` es ~10× más lento. En registros/logins concurrentes, se nota. Sin embargo, en Vercel (serverless) `bcrypt` puede tener problemas con capas nativas, así que evaluar.

---

#### B12. Configurar SameSite explícitamente en cookie de sesión

**Dónde**: `lib/auth.ts`

**Problema**: La cookie `calendarier_session` no tiene `SameSite` configurado explícitamente.

**Solución**:
```typescript
cookies().set("calendarier_session", token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax", // o "strict" para máxima seguridad
  path: "/",
  maxAge: 365 * 24 * 60 * 60, // 365 días
})
```

---

#### B13. Service Worker / PWA

**Propuesta**: Añadir un Service Worker para:
- Cachear assets estáticos (estrategia "cache-first")
- Cachear datos de calendarios visitados recientemente (estrategia "stale-while-revalidate")
- Soporte offline parcial (ver disponibilidad ya cargada sin conexión)

**Impacto**: Mejora drástica de percepción de velocidad en visitas repetidas.

---

#### B14. SSE / WebSockets para tiempo real

**Propuesta**: Si dos usuarios marcan disponibilidad simultáneamente, no hay forma de que se enteren. Con SSE (Server-Sent Events) o Supabase Realtime, se pueden propagar cambios.

```typescript
// Suscripción Supabase Realtime
const subscription = supabase
  .channel(`calendar:${slug}`)
  .on("postgres_changes",
    { event: "*", schema: "public", table: "availability", filter: `calendar_id=eq.${calendarId}` },
    (payload) => {
      // Actualizar estado con el cambio recibido
    }
  )
  .subscribe()
```

**Impacto**: Base para funcionalidad colaborativa real.

---

#### B15. Migrar queries de lectura a Supabase RLS

**Propuesta**: Para operaciones de solo lectura (GET), usar RLS policies en Supabase y conectar directamente desde el cliente con el anon key, eliminando el hop del servidor Next.js.

**Riesgo**: Complejidad añadida de RLS policies. Puede hacerse gradualmente, empezando por GET de availability.

---

### Resumen de Prioridades

| # | Optimización | Categoría | Esfuerzo | Impacto |
|---|-------------|-----------|----------|---------|
| 1 | Map en vez de find() en getAvailCode | Frontend | ~30 min | 🔴 Alto |
| 2 | Optimistic updates (eliminar full reload) | Frontend+API | ~3h | 🔴 Alto |
| 3 | Parallel queries en APIs | Backend | ~1h | 🔴 Alto |
| 4 | Rate limiting en batch | Backend | ~30 min | 🔴 Medio |
| 5 | Debouncing/cola de requests | Frontend | ~2h | 🟡 Medio |
| 6 | Virtualización TableView | Frontend | ~4h | 🟡 Alto* |
| 7 | Caching server-side | Backend | ~2h | 🟡 Medio |
| 8 | Endpoint dedicado /api/stats | Backend | ~2h | 🟡 Medio |
| 9 | Web Worker para stats | Frontend | ~2h | 🟡 Medio |
| 10 | Stats Engine en Rust | Rust | ~1 semana | 🔴 Alto* |
| 11 | Constraint Solver en Rust | Rust | ~2 semanas | 🔴 Alto* |
| 12 | BitSet Engine en Rust | Rust | ~3-4 días | 🔴 Alto* |
| 13 | Service Worker / PWA | Frontend | ~4h | 🟢 Bajo |
| 14 | SSE / Tiempo real | Backend | ~3h | 🟢 Bajo |
| 15 | bcryptjs → bcrypt | Backend | ~15 min | 🟢 Bajo |

\* *Alto impacto solo cuando hay grupos grandes (>20 personas)*

---

### Diagrama de Arquitectura Objetivo

```
┌─────────────────────────────────────────────────────────────┐
│                     Cliente (Navegador)                      │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │ GridView     │  │ TableView    │  │ ResumenView      │  │
│  │ + drag batch │  │ virtualizado │  │ + Web Worker     │  │
│  │ + optimistic │  │ + infinite   │  │ (o stats engine  │  │
│  │   updates    │  │   scroll     │  │  en WASM)        │  │
│  └──────┬───────┘  └──────┬───────┘  └────────┬─────────┘  │
│         │                 │                    │            │
│  ┌──────▼─────────────────▼────────────────────▼──────────┐ │
│  │         availMap (Map<personId:date, code>) O(1)       │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                             │
│  Service Worker: cache-first for assets, stale-while-reval  │
│  for API responses, offline support for cached calendars    │
└──────────┬──────────────────────────────────────────────────┘
           │ fetch()
           ▼
┌─────────────────────────────────────────────────────────────┐
│                   Next.js (Vercel Edge/Serverless)           │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  API Routes                                          │   │
│  │  ┌────────┐ ┌───────────┐ ┌────────┐ ┌──────────┐  │   │
│  │  │ Auth   │ │ Calendar  │ │ Stats  │ │ Plans/   │  │   │
│  │  │ (JWT)  │ │ CRUD      │ │ (cache)│ │ Eventos  │  │   │
│  │  └────────┘ └───────────┘ └────────┘ └──────────┘  │   │
│  │                                                     │   │
│  │  ┌──────────────────────────────────────────┐       │   │
│  │  │ Capa de Caché (Map in-memory con TTL)    │       │   │
│  │  └──────────────────────────────────────────┘       │   │
│  └──────────┬───────────────────────────────────────────┘   │
│             │ napi-rs (FFI nativa, 0 latencia de red)      │
│  ┌──────────▼──────────────────────────────────────────────┐│
│  │              Módulos Rust (binario nativo)               ││
│  │  ┌────────────────┐ ┌──────────────┐ ┌──────────────┐  ││
│  │  │ Stats Engine   │ │ BitSet       │ │ Schedule     │  ││
│  │  │ (rayon + SIMD) │ │ Availability │ │ Solver (CSP) │  ││
│  │  └────────────────┘ │ Graph (O(1)) │ └──────────────┘  ││
│  │                     └──────────────┘                    ││
│  └─────────────────────────────────────────────────────────┘│
│             │                                               │
│  ┌──────────▼──────────────────────────────────────────────┐│
│  │              Supabase (PostgreSQL)                       ││
│  │  - Regular queries via supabase-js                       ││
│  │  - Opcional: RLS para reads directos desde cliente      ││
│  │  - Opcional: Realtime subscriptions para SSE            ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```
