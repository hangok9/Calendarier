-- ============================================================
-- RLS (Row Level Security) + Indices + Audit Log
-- ============================================================
-- EJECUTAR EN SQL EDITOR DE SUPABASE (Dashboard > SQL Editor)
-- ============================================================

-- ============================================================
-- 1. HABILITAR RLS EN TODAS LAS TABLAS
-- ============================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendars ENABLE ROW LEVEL SECURITY;
ALTER TABLE people ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_responses ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 2. POLITICAS RLS
-- ============================================================

-- USERS: cada usuario solo ve/edita su propio perfil
CREATE POLICY "users_select_own" ON users
  FOR SELECT TO authenticated
  USING (id = auth.uid());

CREATE POLICY "users_insert_register" ON users
  FOR INSERT TO anon
  WITH CHECK (true);  -- Permitir registro anonimo

CREATE POLICY "users_update_own" ON users
  FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- CALENDARS: cualquier authenticated ve los calendarios, solo el creador los modifica
CREATE POLICY "calendars_select_all" ON calendars
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "calendars_insert_auth" ON calendars
  FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "calendars_update_creator" ON calendars
  FOR UPDATE TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "calendars_delete_creator" ON calendars
  FOR DELETE TO authenticated
  USING (created_by = auth.uid());

-- PEOPLE: miembros del calendario ven a las personas, managers modifican
CREATE POLICY "people_select_member" ON people
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM people p2
      WHERE p2.calendar_id = people.calendar_id
        AND p2.user_id = auth.uid()
    )
  );

CREATE POLICY "people_insert_manager" ON people
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM people p2
      WHERE p2.calendar_id = people.calendar_id
        AND p2.user_id = auth.uid()
        AND p2.role = 'manager'
    )
  );

CREATE POLICY "people_update_self_or_manager" ON people
  FOR UPDATE TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM people p2
      WHERE p2.calendar_id = people.calendar_id
        AND p2.user_id = auth.uid()
        AND p2.role = 'manager'
    )
  )
  WITH CHECK (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM people p2
      WHERE p2.calendar_id = people.calendar_id
        AND p2.user_id = auth.uid()
        AND p2.role = 'manager'
    )
  );

CREATE POLICY "people_delete_self_or_manager" ON people
  FOR DELETE TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM people p2
      WHERE p2.calendar_id = people.calendar_id
        AND p2.user_id = auth.uid()
        AND p2.role = 'manager'
    )
  );

-- AVAILABILITY: miembros ven/editan su propia disponibilidad
CREATE POLICY "availability_select_member" ON availability
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM people
      WHERE people.id = availability.person_id
        AND people.user_id = auth.uid()
    )
  );

CREATE POLICY "availability_insert_own" ON availability
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM people
      WHERE people.id = availability.person_id
        AND people.user_id = auth.uid()
    )
  );

CREATE POLICY "availability_update_own" ON availability
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM people
      WHERE people.id = availability.person_id
        AND people.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM people
      WHERE people.id = availability.person_id
        AND people.user_id = auth.uid()
    )
  );

CREATE POLICY "availability_delete_own" ON availability
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM people
      WHERE people.id = availability.person_id
        AND people.user_id = auth.uid()
    )
  );

-- CUSTOM EVENTS: miembros ven/editan sus eventos
CREATE POLICY "custom_events_select_member" ON custom_events
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM people
      WHERE people.id = custom_events.person_id
        AND people.user_id = auth.uid()
    )
  );

CREATE POLICY "custom_events_insert_own" ON custom_events
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM people
      WHERE people.id = custom_events.person_id
        AND people.user_id = auth.uid()
    )
  );

CREATE POLICY "custom_events_delete_own" ON custom_events
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM people
      WHERE people.id = custom_events.person_id
        AND people.user_id = auth.uid()
    )
  );

-- GROUP PLANS + PLAN RESPONSES
CREATE POLICY "group_plans_select_member" ON group_plans
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM people
      WHERE people.calendar_id = group_plans.calendar_id
        AND people.user_id = auth.uid()
    )
  );

CREATE POLICY "group_plans_insert_member" ON group_plans
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM people
      WHERE people.id = group_plans.created_by
        AND people.user_id = auth.uid()
    )
  );

CREATE POLICY "plan_responses_select_member" ON plan_responses
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM people
      WHERE people.id = plan_responses.person_id
        AND people.user_id = auth.uid()
    )
  );

CREATE POLICY "plan_responses_insert_own" ON plan_responses
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM people
      WHERE people.id = plan_responses.person_id
        AND people.user_id = auth.uid()
    )
  );

CREATE POLICY "plan_responses_update_own" ON plan_responses
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM people
      WHERE people.id = plan_responses.person_id
        AND people.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM people
      WHERE people.id = plan_responses.person_id
        AND people.user_id = auth.uid()
    )
  );

-- ============================================================
-- 3. INDICES ADICIONALES PARA RENDIMIENTO
-- ============================================================

-- Indice compuesto para busqueda rapida de persona por usuario en calendario
CREATE INDEX IF NOT EXISTS idx_people_calendar_user
  ON people(calendar_id, user_id);

-- Indice para busqueda de disponibilidad por persona + fecha
CREATE INDEX IF NOT EXISTS idx_availability_person_date
  ON availability(person_id, date);

-- Indice para eventos por persona + fecha
CREATE INDEX IF NOT EXISTS idx_custom_events_person_date
  ON custom_events(person_id, date);

-- ============================================================
-- 4. TABLA DE AUDITORIA
-- ============================================================

CREATE TABLE IF NOT EXISTS audit_log (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES users(id),
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
-- 5. NOTA: LA APP USA SU PROPIA AUTH (NO SUPABASE AUTH)
-- ============================================================
-- Las politicas RLS usan auth.uid() que funciona con la auth
-- de Supabase. Si NO usas Supabase Auth, las RLS con auth.uid()
-- no funcionaran directamente.
--
-- OPCION A: Migrar a Supabase Auth (recomendado)
-- OPCION B: Usar un enfoque mixto (service_role en API routes
--             + RLS desactivadas para authenticated/anon)
--
-- Por ahora, las RLS estan definidas pero NO afectan a las API
-- routes que usan service_role. Si en el futuro usas Supabase Auth,
-- descomenta el bloque de arriba.
-- ============================================================
