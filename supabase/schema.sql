-- ============================================================
-- CALENDARIER - Esquema Completo + Seed
-- ============================================================
-- 1. Ejecuta esto en SQL Editor de Supabase
-- 2. Todo incluido: tablas + seed data
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
  UNIQUE(calendar_id, name)
);

CREATE TABLE availability (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  calendar_id UUID NOT NULL REFERENCES calendars(id) ON DELETE CASCADE,
  person_id   UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  date        DATE NOT NULL,
  code        TEXT,
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
  code        TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);

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
  ('elias',    '$2b$10$adJBKYfkLn4zLkckUHxYl.bsQY3Y4AImQbIrU/kqyqNQNJBcWCnG2'),
  ('ponsa',    '$2b$10$nxNgti9X0hk1KxMeKedRnunJTUWOr7KB0rBYAFX6nuMLnTRu/WRHu'),
  ('ferran',   '$2b$10$E4cLTJ2i2FRKzWPUgLbHreMgJreKvdgzsfo39ss7u9WqyYvG1jac2'),
  ('august',   '$2b$10$977V0ZN5u920Xx1/GxajF.jQf43XBFWlz5Mgjtt7KYMUa7Q4HufXW'),
  ('joan',     '$2b$10$qldyIN4g.um1c8Nx81zRT.KXmZ7lGXGwKrkWgJxFKGo1qLZepLi12'),
  ('grau',     '$2b$10$coCNqJm/UItPFECbyt4a0O0vmUZ91SGyxcRo4Gkwz3xFxbGGgc0um'),
  ('pol',      '$2b$10$Ohe/ojiYaw8pJXBuCu6Q5e6SMksWkrssT5ccroiPkUtv1Zsf7RIQi'),
  ('resi',     '$2b$10$KXKFjeDgOnLGfj.p5e7fWOXDZ9fuSn6Af9taj8pKEjcyW9je5TOfm'),
  ('oscar',    '$2b$10$3ni81M6C23MNVKKGglwioe2MZr7n1iSt91XUq/6X3hrLsBSGpwFki'),
  ('clara',    '$2b$10$0oEVVHlz8amCc2onWu9uTeFXouqlapf0ccim5wDF7O1qF9n7vubFG'),
  ('anna',     '$2b$10$2GiN.wC8AlJX56J3pjZm6OTBzUeGO9ggz1nAHcR5/WLGzqpOWpa2K'),
  ('pepe',     '$2b$10$AraOqdjn/xfMM7qttAu1xeF4q4lsXHLgP/TTxY207xbuH06LQ9/6q'),
  ('ivan',     '$2b$10$fMZGDb1KH03qsR7clxN8oOTmflSrcdQTsDmfx4feUkgG3Y4aUvyJK'),
  ('yeray',    '$2b$10$YF0xe/6Wql/vua6AAHqIpeyujLkmHP3c7/iCgNznw0NE04GH9oEVC'),
  ('susanna',  '$2b$10$F.tyCY1XuoGYWBqPCVNIAewzJK8t.DlFzMHorB3DgUs4o.Jhw/Gmy'),
  ('zua',      '$2b$10$aeOqYi7zGHar00iHtF1K8.Cfpv324SeZwjC7BfRHBjHj87ap.xaGW'),
  ('anto',     '$2b$10$brZQbe61iPRP7cNtA.VfBuNyzryFRY.4jDZ2JHLY1Hdl4SXZbS.yu'),
  ('cris',     '$2b$10$JyVse1X.iakmKNheIRcNTevt6WC1ljrjmt2TUUtWxPllq9wIh9IKG');

-- ============================================================
-- SEED: Personas (vinculadas a usuarios)
-- ============================================================

-- Grupo
INSERT INTO people (calendar_id, name, primer_apellido, segundo_apellido, sort_order, user_id)
SELECT c.id, name, primer_apellido, segundo_apellido, sort_order, u.id
FROM (VALUES
  ('Josep Maria', 'Elias',    'Eslava',    0, 'elias'),
  ('Pepe',        'Merino',   'Delgado',   1, 'pepe'),
  ('Alex',        'Ponsa',    'Ubago',     2, 'ponsa'),
  ('Ferran',      'Oliver',   'Castella',  3, 'ferran'),
  ('August',      'Escoda',   'Rebordosa', 4, 'august'),
  ('Joan',        'Almirall', 'viñas',     5, 'joan'),
  ('Grau',        'Buch',     'Rovira',    6, 'grau'),
  ('Pol',         'Baulenas', 'Anton',     7, 'pol')
) AS p(name, primer_apellido, segundo_apellido, sort_order, username)
CROSS JOIN calendars c
LEFT JOIN users u ON u.username = p.username
WHERE c.slug = 'grupo';

-- Barcelona
INSERT INTO people (calendar_id, name, primer_apellido, segundo_apellido, sort_order, user_id)
SELECT c.id, name, primer_apellido, segundo_apellido, sort_order, u.id
FROM (VALUES
  ('Jordi',   'Resina',   'Martinez',  0, 'resi'),
  ('Oscar',   'Miguel',   'Sancho',    1, 'oscar'),
  ('Clara',   'Font',     'Cabrafiga', 2, 'clara'),
  ('Anna',    'Casas',    'Monfort',   3, 'anna'),
  ('Pepe',    'Merino',   'Delgado',   4, 'pepe'),
  ('Ivan',    'Rodriguez','Moliner',   5, 'ivan'),
  ('Yeray',   'De Manuel','Alvarez',   6, 'yeray')
) AS p(name, primer_apellido, segundo_apellido, sort_order, username)
CROSS JOIN calendars c
LEFT JOIN users u ON u.username = p.username
WHERE c.slug = 'barcelona';

-- Cachorritas
INSERT INTO people (calendar_id, name, primer_apellido, segundo_apellido, sort_order, user_id)
SELECT c.id, name, primer_apellido, segundo_apellido, sort_order, u.id
FROM (VALUES
  ('Susanna',  'Mora',     'Undurraga',  0, 'susanna'),
  ('Victor',   'Zuaza',    'Marti',      1, 'zua'),
  ('Pepe',     'Merino',   'Delgado',    2, 'pepe'),
  ('Antonella','Cristina', 'Rodriguez',  3, 'anto'),
  ('Josep Maria','Elias',  'Eslava',     4, 'elias'),
  ('Cristina', 'Acha',     'Duck',       5, 'cris')
) AS p(name, primer_apellido, segundo_apellido, sort_order, username)
CROSS JOIN calendars c
LEFT JOIN users u ON u.username = p.username
WHERE c.slug = 'cachorritas';
