# Calendarier Web — Lista de Tareas

## Leyenda
- ✅ Completado
- 🔄 En progreso
- ⬜ Pendiente

---

## Fase 1: Base del proyecto

- [ ] ⬜ **Inicializar Next.js + Tailwind + TypeScript**
  - `npx create-next-app` en `calendario-web/`
  - Tailwind CSS configurado
  - ESLint + tsconfig correctos
- [ ] ⬜ **Configurar variables de entorno** (`.env.local`)
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `JWT_SECRET`
- [ ] ⬜ **Crear archivos base**
  - `src/lib/supabase.ts` — Cliente Supabase
  - `src/lib/auth.ts` — JWT helpers (crear/verificar con `jose`)
  - `src/lib/constants.ts` — Codigos, colores, emojis, meses
  - `src/types/index.ts` — Tipos TypeScript

## Fase 2: Base de datos

- [ ] ⬜ **Subir schema.sql a Supabase** (lo haces tu)
- [ ] ⬜ **Seed: 3 calendarios + personas** (lo haces tu con el SQL)
- [ ] ⬜ **Verificar conexion Supabase** desde el codigo

## Fase 3: API — Auth

- [ ] ⬜ `POST /api/auth/login` — Validar slug + name + password, devolver JWT
- [ ] ⬜ `POST /api/auth/logout` — Limpiar cookie
- [ ] ⬜ `GET /api/auth/me` — Verificar sesion actual

## Fase 4: API — Calendarios

- [ ] ⬜ `GET /api/calendars` — Listar calendarios publicos
- [ ] ⬜ `GET /api/calendars/[slug]` — Obtener calendario + personas + availability
- [ ] ⬜ `POST /api/calendars/[slug]/availability` — Marcar persona+fecha
- [ ] ⬜ `POST /api/calendars/[slug]/batch` — Marcar rango de dias
- [ ] ⬜ `DELETE /api/calendars/[slug]/clear` — Limpiar todo

## Fase 5: API — Nuevas features

- [ ] ⬜ `GET /api/calendars/[slug]/events` — Listar eventos personalizados
- [ ] ⬜ `POST /api/calendars/[slug]/events` — Crear evento
- [ ] ⬜ `DELETE /api/calendars/[slug]/events/[id]` — Eliminar evento
- [ ] ⬜ `GET /api/calendars/[slug]/plans` — Listar planes de grupo
- [ ] ⬜ `POST /api/calendars/[slug]/plans` — Crear plan
- [ ] ⬜ `POST /api/calendars/[slug]/plans/[id]/respond` — Responder a plan

## Fase 6: Frontend — Login

- [ ] ⬜ **Pagina `/login`** — Formulario: seleccionar calendario + nombre + contrasena
- [ ] ⬜ **Proteccion de rutas** — Redirigir a login si no hay sesion
- [ ] ⬜ **Layout protegido** — Navbar + verificacion de sesion en cada ruta

## Fase 7: Frontend — Vistas principales

- [ ] ⬜ **`Nav.tsx`** — Navegacion desktop + mobile (desde template)
- [ ] ⬜ **`ThemeToggle.tsx`** — Toggle dark/light mode
- [ ] ⬜ **`SetupView.tsx`** — Configurar ano, meses, grupo, personas
- [ ] ⬜ **`CalendarView.tsx`** — Contenedor con tabs (Cuadricula + Tabla)
- [ ] ⬜ **`GridView.tsx`** — Cuadricula semanal con chips de colores
- [ ] ⬜ **`TableView.tsx`** — Tabla fechas x personas con badges
- [ ] ⬜ **`ResumenView.tsx`** — Dashboard: stats cards + umbrales + distribucion
- [ ] ⬜ **`Legend.tsx`** — Leyenda de codigos de colores
- [ ] ⬜ **`BatchModal.tsx`** — Modal para marcar rango de dias

## Fase 8: Frontend — Nuevas features

- [ ] ⬜ **`PlanesView.tsx`** — Vista de planes de grupo con respuestas
- [ ] ⬜ **`CreatePlanModal.tsx`** — Modal para crear nuevo plan
- [ ] ⬜ **`EventosView.tsx`** — Vista de eventos personalizados con horarios

## Fase 9: Integracion

- [ ] ⬜ **Conectar SetupView con API** — Guardar configuracion en BD
- [ ] ⬜ **Conectar CalendarView con API** — Cargar/marcar disponibilidad real
- [ ] ⬜ **Conectar ResumenView con API** — Metricas desde datos reales
- [ ] ⬜ **Conectar PlanesView con API** — Crear/responder planes
- [ ] ⬜ **Conectar EventosView con API** — Crear/eliminar eventos

## Fase 10: Despliegue

- [ ] ⬜ **Inicializar Git** (`git init`)
- [ ] ⬜ **Crear repositorio en GitHub**
- [ ] ⬜ **Configurar Vercel** — Conectar con GitHub
- [ ] ⬜ **Variables de entorno en Vercel** — Supabase URL + keys + JWT_SECRET
- [ ] ⬜ **Deploy** — Primer deploy exitoso
- [ ] ⬜ **Actualizar contrasenas reales** en Supabase
