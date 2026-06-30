-- ============================================================
-- MIGRACION 2: Roles, alias, creador de calendario
-- ============================================================
-- 1. Ejecutar DESPUES de migration.sql
-- 2. Añade columnas y asigna roles seed
-- ============================================================

-- Calendarios: quien lo creo
ALTER TABLE calendars ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users(id);

-- Personas: rol y apodo
ALTER TABLE people ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('manager', 'member'));
ALTER TABLE people ADD COLUMN IF NOT EXISTS alias TEXT;

-- Asignar creador a calendarios existentes (la primera persona de cada calendario)
UPDATE calendars
SET created_by = sub.user_id
FROM (
  SELECT DISTINCT ON (calendar_id) calendar_id, user_id
  FROM people
  WHERE user_id IS NOT NULL
  ORDER BY calendar_id, sort_order
) AS sub
WHERE calendars.id = sub.calendar_id AND calendars.created_by IS NULL;

-- La primera persona de cada calendario es manager
UPDATE people
SET role = 'manager'
FROM (
  SELECT DISTINCT ON (calendar_id) id AS pid
  FROM people
  ORDER BY calendar_id, sort_order
) AS firsts
WHERE people.id = firsts.pid;
