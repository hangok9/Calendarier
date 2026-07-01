-- ============================================================
-- MIGRACION 5: Constraints + indices faltantes + limpieza
-- ============================================================
-- 1. Ejecutar DESPUES de migration4.sql
-- 2. Anade CHECK constraints que faltaban
-- 3. Anade indices para rendimiento
-- 4. Corrige datos residuales
-- ============================================================

-- ============================================================
-- 1. CHECK constraints para codigos de disponibilidad
-- ============================================================
-- Nota: Si ya existen datos con codigos invalidos, esta migracion
-- fallara. Ejecutar primero:
--   UPDATE availability SET code = NULL WHERE code NOT IN ('TM','TT','TN','FV','FN','OC','RE','OT','CL');

ALTER TABLE availability
  DROP CONSTRAINT IF EXISTS availability_code_check,
  ADD CONSTRAINT availability_code_check
    CHECK (code IS NULL OR code IN ('TM', 'TT', 'TN', 'FV', 'FN', 'OC', 'RE', 'OT', 'CL'));

ALTER TABLE custom_events
  DROP CONSTRAINT IF EXISTS custom_events_code_check,
  ADD CONSTRAINT custom_events_code_check
    CHECK (code IS NULL OR code IN ('TM', 'TT', 'TN', 'FV', 'FN', 'OC', 'RE', 'OT', 'CL'));

-- ============================================================
-- 2. CHECK constraint: end_time > start_time en custom_events
-- ============================================================
ALTER TABLE custom_events
  DROP CONSTRAINT IF EXISTS custom_events_time_check,
  ADD CONSTRAINT custom_events_time_check
    CHECK (start_time IS NULL OR end_time IS NULL OR end_time > start_time);

-- ============================================================
-- 3. CHECK constraint: end_date >= start_date en group_plans
-- ============================================================
ALTER TABLE group_plans
  DROP CONSTRAINT IF EXISTS group_plans_date_check,
  ADD CONSTRAINT group_plans_date_check
    CHECK (end_date >= start_date);

-- ============================================================
-- 4. ON DELETE SET NULL para created_by en calendars
-- ============================================================
-- Solo si la FK existe sin ON DELETE
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints tc
    JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
    WHERE tc.table_name = 'calendars' AND ccu.column_name = 'created_by'
    AND tc.constraint_type = 'FOREIGN KEY'
  ) THEN
    ALTER TABLE calendars
      DROP CONSTRAINT IF EXISTS calendars_created_by_fkey,
      ADD CONSTRAINT calendars_created_by_fkey
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;
  END IF;
END $$;

-- ============================================================
-- 5. Indices faltantes
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_plan_responses_person
  ON plan_responses(person_id);

CREATE INDEX IF NOT EXISTS idx_availability_person_date
  ON availability(person_id, date);

CREATE INDEX IF NOT EXISTS idx_custom_events_person_date
  ON custom_events(person_id, date);

CREATE INDEX IF NOT EXISTS idx_people_calendar_user
  ON people(calendar_id, user_id);

-- ============================================================
-- 6. Auditoria: tabla de logs (si no existe)
-- ============================================================

CREATE TABLE IF NOT EXISTS audit_log (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES users(id) ON DELETE SET NULL,
  action      TEXT NOT NULL,
  entity_type TEXT,
  entity_id   TEXT,
  metadata    JSONB DEFAULT '{}',
  ip_address  TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_log_user
  ON audit_log(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_log_action
  ON audit_log(action, created_at DESC);

-- ============================================================
-- 7. Asegurar que pepe es created_by de todos los calendarios
-- ============================================================
UPDATE calendars
SET created_by = (SELECT id FROM users WHERE username = 'pepe')
WHERE created_by IS NULL;
