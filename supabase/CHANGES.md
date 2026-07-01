# Cambios en SQL de Supabase

## Resumen

Se perfeccionaron todos los archivos SQL en `supabase/` para corregir errores, añadir constraints y optimizar el esquema. A continuación el detalle por archivo.

---

## `schema.sql` (Esquema base + seed)

### Columnas añadidas

| Tabla | Columna | Tipo | Razón |
|-------|---------|------|-------|
| `calendars` | `created_by` | `UUID → users ON DELETE SET NULL` | Saber quién creó cada calendario (antes solo en migrations) |
| `people` | `role` | `TEXT CHECK ('manager','member')` | Distinguir gestores de miembros (antes solo en migrations) |
| `people` | `alias` | `TEXT` | Apodo por calendario (antes solo en migrations) |

### CHECK constraints añadidas

| Tabla | Constraint | Efecto |
|-------|-----------|--------|
| `availability.code` | `CHECK (code IS NULL OR code IN ('TM','TT','TN','FV','FN','OC','RE','OT','CL'))` | Solo códigos válidos o null (libre) |
| `custom_events.code` | Mismo CHECK | Misma validación |
| `custom_events` | `CHECK (end_time > start_time)` | Evita eventos con hora fin < inicio |
| `group_plans` | `CHECK (end_date >= start_date)` | Evita planes con fecha fin anterior a inicio |

### Índices añadidos (10 total, antes 6)

| Índice | Tabla | Columnas |
|--------|-------|----------|
| `idx_plan_responses_person` | `plan_responses` | `person_id` |
| `idx_availability_person_date` | `availability` | `person_id, date` |
| `idx_custom_events_person_date` | `custom_events` | `person_id, date` |
| `idx_people_calendar_user` | `people` | `calendar_id, user_id` |

### Seed mejorado

- Los managers se asignan explícitamente en el INSERT (no se deduce por orden)
- `created_by` se asigna a `pepe` tras insertar usuarios
- Contraseñas consistentes con `crypt()` de pgcrypto

---

## `migration.sql` (Fix crítico)

### Bug corregido: LOWER(TRIM(name)) no funcionaba

**Antes:**
```sql
UPDATE people SET user_id = (SELECT id FROM users WHERE username = LOWER(TRIM(name)))
```

Esto fallaba para nombres compuestos:
- `"Josep Maria" → LOWER(TRIM()) → "josep maria"` ✗ (debería ser `"elias"`)
- `"Victor" → "victor"` ✗ (debería ser `"zua"`)

**Ahora:**
```sql
UPDATE people p SET user_id = u.id
FROM (VALUES
  ('Grupo', 'elias', 'Josep Maria'),
  ('Grupo', 'ponsa', 'Alex'),
  ...
) AS mapping(cal_slug, username, person_name)
JOIN users u ON u.username = mapping.username
JOIN calendars c ON c.slug = mapping.cal_slug
WHERE p.calendar_id = c.id AND p.name = mapping.person_name;
```

Mapping explícito de 21 entradas → todos los usuarios quedan linkeados correctamente.

---

## `migration2.sql`

- Añadido `ON DELETE SET NULL` a la FK `calendars.created_by → users.id`
- Nota de compatibilidad para instalaciones existentes

---

## `migration4.sql`

- Eliminado `ALTER TABLE calendars ADD COLUMN created_by` duplicado (ya estaba en migration2.sql)

---

## `rls.sql`

- Nota de `auth.uid()` ampliada documentando que el proyecto usa JWT custom (no Supabase Auth) y las 3 opciones de futuro (migrar a Supabase Auth, eliminar políticas, o híbrido)

---

## `migration5.sql` (Nuevo)

Parche para bases de datos existentes que NO hacen reset. Añade:

- CHECK constraints para códigos de disponibilidad
- CHECK `end_time > start_time` y `end_date >= start_date`
- FK `created_by` con `ON DELETE SET NULL`
- Índices faltantes
- Tabla `audit_log`
- `UPDATE calendars` asegurando `created_by` no nulo

> **Nota:** Si hiciste reset + schema.sql nuevo, no necesitas ejecutar migration5.sql.

---

## Orden de ejecución según el caso

### Reset completo (recomendado para dev)

1. `DROP SCHEMA public CASCADE; CREATE SCHEMA public;`
2. Ejecutar `schema.sql` ✅
3. (Opcional) Ejecutar `rls.sql` si piensas migrar a Supabase Auth

### Migración sin borrar datos

1. Ejecutar migrations 1-4 existentes (si no se han ejecutado ya)
2. Ejecutar `migration5.sql`
