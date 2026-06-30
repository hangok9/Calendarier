# Flujos principales

## Login y registro

```
USUARIO                    FRONTEND                     API                  DB
   │                         │                          │                    │
   ├─ Registro ─────────────► POST /api/auth/register ──► INSERT users ──────►
   │                         │                          │ link people        │
   │                         │                          │ createSession()    │
   │                         │                          │ sendWelcomeEmail() │
   │                         │◄─────── { success } ─────┤                    │
   │                         │                          │                    │
   ├─ Login ────────────────► POST /api/auth/login ─────► SELECT users ──────►
   │                         │                          │ bcrypt.compare()   │
   │                         │                          │ createSession()    │
   │                         │◄─────── { success } ─────┤                    │
   │                         │                          │                    │
   │  (la sesión se guarda en cookie httpOnly, dura 365 días)
```

## Dashboard / Ver calendarios

```
   │                         │                          │                    │
   ├─ GET /dashboard ───────► GET /api/auth/me ────────► SELECT user ───────►
   │                         │◄─── { user, calendars } ─┤                    │
   │                         │                          │                    │
   ├─ fetch calendarios ────► GET /api/calendars ───────► SELECT calendars ──►
   │                         │                          │ SELECT people      │
   │                         │                          │ (para membership)  │
   │                         │◄─── [{slug, name,        │                    │
   │                         │       membership}] ──────┤                    │
```

## Crear calendario

```
   │                         │                          │                    │
   ├─ Rellenar modal ───────► POST /api/calendars ─────► INSERT calendars ──►
   │  nombre, año, meses,   │                          │ INSERT people      │
   │  apodo propio           │                          │ (como manager)    │
   │                         │◄────── { calendar } ─────┤                    │
   │  Redirige a:            │                          │                    │
   │  /calendario/[slug]     │                          │                    │
```

## Ver calendario / marcar disponibilidad

```
   │                         │                          │                    │
   ├─ Entra al calendario───► GET /api/calendars/[slug] ► SELECT calendar ──►
   │                         │                          │ SELECT people     │
   │                         │                          │ SELECT avail      │
   │                         │◄── {calendar, people,    │                    │
   │                         │      availability,       │                    │
   │                         │      my_role, person_id} │                    │
   │                         │                          │                    │
   ├─ Click en celda ───────► POST /api/calendars/[slug]                     │
   │  (o arrastra)           │      /availability        │                    │
   │                         │  o /batch                │ UPSERT availability│
   │                         │◄────── { success } ──────┤                    │
   │  Se refresca la vista   │GET /api/calendars/[slug] ►                    │
```

## Añadir persona al calendario (solo manager)

```
   │                         │                          │                    │
   ├─ Escribe username ─────► POST /api/calendars/[slug]                    │
   │                         │      /people              │                    │
   │                         │                          │ Verificar manager │
   │                         │                          │ Buscar user        │
   │                         │                          │ INSERT people      │
   │                         │                          │ sendInvitation()   │
   │                         │◄────── { person } ───────┤                    │
```

## Expulsar persona (solo manager)

```
   │                         │                          │                    │
   ├─ Click "Expulsar" ─────► DELETE /api/calendars/[slug]                  │
   │                         │      /people/[personId]   │                    │
   │                         │                          │ Verificar manager │
   │                         │                          │ Proteger manager  │
   │                         │                          │ DELETE people     │
   │                         │◄────── { success } ──────┤                    │
```

## Recuperar contraseña

```
   │                         │                          │                    │
   ├─ /forgot-password ─────► POST /api/auth/forgot ────► Buscar user       │
   │  Introduce email        │    -password              │ (no revela si     │
   │                         │                          │  existe o no)     │
   │                         │                          │ Generar JWT (1h)  │
   │                         │                          │ sendResetEmail()  │
   │                         │◄──── { success } ────────┤                    │
   │                         │                          │                    │
   ├─ Click enlace email ───► /reset-password?token=xxx                     │
   │  Nueva contraseña       │                          │                    │
   │                         ├─ POST /api/auth/reset ───► Verificar JWT     │
   │                         │    -password             │ UPDATE password   │
   │                         │◄──── { success } ────────┤                    │
   │  Redirige a /           │                          │                    │
```

## Variables de entorno

Archivo `.env.local` (no se sube a git):

```
NEXT_PUBLIC_SUPABASE_URL=      # URL de Supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY= # Anon key de Supabase
RESEND_API_KEY=                # API key de Resend (email)
JWT_SECRET=                    # Secreto para firmar JWT
BASE_URL=                      # http://localhost:3000 (dev) / https://... (prod)
```

En Vercel (Settings → Environment Variables) hay que poner las mismas excepto `NEXT_PUBLIC_*` que ya están.
