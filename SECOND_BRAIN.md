# 🧠 Calenadarier — Second Brain

> Single source of truth for the project. Architecture, decisions, patterns, and everything a developer needs.

---

## 1. Project Identity

| Propiedad | Valor |
|-----------|-------|
| **Nombre** | Calenadarier |
| **Propósito** | Gestión de disponibilidad de grupos de trabajo (verano/hostelería) |
| **URL** | (pendiente de deploy en Vercel) |
| **Repo** | `hangok9/Calendarier` (GitHub) |
| **Idioma** | 100% español (UI, API responses, código) |
| **Origen** | Migración de Python + Excel + Apps Script a Next.js |
| **Rama principal** | `main` (sin otras ramas activas) |

---

## 2. Quick Start

```bash
cd calendario-web
cp .env.local.example .env.local   # Llenar con valores reales
npm install
npm run dev                         # http://localhost:3000
```

**Seed users:** 18 usuarios, contraseña = `username+2026` (ej: `pepe2026`)

---

## 3. Tech Stack & Versiones

| Tecnología | Versión | Uso |
|------------|---------|-----|
| Next.js | 16.2.9 | Framework (App Router, Turbopack) |
| React | 19.2.4 | UI |
| TypeScript | 5 | Lenguaje (strict mode) |
| Tailwind CSS | 4 | Estilos |
| Supabase JS | 2.109.0 | Cliente BD |
| jose | 6.2.3 | JWT sign/verify |
| bcryptjs | 3.0.3 | Hashing de contraseñas |
| Resend | 6.16.0 | Emails transaccionales |
| Zod | 4.4.3 | Validación de schemas |
| ESLint | 9 | Linter |
| PostCSS | (latest) | CSS processing |

---

## 4. Directory Structure

```
Calenadarier/
├── calendario-web/                     # 🟢 Proyecto principal Next.js
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx                # Login (home)
│   │   │   ├── layout.tsx              # Root layout (Inter + JetBrains Mono)
│   │   │   ├── globals.css             # 803 líneas: tokens, animaciones, componentes
│   │   │   ├── login/page.tsx          # Redirect a /
│   │   │   ├── register/page.tsx       # Crear cuenta
│   │   │   ├── forgot-password/page.tsx # Solicitar reset
│   │   │   ├── reset-password/page.tsx  # Reset con token
│   │   │   ├── dashboard/page.tsx       # Panel principal del usuario
│   │   │   ├── account/page.tsx         # Cambiar email/contraseña
│   │   │   ├── calendario/[slug]/
│   │   │   │   └── page.tsx             # Vista principal del calendario
│   │   │   ├── api/
│   │   │   │   ├── auth/               # 7 endpoints
│   │   │   │   └── calendars/          # 16 endpoints (anidados)
│   │   │   └── favicon.ico
│   │   ├── components/                 # 11 componentes
│   │   ├── lib/                        # 7 módulos
│   │   ├── services/                   # 1 servicio
│   │   ├── types/                      # Types
│   │   └── middleware.ts               # Protección de API routes
│   ├── next.config.ts
│   ├── tsconfig.json
│   ├── postcss.config.mjs
│   ├── eslint.config.mjs
│   └── package.json
├── supabase/
│   ├── schema.sql                      # Esquema completo + seed
│   ├── migration.sql                   # Migración 1: usuarios
│   ├── migration2.sql                  # Roles, alias, created_by
│   ├── migration3.sql                  # Pepe como creador
│   ├── migration4.sql                  # Apellidos, nombres reales, eliminar merino
│   └── SEED_DATA.md                    # Seed en formato legible
├── web/index.html                      # Template HTML original (referencia visual)
├── datos/                              # Credenciales (gitignored)
├── skills/                             # Skills de opencode
├── README.md
├── TASKS.md
├── TODO.md
├── MEJORA_VISUAL.md                    # Design wishlist
├── MONETIZACION.md                     # Business model proposal
├── OPTIMIZACIONES.md                   # Performance optimization notes
└── SECOND_BRAIN.md                     # 🫵 Este archivo
```

---

## 5. Database Schema (Supabase PostgreSQL)

### Tabla: `users`
| Columna | Tipo | Notas |
|---------|------|-------|
| id | UUID PK | `gen_random_uuid()` |
| username | TEXT UNIQUE | Minúsculas, sin espacios |
| email | TEXT | Nullable |
| password | TEXT | Hash bcrypt (salt rounds: 10) |
| created_at | TIMESTAMPTZ | Default `now()` |

### Tabla: `calendars`
| Columna | Tipo | Notas |
|---------|------|-------|
| id | UUID PK | |
| slug | TEXT UNIQUE | Auto-generado, lowercase, guiones |
| name | TEXT | Nombre visible |
| year | INT | Default 2026 |
| months | INT[] | Array de números de mes |
| created_by | UUID → users | Quién creó el calendario |
| created_at | TIMESTAMPTZ | |

### Tabla: `people`
| Columna | Tipo | Notas |
|---------|------|-------|
| id | UUID PK | |
| calendar_id | UUID → calendars | CASCADE delete |
| name | TEXT | Nombre visible (ej: "Josep Maria") |
| primer_apellido | TEXT | |
| segundo_apellido | TEXT | |
| sort_order | INT | Orden de visualización |
| user_id | UUID → users | Nullable (si no tiene cuenta) |
| role | TEXT | `'manager'` o `'member'`, default `'member'` |
| alias | TEXT | Apodo personalizado por calendario |
| UNIQUE(calendar_id, name) | | |

### Tabla: `availability`
| Columna | Tipo | Notas |
|---------|------|-------|
| id | UUID PK | |
| calendar_id | UUID → calendars | CASCADE delete |
| person_id | UUID → people | CASCADE delete |
| date | DATE | |
| code | TEXT | Nullable (null = libre). Uno de: TM, TT, TN, FV, FN, OC, RE, OT, CL |
| updated_at | TIMESTAMPTZ | |
| UNIQUE(person_id, date) | | Upsert por persona+fecha |

### Tabla: `custom_events`
| Columna | Tipo | Notas |
|---------|------|-------|
| id | UUID PK | |
| calendar_id | UUID → calendars | CASCADE |
| person_id | UUID → people | CASCADE |
| date | DATE | |
| start_time | TIME | Nullable |
| end_time | TIME | Nullable |
| label | TEXT | Nullable |
| code | TEXT | Nullable (mismos códigos) |
| created_at | TIMESTAMPTZ | |

### Tabla: `group_plans`
| Columna | Tipo | Notas |
|---------|------|-------|
| id | UUID PK | |
| calendar_id | UUID → calendars | CASCADE |
| title | TEXT | |
| description | TEXT | Nullable |
| start_date | DATE | |
| end_date | DATE | |
| created_by | UUID → people | |
| created_at | TIMESTAMPTZ | |

### Tabla: `plan_responses`
| Columna | Tipo | Notas |
|---------|------|-------|
| id | UUID PK | |
| plan_id | UUID → group_plans | CASCADE |
| person_id | UUID → people | CASCADE |
| response | TEXT | `'accept'`, `'decline'`, `'maybe'` |
| created_at | TIMESTAMPTZ | |
| UNIQUE(plan_id, person_id) | | |

### Índices (6)
- `idx_availability_calendar_date` ON availability(calendar_id, date)
- `idx_availability_person` ON availability(person_id)
- `idx_custom_events_calendar_date` ON custom_events(calendar_id, date)
- `idx_group_plans_calendar` ON group_plans(calendar_id)
- `idx_plan_responses_plan` ON plan_responses(plan_id)
- `idx_people_calendar_order` ON people(calendar_id, sort_order)

---

## 6. API Reference (21 endpoints)

### Auth (7)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/api/auth/login` | ❌ | Login username+password, crea sesión JWT |
| POST | `/api/auth/register` | ❌ | Registro (email+username+password). Auto-linkea people sin user_id. Envía welcome email |
| POST | `/api/auth/logout` | ✅ | Destruye cookie de sesión |
| GET | `/api/auth/me` | ✅ | Devuelve session + user + sus calendarios |
| PATCH | `/api/auth/me` | ✅ | Actualiza email del perfil |
| POST | `/api/auth/change-password` | ✅ | Cambia contraseña (requiere oldPassword) |
| POST | `/api/auth/forgot-password` | ❌ | Envía email de reset (no revela si existe) |
| POST | `/api/auth/reset-password` | ❌ | Restablece contraseña con token (1h expiry) |

### Calendars (6)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/api/calendars` | ❌ | Lista pública. Si hay sesión, incluye membership info |
| POST | `/api/calendars` | ✅ | Crear calendario (slug auto-generado). Creador = manager |
| GET | `/api/calendars/[slug]` | ✅ | Calendario completo + people + availability + my_role |
| DELETE | `/api/calendars/[slug]` | ✅ | Solo creador del calendario |
| PATCH | `/api/calendars/[slug]` | ✅ | Editar name/year/months (solo creador) |

### People (4)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/api/calendars/[slug]/people` | ✅ | Lista miembros (solo manager) |
| POST | `/api/calendars/[slug]/people` | ✅ | Añadir persona por username (manager). Envía invitation email |
| DELETE | `/api/calendars/[slug]/people/[personId]` | ✅ | Manager expulsa a cualquiera. Self-service para salirse. El último manager no puede irse |
| PATCH | `/api/calendars/[slug]/people/[personId]` | ✅ | Cambiar alias (uno mismo) o role (manager) |

### Availability (3)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/api/calendars/[slug]/availability` | ✅ | Upsert availability para persona+fecha |
| POST | `/api/calendars/[slug]/batch` | ✅ | Upsert rango de fechas (start_date → end_date) |
| DELETE | `/api/calendars/[slug]/clear` | ✅ | Limpia toda la availability del calendario |

### Events (3)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/api/calendars/[slug]/events` | ✅ | Lista eventos. Filtro opcional `?person_id=` |
| POST | `/api/calendars/[slug]/events` | ✅ | Crear evento (person_id, date, time, label, code) |
| DELETE | `/api/calendars/[slug]/events/[id]` | ✅ | Eliminar evento |

### Plans (3)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/api/calendars/[slug]/plans` | ✅ | Lista planes con respuestas |
| POST | `/api/calendars/[slug]/plans` | ✅ | Crear plan (title, description, start_date, end_date) |
| POST | `/api/calendars/[slug]/plans/[planId]/respond` | ✅ | Responder: `accept`, `decline`, `maybe` |

---

## 7. Auth System

### Sesión
- **Tipo:** JWT custom (NO NextAuth, NO Supabase Auth)
- **Librería:** `jose` (HS256)
- **Cookie:** `calendarier_session`, httpOnly, sameSite: lax, secure en producción
- **Duración:** 365 días
- **Payload:** `{ user_id, username }`
- **Secret:** `process.env.JWT_SECRET`

### Reset de contraseña
- **Token:** JWT separado con `purpose: "reset"`
- **Secret:** `process.env.RESET_TOKEN_SECRET` (fallback: JWT_SECRET)
- **Duración:** 1 hora
- **Flujo:** forgot-password → email con link → reset-password con token

### Middleware
- Protege todas las rutas `/api/*` excepto:
  - `POST /api/auth/login`
  - `POST /api/auth/register`
  - `POST /api/auth/forgot-password`
  - `POST /api/auth/reset-password`
  - `GET /api/calendars` (público)

### Flujo de login
```
POST /api/auth/login { username, password }
  → bcrypt.compare(password, user.password)
  → SignJWT({ user_id, username }) → cookie
  → Response { success, user }
```

---

## 8. Códigos de Disponibilidad (9)

| Código | Significado | Horario | Color |
|--------|-------------|---------|-------|
| TM | Trabajar mañana | 08-15h | Verde `#22C55E` |
| TT | Trabajar tarde | 15-21h | Esmeralda `#10B981` |
| TN | Trabajar noche | 21-08h | Verde oscuro `#059669` |
| FV | Fuera (vuelve) | — | Naranja `#F97316` |
| FN | Fuera (no vuelve) | — | Rojo `#EF4444` |
| OC | Ocupado | — | Gris `#6B7280` |
| RE | Recuperaciones | — | Púrpura `#A855F7` |
| OT | Otros | — | Teal `#14B8A6` |
| CL | Clases | — | Ámbar `#F59E0B` |

**Ciclo de click:** `null → TM → TT → TN → FV → FN → OC → RE → OT → CL → null → ...`

**Grid visibility:**
- `SHOWN_IN_GRID`: TM, TT, TN, FV, CL
- `HIDDEN_IN_GRID`: FN, OC, RE, OT

---

## 9. Components (11)

| Componente | Archivo | Props clave | Descripción |
|-----------|---------|-------------|-------------|
| **Nav** | `Nav.tsx` | currentView, onNavigate, calendarName, personName, onLogout | Nav desktop (links horizontales) + mobile (bottom nav con iconos) |
| **SetupView** | `SetupView.tsx` | calendar, people, availability, myRole, myPersonId, onDataChange | Gestiona personas (añadir/expulsar), alias, códigos, salirse/eliminar calendario |
| **CalendarView** | `CalendarView.tsx` | calendar, people, availability, session | Orquestador: tabs Grid/Table/Week según dispositivo, month nav, batch modal |
| **GridView** | `GridView.tsx` | calendar, people, availability, session | Cuadrícula mensual 7-columnas. Por persona: chip con inicial + código. Drag batch con pointer events. Leyenda abajo |
| **WeekView** | `WeekView.tsx` | calendar, people, availability, session, date | Vista semanal mobile-first. Por persona: círculo con inicial. Drag batch |
| **TableView** | `TableView.tsx` | calendar, people, availability, session | Tabla día×persona con scroll horizontal. Free count por día. Click cicla códigos |
| **ResumenView** | `ResumenView.tsx` | calendar, people, availability, totalDays | Stats: total personas, días, códigos. Por persona: tabla de códigos. Cobertura diaria. Barras de umbral |
| **BatchModal** | `BatchModal.tsx` | calendar, people, onApply | Modal para marcar rango de fechas con un código |
| **PlanesView** | `PlanesView.tsx` | calendar, session | Crear plan (form). Lista de planes con respuestas (accept/decline/maybe pills) |
| **EventosView** | `EventosView.tsx` | calendar, people, session | Crear evento (persona, fecha, hora, label, código). Lista de eventos con delete |

**State management:** useState + useCallback + useMemo. No hay contexto global ni store. Los datos viajan por props desde `CalendarPage`.

---

## 10. Library Modules (7)

| Módulo | Archivo | Propósito |
|--------|---------|-----------|
| **auth** | `lib/auth.ts` | JWT session: createSession, getSession (cached), destroySession, requireSession, createResetToken, verifyResetToken |
| **supabase** | `lib/supabase.ts` | Cliente Supabase inicializado con anon key |
| **constants** | `lib/constants.ts` | Códigos, colores, meses, días. Todo immutable (`as const`) |
| **email** | `lib/email.ts` | 3 funciones: sendWelcomeEmail, sendInvitationEmail, sendPasswordResetEmail. Template HTML inline |
| **errors** | `lib/errors.ts` | AppError class + factory functions (unauthorized, forbidden, notFound, badRequest, conflict) + apiError + tryCatch |
| **validate** | `lib/validate.ts` | Zod schemas para todos los inputs + helpers validate/validateOrError |
| **initials** | `lib/initials.ts` | computeInitialsMap: iniciales únicas por persona, con fallback a letras griegas |

### Patrón tryCatch (usado en API routes)
```typescript
export async function GET() {
  return tryCatch(async () => {
    const session = await requireSession()
    // ... lógica ...
    return NextResponse.json(data)
  })
}
```
- Las factory functions (`unauthorized()`, etc.) lanzan `AppError`
- `tryCatch` captura errores y responde con JSON + status code
- No hay try/catch manual en las routes

---

## 11. Services (1)

| Servicio | Archivo | Funciones |
|----------|---------|-----------|
| **calendar.service** | `services/calendar.service.ts` | `requireCalendarAccess(slug, session, role?)`, `getManagerAccess()`, `generateUniqueSlug(name)`, `enrichPeople()`, `deduplicateCalendars()` |

---

## 12. Views del Calendario

El calendario tiene 5 vistas, controladas por `ViewType = "setup" | "calendario" | "resumen" | "planes" | "eventos"`:

```
┌─────────────────────────────────────────────────────┐
│  Nav: [Configurar] [Calendario] [Resumen] [Planes] [Eventos]  │
├─────────────────────────────────────────────────────┤
│                                                      │
│  Vista activa (condicional):                         │
│  - Configurar → SetupView (personas, códigos)        │
│  - Calendario → CalendarView (grid/tabla/semana)     │
│  - Resumen   → ResumenView (stats, umbrales)         │
│  - Planes    → PlanesView (crear/responder)          │
│  - Eventos   → EventosView (crear/borrar)            │
│                                                      │
└─────────────────────────────────────────────────────┘
```

**CalendarView** internamente tiene 3 sub-vistas (tabs):
| Tab | Componente | Target |
|-----|-----------|--------|
| Cuadrícula | GridView | Desktop (por defecto) |
| Semana | WeekView | Mobile (se activa automático en <768px) |
| Tabla | TableView | Ambos |

---

## 13. Data Flow: Marcar Disponibilidad

```
Usuario click/celda en GridView
  → handleCellClick(personId, date, currentCode)
    → nextCode(currentCode)  // cicla null → TM → TT → ... → null
    → fetch POST /api/calendars/[slug]/availability
    → fetch GET /api/calendars/[slug]  (full reload)
    → onAvailabilityChange(nuevos datos)

Usuario arrastra por celdas en GridView
  → handlePointerDown(personId, date, code)
    → dragRef = { personId, code, cells: Set }
  
  → handlePointerEnter(personId, date)
    → dragRef.cells.add(dateStr)
  
  → handlePointerUp()
    → if > 1 cell: applyBatch(personId, code, sortedDates)
      → fetch POST /api/calendars/[slug]/batch
    → if 1 cell: fetch POST /api/calendars/[slug]/availability
    → fetch GET /api/calendars/[slug]
    → onAvailabilityChange(nuevos datos)
```

**Nota:** Cada marcado hace 2 requests (POST + GET full reload). Optimización pendiente: optimistic updates.

---

## 14. CSS Architecture

- **Base:** `@import "tailwindcss"` (Tailwind v4)
- **Tokens:** CSS custom properties en `:root` (modo claro) y `[data-theme="dark"]` (modo oscuro, pendiente de activar)
- **Layout:** `max-width: 80rem` centrado, padding responsive
- **Navegación:** Glass-morphism (`backdrop-filter: blur`) en desktop. Bottom nav fijo en mobile
- **Componentes visuales:**
  - `.surface-elevated` — Cards con sombra y border
  - `.pill` — Badge pequeño tipo etiqueta
  - `.tag` — Tag de persona
  - `.badge` — Badge de código de disponibilidad
  - `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-ghost` — Botones
  - `.input-field` — Inputs estilizados
  - `.nav-glass` — Navbar glassmorphism
  - `.grid-cell`, `.grid-cell-weekend` — Celdas del grid mensual
  - `.person-chip` — Chip de persona en grid
  - `.stat-card` — Card de estadísticas
  - `.day-num` — Número de día
  - `.desktop-only`, `.mobile-only` — Responsive visibility
- **Animaciones:**
  - `fadeInUp` — Entrada con slide
  - `fadeIn` — Fade simple
  - `slideDown` — Slide hacia abajo
  - `shimmer` — Skeleton loading shimmer
  - `pulse-glow` — Pulso sutil
  - `.stagger` — Stagger animation en hijos
- **Background:** Pattern de puntos + glow effects
- **Responsive:** Breakpoint en 768px (mobile/desktop)

---

## 15. Seed Data

**18 usuarios** (contraseña = `username+2026`):

```
elias → Grupo, Cachorritas
ponsa, ferran, august, joan, grau, pol → Grupo
resi, oscar, clara, anna, ivan, yeray → Barcelona
susanna, zua, anto, cris → Cachorritas
pepe → Grupo, Barcelona, Cachorritas
```

> `merino` fue eliminado en migration4, su lugar en Grupo lo ocupa `pepe`.

**3 calendarios:**
- **Grupo** (slug: `grupo`) — 8 personas, gestor: Josep Maria Elias
- **Barcelona** (slug: `barcelona`) — 7 personas, gestor: Jordi Resina
- **Cachorritas** (slug: `cachorritas`) — 6 personas, gestora: Susanna Mora

---

## 16. Environment Variables (6)

| Variable | Dónde se usa | Producción |
|----------|-------------|------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `supabase.ts` | ✅ Vercel |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `supabase.ts` | ✅ Vercel |
| `JWT_SECRET` | `auth.ts` | ❌ Pendiente (usar uno real) |
| `RESEND_API_KEY` | `email.ts` | ❌ Pendiente (configurar en Vercel) |
| `BASE_URL` | `email.ts`, people route | ✅ `http://localhost:3000` (dev) |

---

## 17. Middleware (protección de rutas)

```typescript
// middleware.ts — Matcher: /api/:path*
// Públicas (sin auth):
//   POST /api/auth/login
//   POST /api/auth/register
//   POST /api/auth/forgot-password
//   POST /api/auth/reset-password
//   GET  /api/calendars (público GET)
// Todo lo demás en /api/* requiere sesión JWT
```

---

## 18. Validation Schemas (Zod)

Todos los inputs de API se validan con Zod. Schemas en `lib/validate.ts`:

- `loginSchema` — username, password
- `registerSchema` — email, username, password, confirmPassword (refine match)
- `changePasswordSchema` — oldPassword, newPassword, confirmPassword
- `updateProfileSchema` — email (optional)
- `forgotPasswordSchema` — email
- `resetPasswordSchema` — token, password
- `createCalendarSchema` — name, year, months, myName
- `updateCalendarSchema` — name, year, months (all optional)
- `availabilitySchema` — person_id (uuid), date, code
- `batchAvailabilitySchema` — person_id, code, start_date, end_date
- `createEventSchema` — person_id, date, start_time, end_time, label, code
- `createPlanSchema` — title, description, start_date, end_date
- `respondPlanSchema` — response (enum: accept/decline/maybe)
- `addPersonSchema` — username
- `updatePersonSchema` — alias (optional), role (optional, enum)

---

## 19. Key Patterns & Conventions

### API Route pattern
```typescript
import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { requireSession } from "@/lib/auth"
import { tryCatch } from "@/lib/errors"
import { validate, someSchema } from "@/lib/validate"

export async function POST(request: Request) {
  return tryCatch(async () => {
    const session = await requireSession()
    const data = validate(someSchema, await request.json())
    // ... business logic ...
    return NextResponse.json({ success: true })
  })
}
```

### Path aliases
- `@/` → `./src/*`
- Usar en imports: `import { supabase } from "@/lib/supabase"`

### CSS
- Tailwind utility classes + CSS custom properties
- Inline styles para componentes (React `style={}`)
- Sin CSS modules ni CSS-in-JS libraries

### Naming
- Archivos: `kebab-case.ts`
- Componentes: `PascalCase.tsx`
- Funciones: `camelCase()`
- Tipos/interfaces: `PascalCase`
- Constantes: `UPPER_SNAKE_CASE`
- API routes: `kebab-case` en carpetas

### Error handling
- Usar `AppError` + factory functions
- API routes envueltas en `tryCatch()`
- No try/catch manual en routes

---

## 20. Pending Items (resumen)

| Prioridad | Item | Esfuerzo |
|-----------|------|----------|
| 🔴 | Mobile-First responsive (GridView, touch targets, bottom sheets) | Medio |
| 🔴 | Modo "pintar" toggle para drag | Bajo |
| 🟡 | Auto-link de invitaciones al registrarse | Medio |
| 🟡 | Loading skeletons (vs texto "Cargando...") | Medio |
| 🟡 | Toasts/notificaciones para acciones | Medio |
| 🟡 | Página 404 personalizada | Bajo |
| 🟡 | ThemeToggle (dark mode) | Medio |
| 🟡 | Tests de API y componentes | Alto |
| 🟢 | Paginación en calendarios grandes | Medio |
| 🟢 | JWT_SECRET real + Vercel deploy | Bajo |
| 🟢 | Resend API key en Vercel | Bajo |
| 🟢 | Sentry + analytics | Medio |

---

## 21. File Inventory (45 source files)

```
src/
├── app/
│   ├── page.tsx, layout.tsx, globals.css
│   ├── login/page.tsx
│   ├── register/page.tsx
│   ├── forgot-password/page.tsx
│   ├── reset-password/page.tsx
│   ├── dashboard/page.tsx
│   ├── account/page.tsx
│   ├── calendario/[slug]/page.tsx
│   └── api/
│       ├── auth/
│       │   ├── login/route.ts
│       │   ├── register/route.ts
│       │   ├── logout/route.ts
│       │   ├── me/route.ts
│       │   ├── change-password/route.ts
│       │   ├── forgot-password/route.ts
│       │   └── reset-password/route.ts
│       └── calendars/
│           ├── route.ts
│           └── [slug]/
│               ├── route.ts
│               ├── availability/route.ts
│               ├── batch/route.ts
│               ├── clear/route.ts
│               ├── people/
│               │   ├── route.ts
│               │   └── [personId]/route.ts
│               ├── events/
│               │   ├── route.ts
│               │   └── [id]/route.ts
│               └── plans/
│                   ├── route.ts
│                   └── [planId]/respond/route.ts
├── components/
│   ├── Nav.tsx
│   ├── SetupView.tsx
│   ├── CalendarView.tsx
│   ├── GridView.tsx
│   ├── WeekView.tsx
│   ├── TableView.tsx
│   ├── ResumenView.tsx
│   ├── BatchModal.tsx
│   ├── PlanesView.tsx
│   └── EventosView.tsx
├── lib/
│   ├── auth.ts
│   ├── supabase.ts
│   ├── constants.ts
│   ├── email.ts
│   ├── errors.ts
│   ├── validate.ts
│   └── initials.ts
├── services/
│   └── calendar.service.ts
├── types/
│   └── index.ts
└── middleware.ts
```

---

## 22. Database Migrations (orden de ejecución)

1. `schema.sql` — Tablas + seed data base (6 tablas, 18 usuarios, 21 personas)
2. `migration.sql` — Crear users table, linkear people a users
3. `migration2.sql` — Añadir `created_by` a calendars, `role` y `alias` a people. Asignar managers
4. `migration3.sql` — Hacer a "pepe" creador/owner de todos los calendarios
5. `migration4.sql` — Añadir apellidos a people, nombres reales, eliminar usuario merino

---

## 23. Next.js 16 Particularidades

El proyecto usa Next.js 16.2.9 con Turbopack. Breaking changes respecto a versiones anteriores:
- `params` y `searchParams` en page/route handlers son `Promise` (hay que hacer `await`)
- `cookies()` y `headers()` son async
- `cache()` de React se puede usar con server functions
- Config de Turbopack en `next.config.ts`: `{ turbopack: { root: process.cwd() } }`

Ver `AGENTS.md` y `node_modules/next/dist/docs/` para más detalles.
