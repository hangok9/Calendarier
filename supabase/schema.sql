-- ============================================================
-- CALENDARIER - Esquema de Base de Datos
-- ============================================================
-- 1. Ejecuta esto en SQL Editor de Supabase
-- 2. Luego ejecuta seed.sql (abajo) para los datos iniciales
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================
-- TABLAS
-- ============================================================

-- Cada calendario = un grupo (Barcelona, Cachorritas, Grupo...)
CREATE TABLE calendars (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        TEXT UNIQUE NOT NULL,
  name        TEXT NOT NULL,
  password    TEXT NOT NULL,              -- bcrypt hash
  year        INT NOT NULL DEFAULT 2026,
  months      INT[] NOT NULL DEFAULT '{7,8}',
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Personas de cada calendario
CREATE TABLE people (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  calendar_id UUID NOT NULL REFERENCES calendars(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  sort_order  INT NOT NULL DEFAULT 0,
  UNIQUE(calendar_id, name)
);

-- Disponibilidad: code o NULL (= libre)
CREATE TABLE availability (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  calendar_id UUID NOT NULL REFERENCES calendars(id) ON DELETE CASCADE,
  person_id   UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  date        DATE NOT NULL,
  code        TEXT,
  updated_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE(person_id, date)
);

-- Eventos personalizados (horarios flexibles)
CREATE TABLE custom_events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  calendar_id UUID NOT NULL REFERENCES calendars(id) ON DELETE CASCADE,
  person_id   UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  date        DATE NOT NULL,
  start_time  TIME,
  end_time    TIME,
  label       TEXT,
  code        TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Planes de grupo
CREATE TABLE group_plans (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  calendar_id UUID NOT NULL REFERENCES calendars(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  description TEXT,
  start_date  DATE NOT NULL,
  end_date    DATE NOT NULL,
  created_by  UUID NOT NULL REFERENCES people(id),
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Respuestas a planes
CREATE TABLE plan_responses (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id     UUID NOT NULL REFERENCES group_plans(id) ON DELETE CASCADE,
  person_id   UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  response    TEXT NOT NULL CHECK (response IN ('accept', 'decline', 'maybe')),
  created_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE(plan_id, person_id)
);

-- ============================================================
-- INDICES
-- ============================================================

CREATE INDEX idx_availability_calendar_date
  ON availability(calendar_id, date);
CREATE INDEX idx_availability_person
  ON availability(person_id);
CREATE INDEX idx_custom_events_calendar_date
  ON custom_events(calendar_id, date);
CREATE INDEX idx_group_plans_calendar
  ON group_plans(calendar_id);
CREATE INDEX idx_plan_responses_plan
  ON plan_responses(plan_id);
CREATE INDEX idx_people_calendar_order
  ON people(calendar_id, sort_order);

-- ============================================================
-- SEED DATA
-- ============================================================

-- Contrasenas temporales (cambiar luego desde el panel):
--   grupo -> grupo2026
--   barcelona -> barna2026
--   cachorritas -> cachos2026
--
-- NOTA: Los hash de abajo son placeholder.
-- Cuando el backend arranque, usa el endpoint
-- POST /api/admin/seed para generar las contrasenas reales.
-- O ejecuta UPDATE directo en Supabase.

INSERT INTO calendars (slug, name, password, year, months) VALUES
  ('grupo',       'Grupo',       '$2b$10$ec0yf891SF6icTpcu1ORu.J.Ri3Q4h06LY1b2agSuDLPyYTgk4iJG', 2026, '{7,8}'),
  ('barcelona',   'Barcelona',   '$2b$10$87QVsQfAMrkA0EtJvLvkeeih08YzMmDH6GeT8PQX/pNnnI5dxRANi', 2026, '{7,8}'),
  ('cachorritas', 'Cachorritas', '$2b$10$VUFPgYxJyzbiWByYP9eSsudjtvLhNmkpythRjMdhdKl2JLQkWriXy', 2026, '{7,8}');

-- Grupo
INSERT INTO people (calendar_id, name, sort_order)
SELECT id, unnest(ARRAY['ELIAS','MERINO','PONSA','FERRAN','AUGUST','JOAN','GRAU','POL']), generate_series(0,7)
FROM calendars WHERE slug = 'grupo';

-- Barcelona
INSERT INTO people (calendar_id, name, sort_order)
SELECT id, unnest(ARRAY['RESI','OSCAR','CLARA','ANNA','PEPE','IVAN','YERAY']), generate_series(0,6)
FROM calendars WHERE slug = 'barcelona';

-- Cachorritas
INSERT INTO people (calendar_id, name, sort_order)
SELECT id, unnest(ARRAY['SUSANNA','ZUA','PEPE','ANTO','ELIAS','CRIS']), generate_series(0,5)
FROM calendars WHERE slug = 'cachorritas';
