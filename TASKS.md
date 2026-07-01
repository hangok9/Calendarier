# Calendarier Web — Lista de Tareas

> **Estado: Completado ~95%** — Solo quedan mejoras UX, mobile-first y producción.

## Leyenda
- ✅ Completado
- 🔄 En progreso
- ⬜ Pendiente

---

## Fase 1: Base del proyecto

- [x] ✅ **Inicializar Next.js + Tailwind + TypeScript**
  - `npx create-next-app` en `calendario-web/`
  - Tailwind CSS configurado
  - ESLint + tsconfig correctos
- [x] ✅ **Configurar variables de entorno** (`.env.local`)
- [x] ✅ **Crear archivos base**
  - `src/lib/supabase.ts` — Cliente Supabase
  - `src/lib/auth.ts` — JWT helpers (crear/verificar con `jose`)
  - `src/lib/constants.ts` — Códigos, colores, meses
  - `src/types/index.ts` — Tipos TypeScript

## Fase 2: Base de datos

- [x] ✅ **Subir schema.sql a Supabase** (lo haces tu)
- [x] ✅ **Seed: 3 calendarios + personas**
- [x] ✅ **Verificar conexion Supabase** desde el codigo

## Fase 3: API — Auth

- [x] ✅ `POST /api/auth/login` — Validar slug + name + password, devolver JWT
- [x] ✅ `POST /api/auth/logout` — Limpiar cookie
- [x] ✅ `GET /api/auth/me` — Verificar sesion actual
- [x] ✅ `POST /api/auth/register` — Crear cuenta con email
- [x] ✅ `POST /api/auth/change-password` — Cambiar contraseña
- [x] ✅ `POST /api/auth/forgot-password` — Solicitar reset por email
- [x] ✅ `POST /api/auth/reset-password` — Restablecer con token

## Fase 4: API — Calendarios

- [x] ✅ `GET /api/calendars` — Listar calendarios publicos
- [x] ✅ `GET /api/calendars/[slug]` — Obtener calendario + personas + availability
- [x] ✅ `POST /api/calendars/[slug]/availability` — Marcar persona+fecha
- [x] ✅ `POST /api/calendars/[slug]/batch` — Marcar rango de dias
- [x] ✅ `DELETE /api/calendars/[slug]/clear` — Limpiar todo
- [x] ✅ `POST /api/calendars` — Crear calendario (slug auto-generado)
- [x] ✅ `DELETE /api/calendars/[slug]` — Eliminar calendario (solo creador)
- [x] ✅ `PATCH /api/calendars/[slug]` — Editar nombre, año, meses

## Fase 5: API — Personas

- [x] ✅ `GET /api/calendars/[slug]/people` — Listar miembros
- [x] ✅ `POST /api/calendars/[slug]/people` — Añadir por username
- [x] ✅ `DELETE /api/calendars/[slug]/people/[personId]` — Expulsar/salirse
- [x] ✅ `PATCH /api/calendars/[slug]/people/[personId]` — Cambiar alias/rol

## Fase 6: API — Eventos y Planes

- [x] ✅ `GET /api/calendars/[slug]/events` — Listar eventos personalizados
- [x] ✅ `POST /api/calendars/[slug]/events` — Crear evento
- [x] ✅ `DELETE /api/calendars/[slug]/events/[id]` — Eliminar evento
- [x] ✅ `GET /api/calendars/[slug]/plans` — Listar planes de grupo
- [x] ✅ `POST /api/calendars/[slug]/plans` — Crear plan
- [x] ✅ `POST /api/calendars/[slug]/plans/[id]/respond` — Responder a plan

## Fase 7: Frontend — Login y Dashboard

- [x] ✅ **Pagina `/login`** — Formulario con username + password
- [x] ✅ **Proteccion de rutas** — Redirigir a login si no hay sesion
- [x] ✅ **Dashboard** — Lista de calendarios del usuario con rol + botón crear

## Fase 8: Frontend — Vistas del calendario

- [x] ✅ **`Nav.tsx`** — Navegacion desktop + mobile
- [x] ✅ **`SetupView.tsx`** — Configurar grupo, personas, códigos, alias
- [x] ✅ **`CalendarView.tsx`** — Contenedor con tabs (Cuadricula + Tabla + Semana)
- [x] ✅ **`GridView.tsx`** — Cuadricula semanal con chips + drag batch
- [x] ✅ **`TableView.tsx`** — Tabla fechas x personas con badges
- [x] ✅ **`WeekView.tsx`** — Vista semanal con drag batch
- [x] ✅ **`ResumenView.tsx`** — Dashboard: stats + umbrales + distribucion
- [x] ✅ **`BatchModal.tsx`** — Modal para marcar rango de dias
- [x] ✅ **`PlanesView.tsx`** — Vista de planes de grupo con respuestas
- [x] ✅ **`EventosView.tsx`** — Vista de eventos personalizados con horarios

## Fase 9: Email e Invitaciones

- [x] ✅ **`src/lib/email.ts`** — 3 funciones (welcome, invitation, reset)
- [x] ✅ **Email de bienvenida** al registrarse
- [x] ✅ **Email de invitación** al añadir persona al calendario
- [x] ✅ **Email de recuperación** de contraseña
- [x] ✅ **Invitación por username** desde SetupView

## Fase 10: Despliegue

- [x] ✅ **Inicializar Git** (`git init`)
- [x] ✅ **Crear repositorio en GitHub**
- [ ] ⬜ **Configurar Vercel** — Conectar con GitHub
- [ ] ⬜ **Variables de entorno en Vercel** — 6 variables
- [ ] ⬜ **Deploy** — Primer deploy exitoso
- [ ] ⬜ **JWT_SECRET real** (no el de desarrollo)

## ⬜ Pendiente aún

- [ ] **Mobile-First responsive** — GridView adaptativo, touch targets 44×44px
- [ ] **Modo "pintar" toggle** — Activar/desactivar arrastre
- [ ] **Auto-link de invitaciones** al registrarse
- [ ] **ThemeToggle** — Dark/light mode
- [ ] **Página 404** personalizada
- [ ] **Loading skeletons** (vs texto "Cargando...")
- [ ] **Toasts/notificaciones**
- [ ] **Tests** — API y componentes
- [ ] **Paginación**
- [ ] **Sentry** — Monitoreo de errores
- [ ] **Analytics**
