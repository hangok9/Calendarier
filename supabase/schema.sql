-- ============================================================
-- CALENDARIER - Esquema Completo + Seed
-- ============================================================
-- 1. Ejecuta esto en SQL Editor de Supabase
-- 2. Todo incluido: tablas + seed data + constraints + indices
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================
-- TABLAS
-- ============================================================

CREATE TABLE users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username    TEXT UNIQUE NOT NULL,
  email       TEXT,
  password    TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE calendars (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        TEXT UNIQUE NOT NULL,
  name        TEXT NOT NULL,
  year        INT NOT NULL DEFAULT 2026,
  months      INT[] NOT NULL DEFAULT '{7,8}',
  created_by  UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE people (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  calendar_id       UUID NOT NULL REFERENCES calendars(id) ON DELETE CASCADE,
  name              TEXT NOT NULL,
  primer_apellido   TEXT,
  segundo_apellido  TEXT,
  sort_order        INT NOT NULL DEFAULT 0,
  user_id           UUID REFERENCES users(id),
  role              TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('manager', 'member')),
  alias             TEXT,
  UNIQUE(calendar_id, name)
);

CREATE TABLE availability (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  calendar_id UUID NOT NULL REFERENCES calendars(id) ON DELETE CASCADE,
  person_id   UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  date        DATE NOT NULL,
  code        TEXT CHECK (code IS NULL OR code IN ('TM', 'TT', 'TN', 'FV', 'FN', 'OC', 'RE', 'OT', 'CL')),
  updated_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE(person_id, date)
);

CREATE TABLE custom_events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  calendar_id UUID NOT NULL REFERENCES calendars(id) ON DELETE CASCADE,
  person_id   UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  date        DATE NOT NULL,
  start_time  TIME,
  end_time    TIME,
  label       TEXT,
  code        TEXT CHECK (code IS NULL OR code IN ('TM', 'TT', 'TN', 'FV', 'FN', 'OC', 'RE', 'OT', 'CL')),
  created_at  TIMESTAMPTZ DEFAULT now(),
  CHECK (start_time IS NULL OR end_time IS NULL OR end_time > start_time)
);

CREATE TABLE group_plans (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  calendar_id UUID NOT NULL REFERENCES calendars(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  description TEXT,
  start_date  DATE NOT NULL,
  end_date    DATE NOT NULL,
  created_by  UUID NOT NULL REFERENCES people(id),
  created_at  TIMESTAMPTZ DEFAULT now(),
  CHECK (end_date >= start_date)
);

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
CREATE INDEX idx_availability_person_date
  ON availability(person_id, date);
CREATE INDEX idx_custom_events_calendar_date
  ON custom_events(calendar_id, date);
CREATE INDEX idx_custom_events_person_date
  ON custom_events(person_id, date);
CREATE INDEX idx_group_plans_calendar
  ON group_plans(calendar_id);
CREATE INDEX idx_plan_responses_plan
  ON plan_responses(plan_id);
CREATE INDEX idx_plan_responses_person
  ON plan_responses(person_id);
CREATE INDEX idx_people_calendar_order
  ON people(calendar_id, sort_order);
CREATE INDEX idx_people_calendar_user
  ON people(calendar_id, user_id);

-- ============================================================
-- SEED: Calendarios
-- ============================================================

INSERT INTO calendars (slug, name, year, months) VALUES
  ('grupo',       'Grupo',       2026, '{7,8}'),
  ('barcelona',   'Barcelona',   2026, '{7,8}'),
  ('cachorritas', 'Cachorritas', 2026, '{7,8}');

-- ============================================================
-- SEED: Usuarios (contrasena = nombre + 2026)
-- ============================================================

INSERT INTO users (username, password) VALUES
  ('elias',    crypt('elias2026',    gen_salt('bf', 10))),
  ('ponsa',    crypt('ponsa2026',    gen_salt('bf', 10))),
  ('ferran',   crypt('ferran2026',   gen_salt('bf', 10))),
  ('august',   crypt('august2026',   gen_salt('bf', 10))),
  ('joan',     crypt('joan2026',     gen_salt('bf', 10))),
  ('grau',     crypt('grau2026',     gen_salt('bf', 10))),
  ('pol',      crypt('pol2026',      gen_salt('bf', 10))),
  ('resi',     crypt('resi2026',     gen_salt('bf', 10))),
  ('oscar',    crypt('oscar2026',    gen_salt('bf', 10))),
  ('clara',    crypt('clara2026',    gen_salt('bf', 10))),
  ('anna',     crypt('anna2026',     gen_salt('bf', 10))),
  ('pepe',     crypt('pepe2026',     gen_salt('bf', 10))),
  ('ivan',     crypt('ivan2026',     gen_salt('bf', 10))),
  ('yeray',    crypt('yeray2026',    gen_salt('bf', 10))),
  ('susanna',  crypt('susanna2026',  gen_salt('bf', 10))),
  ('zua',      crypt('zua2026',      gen_salt('bf', 10))),
  ('anto',     crypt('anto2026',     gen_salt('bf', 10))),
  ('cris',     crypt('cris2026',     gen_salt('bf', 10)));

-- Asignar pepe como creador de todos los calendarios
UPDATE calendars
SET created_by = (SELECT id FROM users WHERE username = 'pepe');

-- ============================================================
-- SEED: Personas (vinculadas a usuarios)
-- ============================================================

-- Grupo
INSERT INTO people (calendar_id, name, primer_apellido, segundo_apellido, sort_order, user_id, role)
SELECT c.id, p.name, p.primer_apellido, p.segundo_apellido, p.sort_order, u.id, p.role
FROM (VALUES
  ('Josep Maria', 'Elias',    'Eslava',    0, 'elias',    'manager'),
  ('Pepe',        'Merino',   'Delgado',   1, 'pepe',     'manager'),
  ('Alex',        'Ponsa',    'Ubago',     2, 'ponsa',    'member'),
  ('Ferran',      'Oliver',   'Castella',  3, 'ferran',   'member'),
  ('August',      'Escoda',   'Rebordosa', 4, 'august',   'member'),
  ('Joan',        'Almirall', 'viñas',     5, 'joan',     'member'),
  ('Grau',        'Buch',     'Rovira',    6, 'grau',     'member'),
  ('Pol',         'Baulenas', 'Anton',     7, 'pol',      'member')
) AS p(name, primer_apellido, segundo_apellido, sort_order, username, role)
CROSS JOIN calendars c
LEFT JOIN users u ON u.username = p.username
WHERE c.slug = 'grupo';

-- Barcelona
INSERT INTO people (calendar_id, name, primer_apellido, segundo_apellido, sort_order, user_id, role)
SELECT c.id, p.name, p.primer_apellido, p.segundo_apellido, p.sort_order, u.id, p.role
FROM (VALUES
  ('Jordi',   'Resina',   'Martinez',    0, 'resi',    'manager'),
  ('Oscar',   'Miguel',   'Sancho',      1, 'oscar',   'member'),
  ('Clara',   'Font',     'Cabrafiga',   2, 'clara',   'member'),
  ('Anna',    'Casas',    'Monfort',     3, 'anna',    'member'),
  ('Pepe',    'Merino',   'Delgado',     4, 'pepe',    'manager'),
  ('Ivan',    'Rodriguez','Moliner',     5, 'ivan',    'member'),
  ('Yeray',   'De Manuel','Alvarez',     6, 'yeray',   'member')
) AS p(name, primer_apellido, segundo_apellido, sort_order, username, role)
CROSS JOIN calendars c
LEFT JOIN users u ON u.username = p.username
WHERE c.slug = 'barcelona';

-- Cachorritas
INSERT INTO people (calendar_id, name, primer_apellido, segundo_apellido, sort_order, user_id, role)
SELECT c.id, p.name, p.primer_apellido, p.segundo_apellido, p.sort_order, u.id, p.role
FROM (VALUES
  ('Susanna',  'Mora',     'Undurraga',  0, 'susanna', 'manager'),
  ('Victor',   'Zuaza',    'Marti',      1, 'zua',     'member'),
  ('Pepe',     'Merino',   'Delgado',    2, 'pepe',    'manager'),
  ('Antonella','Cristina', 'Rodriguez',  3, 'anto',    'member'),
  ('Josep Maria','Elias',  'Eslava',     4, 'elias',   'manager'),
  ('Cristina', 'Acha',     'Duck',       5, 'cris',    'member')
) AS p(name, primer_apellido, segundo_apellido, sort_order, username, role)
CROSS JOIN calendars c
LEFT JOIN users u ON u.username = p.username
WHERE c.slug = 'cachorritas';
