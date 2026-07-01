# Mejoras del Backend — Calendarier

## Cambios automáticos (ya implementados)

Estos cambios ya están hechos en el código. Solo haz `git add`, `git commit` y `git push`.

### 1. Seguridad en auth (`src/lib/auth.ts`)
- ❌ Eliminado el JWT fallback hardcodeado (`"calendarier-jwt-secret-change-in-production-2026"`)
- ❌ Lanza error si `JWT_SECRET` no está definido como env var
- ✅ `getSession()` ahora usa `React.cache()` para deduplicar dentro de una misma request
- ✅ Añadido `createResetToken()` y `verifyResetToken()` con `RESET_TOKEN_SECRET` separado

### 2. Middleware global (`src/middleware.ts`)
- ✅ Nuevo middleware que protege todas las rutas `/api/*` automáticamente
- ✅ Permite acceso público a: login, register, forgot-password, reset-password, GET /api/calendars

### 3. Error handling centralizado (`src/lib/errors.ts`)
- ✅ Nueva función `tryCatch(fn)` que envuelve handlers y captura errores
- ✅ Funciones helper: `unauthorized()`, `forbidden()`, `notFound()`, `badRequest()`, `conflict()`
- ✅ `apiError(err)` convierte cualquier error en `NextResponse`

### 4. Validación con Zod (`src/lib/validate.ts`)
- ✅ Schemas para todos los endpoints (login, register, change-password, etc.)
- ✅ Función `validate(schema, data)` que valida y lanza error si falla

### 5. Servicio de calendario (`src/services/calendar.service.ts`)
- ✅ `requireCalendarAccess(slug, session, role?)` — reemplaza la triple query repetida en 11 rutas
- ✅ `getManagerAccess(slug, session)` — para endpoints solo-manager
- ✅ `generateUniqueSlug(name)` — genera slugs únicos
- ✅ `enrichPeople(people)` — añade display_name
- ✅ `deduplicateCalendars(calendars)` — elimina duplicados

### 6. Rutas API refactorizadas (18 archivos)
- ✅ Eliminados ~200 líneas de try/catch boilerplate
- ✅ Eliminadas validaciones manuales (reemplazadas por Zod)
- ✅ Eliminada la triple query calendario + persona repetida
- ✅ Reset password usa `RESET_TOKEN_SECRET` separado
- ✅ Queries paralelizadas con `Promise.all()` donde aplica

---

## Cambios manuales necesarios

### 🔴 1. Configurar variables de entorno en producción

En **Vercel** (o donde esté desplegado) y en tu `.env.local`:

```bash
# IMPRESCINDIBLE: Cambia esto por un secreto REAL y LARGO
JWT_SECRET=una-frase-muy-larga-y-segura-con-numeros-y-simbolos-18374

# IMPRESCINDIBLE: Token separado para reset de password
RESET_TOKEN_SECRET=otra-frase-distinta-para-reset-con-caracteres-92736

# Opcional pero recomendado: añadir rate limiting
# (requiere Vercel KV o similar)
```

⚠️ **IMPORTANTE**: El `JWT_SECRET` actual en `.env.local` es `calendarier-jwt-secret-change-in-production-2026`. Cámbialo ANTES de desplegar a producción. Si lo cambias, todas las sesiones existentes quedarán invalidadas (los usuarios tendrán que volver a hacer login).

---

### 🟡 2. Ejecutar RLS y mejoras en Supabase

Abre el **SQL Editor** de Supabase (https://supabase.com/dashboard/project/ddtlaewydeheestowdmy/sql/new) y pega el contenido de `supabase/rls.sql`.

Este archivo:
- Habilita RLS en todas las tablas
- Crea políticas de acceso row-level
- Añade índices compuestos para rendimiento
- Crea tabla `audit_log` para auditoría

**Nota importante sobre RLS:** La app usa su propio sistema de auth (JWT + cookies), no Supabase Auth. Las políticas RLS con `auth.uid()` funcionan con Supabase Auth. Si no migras a Supabase Auth, las RLS estarán definidas pero las API routes seguirán usando `service_role` que bypassea RLS. Esto no es inseguro — solo significa que el control de acceso sigue siendo en app code.

---

### 🟢 3. Verificar que funciona

```bash
cd calendario-web

# Instalar dependencias (Zod ya está)
npm install

# Compilar
npm run build

# Iniciar dev
npm run dev
```

---

### 🔵 4. Para el futuro (próximos pasos recomendados)

| Prioridad | Mejora | Dificultad |
|-----------|--------|------------|
| Alta | Migrar a Supabase Auth (RLS real) | Media |
| Alta | Rate limiting con Vercel KV | Baja |
| Media | Tests de integración con Playwright | Media |
| Media | Añadir logging estructurado | Baja |
| Baja | Migraciones manejadas con `supabase migration` | Baja |

---

## Resumen de archivos modificados/creados

```
NUEVOS:
  calendario-web/src/lib/errors.ts         ← Error handling centralizado
  calendario-web/src/lib/validate.ts       ← Schemas Zod
  calendario-web/src/middleware.ts          ← Auth middleware global
  calendario-web/src/services/calendar.service.ts  ← Servicio de calendario
  calendario-web/.env.example              ← Template de env vars
  supabase/rls.sql                         ← RLS + índices + audit_log

MODIFICADOS:
  calendario-web/src/lib/auth.ts           ← Seguridad + React.cache()
  calendario-web/src/app/api/auth/login/route.ts
  calendario-web/src/app/api/auth/register/route.ts
  calendario-web/src/app/api/auth/logout/route.ts
  calendario-web/src/app/api/auth/me/route.ts
  calendario-web/src/app/api/auth/change-password/route.ts
  calendario-web/src/app/api/auth/forgot-password/route.ts
  calendario-web/src/app/api/auth/reset-password/route.ts
  calendario-web/src/app/api/calendars/route.ts
  calendario-web/src/app/api/calendars/[slug]/route.ts
  calendario-web/src/app/api/calendars/[slug]/availability/route.ts
  calendario-web/src/app/api/calendars/[slug]/batch/route.ts
  calendario-web/src/app/api/calendars/[slug]/clear/route.ts
  calendario-web/src/app/api/calendars/[slug]/events/route.ts
  calendario-web/src/app/api/calendars/[slug]/events/[id]/route.ts
  calendario-web/src/app/api/calendars/[slug]/plans/route.ts
  calendario-web/src/app/api/calendars/[slug]/plans/[planId]/respond/route.ts
  calendario-web/src/app/api/calendars/[slug]/people/route.ts
  calendario-web/src/app/api/calendars/[slug]/people/[personId]/route.ts
```
