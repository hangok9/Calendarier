# Plan de mejora del frontend — Calenadarier

## Skills instaladas

| Skill | Propósito |
|-------|-----------|
| `vercel-react-best-practices` | Optimización React/Next.js (Server Components, data fetching, bundle) |
| `vercel-react-view-transitions` | Transiciones de vista con ViewTransition API |
| `accessibility-a11y` | WCAG accesibilidad (ARIA, teclado, modales, contraste) |
| `react-hook-form-zod` | Formularios tipados con react-hook-form + Zod |
| `animate` | Animaciones CSS + Framer Motion |
| `frontend-ui` | Patrones UI enterprise (Tailwind v4, shadcn/ui, SaaS) |
| `shadcn` | Componentes shadcn/ui |
| `webapp-testing` | Testing E2E con Playwright |
| `improve-codebase-architecture` | Escaneo arquitectónico |
| `supabase` | Gestión de Supabase |
| `supabase-postgres-best-practices` | Optimización PostgreSQL |
| `deploy-to-vercel` | Deploy a Vercel |

---

## Fase 1: Forms con `react-hook-form-zod`

Refactorizar todos los formularios vanilla a react-hook-form + Zod schemas.

### 1.1 Login (`app/page.tsx`)
- [ ] Instalar `react-hook-form`, `@hookform/resolvers`
- [ ] Schema Zod: `loginSchema` (ya existe en validate.ts)
- [ ] useForm + zodResolver
- [ ] Validación cliente: username required, password required
- [ ] Mostrar errores con `role="alert"` y `aria-invalid`
- [ ] Estado loading en botón submit
- [ ] Show/hide password toggle

### 1.2 Register (`app/register/page.tsx`)
- [ ] Schema Zod: `registerSchema` (ya existe)
- [ ] useForm + zodResolver
- [ ] Validación: email opcional, username required, password min 6, confirm match
- [ ] `aria-invalid` en cada campo
- [ ] Error display con `role="alert"`

### 1.3 Forgot Password (`app/forgot-password/page.tsx`)
- [ ] Schema Zod: `forgotPasswordSchema`
- [ ] useForm
- [ ] Estado "sent" con feedback visual

### 1.4 Reset Password (`app/reset-password/page.tsx`)
- [ ] Schema Zod: `resetPasswordSchema`
- [ ] Validación: password min 6, confirm match
- [ ] Manejo de token desde searchParams

### 1.5 Account — Email (`app/account/page.tsx`)
- [ ] Schema Zod: `updateProfileSchema`
- [ ] Formulario inline con useForm

### 1.6 Account — Change Password (`app/account/page.tsx`)
- [ ] Schema Zod: `changePasswordSchema`
- [ ] Validación: old password, new password min 6, confirm match
- [ ] Manejo de errores y éxito independientes

### 1.7 SetupView — Add Person (`components/SetupView.tsx`)
- [ ] Schema Zod: `addPersonSchema`
- [ ] Formulario inline para añadir persona por username
- [ ] Mostrar errores del servidor

### 1.8 Batch Modal (`components/BatchModal.tsx`)
- [ ] Schema Zod: `batchAvailabilitySchema`
- [ ] useForm con selects y date inputs
- [ ] Modal con validación de fechas

### 1.9 Dashboard — Create Calendar (`app/dashboard/page.tsx`)
- [ ] Schema Zod: `createCalendarSchema`
- [ ] Formulario en modal con selector de meses
- [ ] Validación: name required, myName required

### 1.10 EventosView — Create Event (`components/EventosView.tsx`)
- [ ] Schema Zod: `createEventSchema`
- [ ] Formulario inline

### 1.11 PlanesView — Create Plan (`components/PlanesView.tsx`)
- [ ] Schema Zod: `createPlanSchema`
- [ ] Formulario inline

---

## Fase 2: Accesibilidad con `accessibility-a11y`

### 2.1 GridView — Navegación por teclado
- [ ] Person-chip `div` → `role="button"`, `tabIndex={0}`, `onKeyDown` (Enter/Space)
- [ ] `role="grid"` en el contenedor, `role="gridcell"` en cada celda
- [ ] `aria-label` en botones "Anterior"/"Siguiente" mes
- [ ] `aria-live` para feedback de cambios

### 2.2 WeekView — Navegación por teclado
- [ ] Initials `span` → `role="button"`, `tabIndex={0}`, `onKeyDown`
- [ ] `aria-label` en botones de navegación (mes anterior/siguiente, semana anterior/siguiente)
- [ ] Estado de botones con `aria-disabled` en vez de `visibility: hidden`

### 2.3 TableView — Celdas clickeables
- [ ] `td` con `onClick` → `role="button"`, `tabIndex={0}`, `onKeyDown`
- [ ] `aria-label` en columnas

### 2.4 BatchModal — ARIA modal
- [ ] `role="dialog"`, `aria-modal="true"`, `aria-labelledby`
- [ ] Focus trap: al abrir, enfocar primer input; al cerrar, restaurar foco
- [ ] Escape key para cerrar
- [ ] `aria-label` en overlay

### 2.5 Create Calendar modal — ARIA modal
- [ ] `role="dialog"`, `aria-modal="true"`, `aria-labelledby`
- [ ] Focus management
- [ ] Escape key

### 2.6 Formularios — Labels y ARIA
- [ ] `id` + `htmlFor` en todos los inputs (reemplazar wrapping implícito)
- [ ] `aria-describedby` para hints/ayuda
- [ ] `aria-live="polite"` en contenedores de error

### 2.7 Skip-to-content link
- [ ] Añadir skip link al inicio de `body` en `layout.tsx`

### 2.8 prefers-reduced-motion
- [ ] Respetar `prefers-reduced-motion` en animaciones CSS

---

## Fase 3: Animaciones con `animate` + `view-transitions`

- [ ] Transiciones entre tabs (setup/calendario/resumen/planes/eventos) con ViewTransition API
- [ ] Shared element: indicador de tab activo
- [ ] Stagger list con Framer Motion (reemplazar CSS `.stagger`)
- [ ] Batch modal: fade+slide con `AnimatePresence`
- [ ] Skeleton loading con shimmer animado
- [ ] `prefers-reduced-motion` en todas las animaciones

---

## Fase 4: Performance con `vercel-react-best-practices`

- [ ] `Promise.all()` en `loadData()` (ahora en secuencia fetch → fetch)
- [ ] Index Map en `getAvailCode()` (O(n) → O(1)) en GridView
- [ ] Eliminar barrel imports
- [ ] `next/dynamic` en BatchModal
- [ ] Component splitting: Server Components donde posible
- [ ] React.cache() para sesión en server (lib/auth.ts)

---

## Fase 5: UI/UX con `frontend-ui` + `shadcn`

- [ ] Dark mode toggle funcional (CSS ya existe, falta UI)
- [ ] Reemplazar inline styles con clases Tailwind
- [ ] Componentizar modales con shadcn Dialog
- [ ] Tablas responsivas con shadcn Table
- [ ] Estados vacío/error/loading unificados (State Trio)

---

## Fase 6: Testing con `webapp-testing`

- [ ] E2E: Login flow
- [ ] E2E: CRUD calendario
- [ ] E2E: Marcar disponibilidad (click + drag)
- [ ] E2E: Batch modal
- [ ] E2E: Planes (crear, responder)
- [ ] A11y audit automatizado

---

## Orden de ejecución recomendado

```
Fase 1 (Forms)        → 1-2h   ← EMPEZANDO AHORA
Fase 2 (Accesibilidad) → 2-3h   ← EMPEZANDO AHORA
Fase 4 (Performance)   → 1h
Fase 3 (Animaciones)   → 2-3h
Fase 5 (UI/UX)         → 3-4h
Fase 6 (Testing)       → 2-3h
```

**Total estimado: ~12-16h**
