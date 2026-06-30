# Estructura del proyecto

```
calendario-web/
├── src/
│   ├── app/                     # Next.js App Router
│   │   ├── page.tsx             # Login
│   │   ├── register/page.tsx    # Registro de usuario
│   │   ├── login/page.tsx       # Redirige a /
│   │   ├── dashboard/page.tsx   # Panel principal: lista de calendarios + crear
│   │   ├── account/page.tsx     # Email + cambio de contraseña
│   │   ├── forgot-password/page.tsx   # Formulario email para reset
│   │   ├── reset-password/page.tsx    # Formulario nueva contraseña (con token)
│   │   ├── calendario/[slug]/page.tsx # Vista de un calendario
│   │   └── api/
│   │       ├── auth/
│   │       │   ├── me/route.ts         # GET: sesión actual, PATCH: email
│   │       │   ├── login/route.ts      # POST: login
│   │       │   ├── register/route.ts   # POST: registro + link people existentes
│   │       │   ├── logout/route.ts     # POST: destruir sesión
│   │       │   ├── change-password/route.ts # POST: cambiar contraseña
│   │       │   ├── forgot-password/route.ts # POST: enviar email reset
│   │       │   └── reset-password/route.ts  # POST: reset con token
│   │       └── calendars/
│   │           ├── route.ts            # GET: listar, POST: crear
│   │           └── [slug]/
│   │               ├── route.ts        # GET: calendario+miembros, DELETE, PATCH
│   │               ├── availability/route.ts  # POST: marcar disponibilidad
│   │               ├── batch/route.ts          # POST: marcar rango de fechas
│   │               ├── clear/route.ts          # POST: limpiar disponibilidad
│   │               ├── people/route.ts         # GET: miembros, POST: añadir
│   │               ├── people/[personId]/route.ts # DELETE: expulsar, PATCH: alias/rol
│   │               ├── events/route.ts         # GET/POST eventos
│   │               ├── events/[id]/route.ts    # DELETE evento
│   │               ├── plans/route.ts          # GET/POST planes
│   │               └── plans/[planId]/respond/route.ts # POST: responder plan
│   │
│   ├── components/
│   │   ├── Nav.tsx              # Barra superior con tabs
│   │   ├── CalendarView.tsx     # Contenedor: tabs Grid/Table + BatchModal
│   │   ├── GridView.tsx         # Cuadrícula mensual (mobile-first, drag&drop)
│   │   ├── TableView.tsx        # Tabla diaria (sticky columns, touch targets)
│   │   ├── SetupView.tsx        # Gestión de personas, alias, códigos
│   │   ├── BatchModal.tsx       # Modal para marcar rango de fechas
│   │   ├── ResumenView.tsx      # Estadísticas, desglose por persona, cobertura diaria
│   │   ├── PlanesView.tsx       # Planes de grupo
│   │   └── EventosView.tsx      # Eventos personalizados
│   │
│   ├── lib/
│   │   ├── supabase.ts          # Cliente Supabase
│   │   ├── auth.ts              # JWT: crear/obtener/destruir sesión
│   │   ├── email.ts             # Resend: welcome, invitation, reset
│   │   └── constants.ts         # Códigos, colores, nombres de meses
│   │
│   └── types/
│       └── index.ts             # Interfaces TypeScript
│
├── supabase/
│   ├── schema.sql               # Esquema completo + seed data
│   ├── migration.sql            # Migración: cuentas de usuario
│   ├── migration2.sql           # Migración: roles, alias, created_by
│   ├── migration3.sql           # Migración: pepe como creador
│   └── SEED_DATA.md             # Usuarios, contraseñas, calendarios
│
├── contexto/                    # Esta documentación
│
├── .env.local                   # Variables locales (no se sube a git)
├── next.config.ts
├── package.json
└── tsconfig.json
```
