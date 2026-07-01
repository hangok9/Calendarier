-- ============================================================
-- MIGRACION: Cuentas de usuario
-- ============================================================
-- Ejecutar DESPUES de schema.sql (o si ya lo ejecutaste)
-- ============================================================

-- 1. Crear tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username    TEXT UNIQUE NOT NULL,
  email       TEXT,
  password    TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- 2. Añadir user_id a people
ALTER TABLE people ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id);

-- 3. Quitar password de calendars
ALTER TABLE calendars DROP COLUMN IF EXISTS password;

-- 4. Crear usuarios seed (19 usuarios unicos)
-- Contrasenas: nombre + 2026 (ej: elias2026, pepe2026...)
INSERT INTO users (username, password) VALUES
  ('elias',    '$2b$10$adJBKYfkLn4zLkckUHxYl.bsQY3Y4AImQbIrU/kqyqNQNJBcWCnG2'),
  ('merino',   '$2b$10$RYZEBWdEOXSkgjzJZcYXpOtXYXRQTOm73yJ/MPE5oy18/dR7frxLa'),
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

-- 5. Linkear people a sus usuarios
-- Usamos mapping explicito porque nombres como "Josep Maria" no equivalen a LOWER(TRIM(name))
UPDATE people p SET user_id = u.id
FROM (VALUES
  ('Grupo',       'elias',    'Josep Maria'),
  ('Grupo',       'pepe',     'Pepe'),
  ('Grupo',       'ponsa',    'Alex'),
  ('Grupo',       'ferran',   'Ferran'),
  ('Grupo',       'august',   'August'),
  ('Grupo',       'joan',     'Joan'),
  ('Grupo',       'grau',     'Grau'),
  ('Grupo',       'pol',      'Pol'),
  ('Barcelona',   'resi',     'Jordi'),
  ('Barcelona',   'oscar',    'Oscar'),
  ('Barcelona',   'clara',    'Clara'),
  ('Barcelona',   'anna',     'Anna'),
  ('Barcelona',   'pepe',     'Pepe'),
  ('Barcelona',   'ivan',     'Ivan'),
  ('Barcelona',   'yeray',    'Yeray'),
  ('Cachorritas', 'susanna',  'Susanna'),
  ('Cachorritas', 'zua',      'Victor'),
  ('Cachorritas', 'pepe',     'Pepe'),
  ('Cachorritas', 'anto',     'Antonella'),
  ('Cachorritas', 'elias',    'Josep Maria'),
  ('Cachorritas', 'cris',     'Cristina')
) AS mapping(cal_slug, username, person_name)
JOIN users u ON u.username = mapping.username
JOIN calendars c ON c.slug = mapping.cal_slug
WHERE p.calendar_id = c.id AND p.name = mapping.person_name;
