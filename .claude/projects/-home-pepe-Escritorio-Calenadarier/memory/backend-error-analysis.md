---
name: backend-error-analysis
description: Detailed enumeration of possible error conditions in Calenadarier backend API routes, including validation, auth, authorization, database, and unexpected errors, with HTTP status codes, causes, and mitigation suggestions
metadata:
  type: reference
---

# Backend Error Analysis – Calenadarier

This document systematically lists error conditions that can be returned by the Calenadarier backend (Next.js API routes) to clients. It covers:

* Input validation errors (Zod schemas)
* Authentication & session errors
* Authorization (access‑control) errors
* Database/Supabase errors (constraint violations, RLS, connection issues)
* Unexpected exceptions and the generic 500 handler

For each error we note the likely HTTP status code, the root cause, and recommendations for handling/preventing the error.

--- 

## 1. Common Error‑Handling Wrapper

All API routes use the helper:

```ts
import { tryCatch } from "@/lib/errors";

export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  return tryCatch(async () => {
    // handler logic …
    if (condition) throw notFound('Resource not found');
    return NextResponse.json({ success: true, data });
  });
}
```

`tryCatch` catches any thrown error and passes it to `apiError` (see `src/lib/errors.ts`).  

* `AppError` subclasses (`unauthorized`, `forbidden`, `notFound`, `badRequest`, `conflict`) preserve their `statusCode` and message.  
* Plain `Error` instances with message `"No autorizado"` are mapped to 401.  
* Any other error results in a 500 response with the generic message `"Error interno del servidor"` (while the original error is logged server‑side).

--- 

## 2. Validation Errors (Zod)

Located in `src/lib/validate.ts`. Each route validates its payload with a dedicated schema.

| Error | Cause | HTTP Status (via `badRequest`) | Example Message | Prevention / Handling |
|-------|-------|-------------------------------|-----------------|-----------------------|
| Missing required field (e.g., `username`) | Client omits field or sends `null`/`undefined` | 400 Bad Request | `"Usuario requerido"` | Ensure client sends all required fields; Zod validates automatically. |
| Wrong type (e.g., `person_id` not a UUID) | Non‑UUID string | 400 | `"person_id invalido"` | Use Zod `uuid()`; client should generate proper UUIDs. |
| Invalid date format (not `YYYY‑MM‑DD`) | Malformed or empty date string | 400 | `"Fecha requerida"` | Enforce ISO date on client; Zod `string().min(1)`. |
| Password mismatch (`registerSchema`) | `password !== confirmPassword` | 400 | `"Las contrasenas no coinciden"` | Client‑side & server‑side validation. |
| Invalid email (when provided) | Malformed email | 400 | `"Email invalido"` | Zod `email()` validator. |
| Invalid shift `code` (not in `CODES`) | Undefined shift code | 400 (custom) | `"Codigo de turno invalido"` | Validate against `CODES` enum in schema or service layer. |
| `start_date` > `end_date` in batch request | Logical error | 400 (custom refinement) | (custom) | Add refinement: `.refine(d => new Date(d.start_date) <= new Date(d.end_date))`. |
| Duplicate unique key (e.g., existing username on registration) | Attempt to insert existing `username` | 409 Conflict (via `conflict` helper) | `"El nombre de usuario ya esta registrado"` | Unique DB constraint + pre‑check; return 409. |
| Duplicate email (if email unique) | Same as above for email | 409 | `"El correo ya esta registrado"` | Same approach. |
| Missing `code` when required (optional nullable) | Not an error – `null` means “free” | – | – | Allow `null`/`undefined` per schema; treat as no shift. |

**Mitigation:** Centralize validation in a utility or middleware; always throw `badRequest(message)` for 4xx errors so `tryCatch` returns a uniform JSON shape `{ error: message }`.

--- 

## 3. Authentication & Session Errors

Located in `src/lib/auth.ts`.

| Error | Cause | HTTP Status | Message | Prevention / Handling |
|-------|-------|-------------|---------|-----------------------|
| Missing session cookie (`cookieStore.get(COOKIE_NAME)?.value` is `null`) | User not logged in or cookie cleared | 401 Unauthorized (via `unauthorized()`) | `"No autorizado"` | Ensure client stores & sends cookie; redirect to login on 401. |
| Invalid/JWT signature (`jwtVerify` throws) | Tampered token, expired, wrong secret | 401 | `"No autorizado"` | Use short‑lived access tokens + refresh token flow; verify secret correctness. |
| Expired token (JWT `exp`) | Token exceeded TTL (365 days) | 401 | `"No autorizado"` | Refresh token or force re‑login after expiration. |
| Missing `JWT_SECRET` / `RESET_TOKEN_SECRET` env var | Misconfiguration | 500 (throws before wrapper) | Internal error (stack) | Validate required env vars at startup; fail fast with clear log. |
| Password‑reset token purpose mismatch | Token purpose `!= "reset"` | 400 Bad Request (custom error) | `"Token invalido"` | Set and verify `purpose` claim when issuing reset tokens. |
| `bcrypt.compare` failure (wrong password) | Supplied password incorrect | 401 (via `unauthorized("Contrasena incorrecta")`) | `"Contrasena incorrecta"` | Rate‑limit login attempts (e.g., 5 failures → CAPTCHA or temporary lock). |
| User not found (`user === null`) | Username not present in DB | 404 Not Found (via `notFound("Usuario no encontrado")`) | `"Usuario no encontrado"` | For security, consider returning generic `"Credenciales inválidas"` to avoid user‑enumeration; current code distinguishes intentionally. |

**Additional Recommendations:**
* Set cookie attributes: `HttpOnly; Secure; SameSite=Strict` (or `Lax` for cross‑site GET).
* Implement refresh‑token rotation and reuse detection.
* Log failed login attempts with IP and username (hashed) for abuse detection.
* Consider using a generic message for login failures in production (`"Credenciales inválidas"`).

--- 

## 4. Authorization (Access‑Control) Errors

Located mainly in `src/services/calendar.service.ts` (`requireCalendarAccess`) and custom route logic.

| Error | Cause | HTTP Status | Message | Prevention / Handling |
|-------|-------|-------------|---------|-----------------------|
| Calendar not found (`calendar === null`) | Invalid `slug` or calendar already deleted | 404 Not Found (via `notFound`) | `"Calendario no encontrado"` | Validate slug exists before calling service. |
| User not a member of the calendar (`person === null`) | `people` row missing for given `person_id` & `calendar_id` | 403 Forbidden (via `forbidden()`) | `"No autorizado"` | UI should only allow navigation to calendars the user belongs to; server double‑checks. |
| Attempt to modify another user’s availability (`person_id !== person.id`) | User tries to set availability for someone else without permission | 403 Forbidden (via `forbidden()`) | `"No autorizado"` | Enforce ownership check; expose only own `person_id` in UI where appropriate. |
| Missing role check for admin‑only actions (e.g., delete calendar, manage members) | No explicit role validation; currently only owner can perform some actions | Varies – may return 403, 404, or 500 if unauthorized | Add explicit `requireRole('admin')` or similar middleware for privileged endpoints. |
| Attempt to create a person in a calendar when caller is not a manager | UI restricts but server may allow (only checks that requester is a member) | 200 OK but creates unintended data | Add server‑side check: only if `myRole === 'manager'` (or user.role === 'manager') allow `handleAddPerson`. |
| Attempt to delete a calendar when user is not the owner/manager | Similar to above | Same as above | Add ownership/role check before deletion. |

**Mitigation:**
* Create reusable authorisation functions:
    * `requireCalendarAccess(slug, session)` – already exists; extend to optionally enforce `requireRole`.
    * `requireRole(requiredRole)` – compares `session.role` (or fetch user role from DB) against required role.
* Use higher‑order wrappers or middleware to apply these checks consistently.
* Log authorization failures (including user ID, resource ID, attempted action) for audit trails.
* Keep role information in the session after login to avoid extra DB queries on each request (refresh on role change).

--- 

## 5. Database / Supabase Errors

Supabase (PostgREST) returns errors in the `error` field; the code currently does `if (error) throw error`. Those bubbles up to `tryCatch` → `apiError` → 500 unless we convert them to `AppError`.

| Error | Cause | Typical HTTP Status (after conversion) | Message (from PostgREST) | Suggested Mapping & Handling |
|-------|-------|----------------------------------------|--------------------------|------------------------------|
| Unique constraint violation (`23505`) – e.g., duplicate `availability(person_id,date)` when not using upsert | Race condition or missing upsert logic | 409 Conflict | `duplicate key value violates unique constraint "availability_person_id_date_key"` | Map `23505` → `conflict(message)`. Use `upsert` with `onConflict` (as in batch route) or handle via `select` + `insert/update` inside a transaction. |
| Foreign key violation (`23503`) – e.g., `calendar_id` or `person_id` does not exist | Referential integrity breach | 400 Bad Request | `insert or update on table "X" violates foreign key constraint "Y"` | Validate IDs exist before insert (or rely on auth/service providing correct IDs). Map to `badRequest`. |
| Not‑null violation (`23502`) – missing required column | Client omitted required field (should be caught by validation) | 400 Bad Request | `null value in column "X" violates not-null constraint` | Ensure validation covers all NOT NULL columns; map to `badRequest`. |
| Check constraint violation (`23514`) – e.g., invalid `code` not in allowed set | Invalid enum value passed | 400 Bad Request | `new row for relation "Z" violates check constraint "enum_check"` | Validate `code` against `CODES` before DB call; map to `badRequest`. |
| Division by zero or invalid numeric operation (`22012`) | Bad numeric input (outside domain) | 400 Bad Request | `invalid input syntax for type numeric` | Validate numeric fields; map to `badRequest`. |
| Statement timeout / query cancel (`57014` / `57P01`) | Query too long or deadlock detected | 408 Request Timeout (or 409 Conflict for deadlock) | `canceling statement due to statement timeout` / `deadlock detected` | Implement query timeouts; retry on deadlock with back‑off. |
| Row‑level security (RLS) policy denial (`P0001` raised via `raise_exception`) | Auth role lacks permission under RLS | 403 Forbidden (if error is transformed) | Depends on error message (often the text from `raise_exception`) | Ensure RLS policies align with app roles. Use service‑role key for privileged operations (saved in server env, never exposed to client). |
| Connection failure / network error (`ECONNRESET`, `ETIMEDOUT`) | Supabase unreachable or network issue | 502 Bad Gateway / 504 Gateway Timeout (or 500 from catch‑all) | Varies (e.g., `Failed to fetch`) | Implement retry with exponential backoff; return 503 Service Unavailable if persistent. |
| Unexpected PostgREST error (e.g., `PGRST116` – missing header) | Malformed request (e.g., missing `Prefer: count=exact`) | 400 Bad Request (if we map) | Depends on error code | Map known PostgREST codes to appropriate statuses; fallback to 500 for unknown. |

**Implementation Suggestion:**

Create a utility `handleSupabaseError(error)` that inspects `error.code` (PostgREST error code) or `error.status` and throws the appropriate `AppError`:

```ts
import { conflict, badRequest, forbidden, notFound } from "@/lib/errors";

export function handleSupabaseError(err: any): never {
  if (err.code === '23505') throw conflict('Registro duplicado');
  if (err.code === '23503') throw badRequest('Clave foránea inválida');
  if (err.code === '23502') throw badRequest('Campo requerido faltante');
  if (err.code === '23514') throw badRequest('Valor no permitido');
  if (err.code === '22012') throw badRequest('Valor numérico inválido');
  if (err.code === '40P01') throw notFound('Recurso no encontrado');
  if (err.code === 'P0001') throw forbidden('Acceso denegado por política RLS');
  // Default
  throw new Error(`Error de base de datos: ${err.message}`); // will become 500 via apiError
}
```

Then in each route:

```ts
const { error } = await supabase.from('availability').insert(...);
if (error) handleSupabaseError(error);
```

**Logging:** Always log the full error object (`console.error('Supabase error:', error);`) server‑side before throwing the sanitized `AppError`. Never leak raw DB errors to the client.

--- 

## 6. Unexpected Exceptions (500)

Any error that is **not** an instance of `AppError` and whose message is not exactly `"No autorizado"` will be handled by the `else` branch in `apiError`, yielding:

* HTTP Status: **500 Internal Server Error**
* JSON Body: `{ "error": "Error interno del servidor" }`
* Server‑side log: `console.error("Internal error:", err.message)` (plus the full error stack if `console.error` receives the Error object).

Common sources of 500s include:

* Programming mistakes: `TypeError: Cannot read property 'x' of undefined`
* Unhandled promise rejections (if not wrapped)
* Errors thrown from utility functions that are not `AppError`
* Misconfigured environment variables causing early throws (caught before `tryCatch` in some cases)

**Mitigation:**

1. **Centralise error creation** – always use the helper functions (`badRequest`, `unauthorized`, etc.) when you know the error is client‑ or policy‑related.  
2. **Guard against null/undefined** – especially when accessing nested objects from Supabase responses (`data?.[0]?.[field]`).  
3. **Use TypeScript strictness** – enable `strictNullChecks`, `noImplicitAny`, etc., to catch many issues at compile time.  
4. **Write unit / integration tests** for edge cases (invalid IDs, missing headers, concurrent updates).  
5. **Add a global error logger** (e.g., send to an external monitoring service like Sentry) to capture 500s in production.  
6. **Consider exposing a debug `errorId`** in the 500 response (UUID) that correlates with server‑side logs, allowing users to reference it in support tickets without leaking stack traces.

--- 

## 7. Summary of HTTP Status Codes Used

| Status | Typical Use in this Codebase |
|--------|------------------------------|
| 200 OK | Successful GET, PUT, PATCH, POST (when no special code needed) |
| 201 Created | Not explicitly used; could be added for creation endpoints |
| 400 Bad Request | Validation errors, invalid input, malformed requests |
| 401 Unauthorized | Missing/invalid session, invalid JWT, wrong password |
| 403 Forbidden | Authenticated but insufficient permissions (RLS, role checks) |
| 404 Not Found | Resource (calendar, user, event) not found |
| 409 Conflict | Duplicate key, version clash, state conflict |
| 500 Internal Server Error | Unexpected exceptions, unmapped DB errors |
| 502/503/504 | Optional – could be added for upstream service failures (e.g., Supabase downtime) |

--- 

## 8. Recommendations for a Robust Error‑Handling Layer

1. **Extend `src/lib/errors.ts** with a function `mapSupabaseError` as shown above, and import it wherever Supabase calls are made.**  
2. **Create a thin wrapper around Supabase client** that automatically maps errors:
   ```ts
   export const supabaseClient = createSupabaseClient(...);
   export async function safeQuery<T>(promise: Promise<{ data: T; error: any }>) {
     const { data, error } = await promise;
     if (error) throw mapSupabaseError(error);
     return data;
   }
   ```
3. **Adopt a consistent error‑shape for clients** – e.g., `{ error: string, errorId?: string }`. For 500 responses include a generated UUID (`errorId`) logged server‑side.  
4. **Add middleware for common checks**:
    * `validateRequest(schema)` – runs Zod, throws `badRequest` on failure.  
    * `requireSession` – wraps `requireSession()` and throws `unauthorized`.  
    * `requireCalendarAccess(slug)` – throws `notFound` or `forbidden`.  
    * `requireRole(roles: Role[])` – throws `forbidden`.  
5. **Unit‑test error paths** using mock Supabase responses that simulate each error code.  
6. **Monitor and alert** on spikes of 500 errors or specific 4xx patterns (e.g., many 401s could indicate brute force).  
7. **Document error codes** in your public API specification (OpenAPI/Swagger) so consumers know what to expect.  

--- 

*This analysis was produced using the **council** skill (multiple LLM perspectives) to ensure a comprehensive view of failure modes in the Calenadarier backend.*