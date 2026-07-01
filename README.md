# Calenadarier

Aplicación web de gestión de disponibilidad para grupos de trabajo (verano 2026).
Originalmente una app de Python + Excel + Apps Script, migrada a Next.js 16 + Supabase + Vercel.

---

## Estado del proyecto

| Fase | Estado |
|------|--------|
| Proyecto Next.js + Tailwind + TypeScript | ✅ |
| Base de datos (6 tablas) | ✅ |
| Seed data (3 calendarios, 18 usuarios, 21 personas) | ✅ |
| API completa (18 endpoints) | ✅ |
| Frontend: Login / Dashboard / Account / Register | ✅ |
| Frontend: Vistas calendario (cuadrícula, tabla, resumen) | ✅ |
| Frontend: Planes de grupo | ✅ |
| Frontend: Eventos personalizados | ✅ |
| Git + GitHub | ✅ |
| Auth con JWT + bcrypt | ✅ |

---

## Arquitectura

### Base de datos (Supabase)

6 tablas:

| Tabla | Descripción |
|-------|-------------|
| `users` | Cuentas de usuario (username + email + password hash) |
| `calendars` | Grupos (grupo, barcelona, cachorritas) |
| `people` | Miembros de cada grupo, vinculados a `users` |
| `availability` | Disponibilidad (persona + fecha + código) |
| `custom_events` | Eventos con horarios flexibles |
| `group_plans` | Planes de grupo (fechas + respuestas) |
| `plan_responses` | Respuestas a planes (accept/decline/maybe) |

### API (21 endpoints)

**Auth (7):**
- `POST /api/auth/login` — Iniciar sesión (username + password)
- `POST /api/auth/register` — Crear cuenta (email + username + password)
- `POST /api/auth/logout` — Cerrar sesión
- `GET /api/auth/me` — Ver sesión actual + calendarios del usuario
- `POST /api/auth/change-password` — Cambiar contraseña
- `POST /api/auth/forgot-password` — Solicitar restablecimiento por email
- `POST /api/auth/reset-password` — Restablecer contraseña con token

**Calendarios (6):**
- `GET /api/calendars` — Listar calendarios públicos
- `POST /api/calendars` — Crear calendario (slug auto-generado, creador = manager)
- `GET /api/calendars/[slug]` — Obtener calendario + personas + availability
- `DELETE /api/calendars/[slug]` — Eliminar calendario (solo creador)
- `PATCH /api/calendars/[slug]` — Editar nombre, año, meses

**Disponibilidad (3):**
- `POST /api/calendars/[slug]/availability` — Marcar disponibilidad
- `POST /api/calendars/[slug]/batch` — Marcar rango de días (batch)
- `DELETE /api/calendars/[slug]/clear` — Limpiar toda la disponibilidad

**Personas (4):**
- `GET /api/calendars/[slug]/people` — Listar miembros (solo manager)
- `POST /api/calendars/[slug]/people` — Añadir persona por username
- `DELETE /api/calendars/[slug]/people/[personId]` — Expulsar o salirse
- `PATCH /api/calendars/[slug]/people/[personId]` — Cambiar alias/rol

**Eventos (3):**
- `GET /api/calendars/[slug]/events` — Listar eventos
- `POST /api/calendars/[slug]/events` — Crear evento
- `DELETE /api/calendars/[slug]/events/[id]` — Eliminar evento

**Planes (3):**
- `GET /api/calendars/[slug]/plans` — Listar planes
- `POST /api/calendars/[slug]/plans` — Crear plan
- `POST /api/calendars/[slug]/plans/[planId]/respond` — Responder a plan

### Frontend (9 páginas)

| Ruta | Descripción |
|------|-------------|
| `/` | Login (username + password + 👁️ toggle) |
| `/login` | Redirige a `/` |
| `/register` | Crear cuenta (email + username + password + confirm) |
| `/forgot-password` | Solicitar restablecimiento de contraseña |
| `/reset-password` | Restablecer contraseña con token |
| `/dashboard` | Panel con calendarios del usuario (crear, ver rol) |
| `/account` | Cambiar contraseña |
| `/calendario/[slug]` | Vista principal del calendario (5 subvistas) |

### Componentes (11)

| Componente | Vista |
|-----------|-------|
| `Nav.tsx` | Navegación desktop + mobile con Dashboard/Cuenta |
| `SetupView.tsx` | Configuración del grupo + personas + códigos + alias |
| `CalendarView.tsx` | Contenedor con tabs Cuadrícula/Tabla/Semana |
| `GridView.tsx` | Cuadrícula semanal interactiva con drag batch |
| `TableView.tsx` | Tabla diaria con badges coloreados |
| `WeekView.tsx` | Vista semanal con drag batch |
| `ResumenView.tsx` | Dashboard con stats, umbrales, distribución |
| `BatchModal.tsx` | Modal para marcar rango de días |
| `PlanesView.tsx` | Crear y responder a planes de grupo |
| `EventosView.tsx` | Eventos personalizados con horarios flexibles |
| `ThemeToggle.tsx` | No implementado (pendiente) |

---

## Flujo de usuario

```
1. Visita /
2. Inicia sesión con username + contraseña
3. Entra a /dashboard
4. Ve sus calendarios (grupo, barcelona, cachorritas...)
5. Hace clic en uno → /calendario/[slug]
6. Dentro del calendario puede:
   - ⚙ Configurar: ver personas y leyenda de códigos
   - ▦ Calendario: marcar su disponibilidad (cuadrícula o tabla)
   - ◈ Resumen: métricas del grupo
   - 📋 Planes: crear/responder planes
   - 📅 Eventos: crear eventos con horarios
7. Puede volver al Dashboard o ir a su Cuenta desde el Nav
```

---

## Seed data

**18 usuarios** con contraseña `nombre+2026`:

| Usuario | Calendarios | Contraseña |
|---------|------------|------------|
| elias | Grupo, Cachorritas | elias2026 |
| ponsa | Grupo | ponsa2026 |
| ferran | Grupo | ferran2026 |
| august | Grupo | august2026 |
| joan | Grupo | joan2026 |
| grau | Grupo | grau2026 |
| pol | Grupo | pol2026 |
| resi | Barcelona | resi2026 |
| oscar | Barcelona | oscar2026 |
| clara | Barcelona | clara2026 |
| anna | Barcelona | anna2026 |
| pepe | Grupo, Barcelona, Cachorritas | pepe2026 |
| ivan | Barcelona | ivan2026 |
| yeray | Barcelona | yeray2026 |
| susanna | Cachorritas | susanna2026 |
| zua | Cachorritas | zua2026 |
| anto | Cachorritas | anto2026 |
| cris | Cachorritas | cris2026 |

Los nombres de usuario se corresponden con los nombres en `people` (en minúscula).
PEPE y ELIAS aparecen en varios calendarios — la misma cuenta de usuario accede a todos.
> Usuario `merino` eliminado en migration4 (PEPE ocupa su lugar en Grupo).

---

## Variables de entorno (Vercel)

| Variable | Descripción |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave anónima (pública) |
| `SUPABASE_SERVICE_KEY` | Clave de servicio (bypassea RLS) |
| `JWT_SECRET` | Secreto para firmar JWT |
| `RESEND_API_KEY` | API key de Resend para envío de emails |
| `BASE_URL` | URL base (http://localhost:3000 en dev) |

---

## Pendiente

### Inmediato
- [ ] **Configurar Vercel** si no está hecho:
  1. Ir a [vercel.com/new](https://vercel.com/new)
  2. Importar `hangok9/Calendarier`
  3. Root directory: `calendario-web/`
  4. Añadir las 6 env vars
  5. Deploy
- [ ] **Configurar RESEND_API_KEY en Vercel** para emails en producción

### Mejoras pendientes
- [ ] **Mobile-First responsive** — GridView adaptativo, touch targets 44×44px, bottom sheets
- [ ] **Modo "pintar" toggle** — Activar/desactivar arrastre en grid
- [ ] **Auto-link de invitaciones** — Sistema explícito de invitaciones pendientes al registrarse
- [ ] **Añadir ThemeToggle** — Dark/light mode
- [ ] **Página de error 404** personalizada
- [ ] **Loading skeletons** en lugar de texto "Cargando..."
- [ ] **Toasts/notificaciones** para acciones (guardado, error, éxito)
- [ ] **Tests** — Unit tests de API routes y componentes
- [ ] **Paginación** en calendarios con muchos datos
- [ ] **Producción** — JWT_SECRET real, dominio personalizado, Sentry, analytics

---

## Archivos clave

```
Calenadarier/
├── supabase/
│   ├── schema.sql                   # Esquema completo + seed
│   ├── migration.sql                # Migración 1: usuarios
│   ├── migration2.sql               # Migración 2: roles, alias, creador
│   ├── migration3.sql               # Migración 3: pepe creador
│   ├── migration4.sql               # Migración 4: apellidos, nombres reales, eliminar merino
│   └── SEED_DATA.md                 # Seed data en formato legible
├── calendario-web/                  # Proyecto Next.js
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx                    # Login
│   │   │   ├── layout.tsx                  # Layout raíz
│   │   │   ├── globals.css                 # Estilos globales (800+ líneas)
│   │   │   ├── login/page.tsx              # Redirige a /
│   │   │   ├── register/page.tsx           # Crear cuenta
│   │   │   ├── forgot-password/page.tsx    # Solicitar reset
│   │   │   ├── reset-password/page.tsx     # Reset con token
│   │   │   ├── dashboard/page.tsx          # Panel de calendarios
│   │   │   ├── account/page.tsx            # Cambiar contraseña
│   │   │   ├── calendario/[slug]/page.tsx  # Vista principal (5 subvistas)
│   │   │   └── api/
│   │   │       ├── auth/                   # 7 endpoints de auth
│   │   │       └── calendars/              # 16 endpoints de calendarios
│   │   ├── components/                     # 11 componentes React
│   │   ├── lib/                            # auth, supabase, constants, email, initials
│   │   └── types/index.ts                  # Tipos TypeScript
│   └── next.config.ts                      # Config con Turbopack
├── web/index.html                          # Template HTML original (referencia)
└── datos/                                  # Credenciales (no incluir en git)
```
