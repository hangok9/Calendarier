-- ============================================================
-- MIGRACION 4: Anyadir primer_apellido y segundo_apellido + nombres reales
-- ============================================================
-- 1. Ejecutar DESPUES de migration3.sql
-- 2. Anade columnas de apellidos
-- 3. Actualiza todos los nombres con los reales (nombre + apellidos)
-- 4. Elimina usuario merino (ya no existe como persona)
-- ============================================================

ALTER TABLE people ADD COLUMN IF NOT EXISTS primer_apellido TEXT;
ALTER TABLE people ADD COLUMN IF NOT EXISTS segundo_apellido TEXT;

-- ============================================================
-- Grupo
-- ============================================================

UPDATE people SET name = 'Josep Maria', primer_apellido = 'Elias',    segundo_apellido = 'Eslava'
WHERE name = 'ELIAS' AND calendar_id = (SELECT id FROM calendars WHERE slug = 'grupo');

-- MERINO eliminado, PEPE ocupa su lugar
DELETE FROM people WHERE name = 'MERINO' AND calendar_id = (SELECT id FROM calendars WHERE slug = 'grupo');

UPDATE people SET name = 'Pepe', primer_apellido = 'Merino', segundo_apellido = 'Delgado', sort_order = 1
WHERE name = 'PEPE' AND calendar_id = (SELECT id FROM calendars WHERE slug = 'grupo');

UPDATE people SET name = 'Alex',   primer_apellido = 'Ponsa',    segundo_apellido = 'Ubago'
WHERE name = 'PONSA' AND calendar_id = (SELECT id FROM calendars WHERE slug = 'grupo');

UPDATE people SET name = 'Ferran',  primer_apellido = 'Oliver',   segundo_apellido = 'Castella'
WHERE name = 'FERRAN' AND calendar_id = (SELECT id FROM calendars WHERE slug = 'grupo');

UPDATE people SET name = 'August',  primer_apellido = 'Escoda',   segundo_apellido = 'Rebordosa'
WHERE name = 'AUGUST' AND calendar_id = (SELECT id FROM calendars WHERE slug = 'grupo');

UPDATE people SET name = 'Joan',    primer_apellido = 'Almirall', segundo_apellido = 'viñas'
WHERE name = 'JOAN' AND calendar_id = (SELECT id FROM calendars WHERE slug = 'grupo');

UPDATE people SET name = 'Grau',    primer_apellido = 'Buch',     segundo_apellido = 'Rovira'
WHERE name = 'GRAU' AND calendar_id = (SELECT id FROM calendars WHERE slug = 'grupo');

UPDATE people SET name = 'Pol',     primer_apellido = 'Baulenas', segundo_apellido = 'Anton'
WHERE name = 'POL' AND calendar_id = (SELECT id FROM calendars WHERE slug = 'grupo');

-- ============================================================
-- Barcelona
-- ============================================================

UPDATE people SET name = 'Jordi',   primer_apellido = 'Resina',   segundo_apellido = 'Martinez'
WHERE name = 'RESI' AND calendar_id = (SELECT id FROM calendars WHERE slug = 'barcelona');

UPDATE people SET name = 'Oscar',   primer_apellido = 'Miguel',   segundo_apellido = 'Sancho'
WHERE name = 'OSCAR' AND calendar_id = (SELECT id FROM calendars WHERE slug = 'barcelona');

UPDATE people SET name = 'Clara',   primer_apellido = 'Font',     segundo_apellido = 'Cabrafiga'
WHERE name = 'CLARA' AND calendar_id = (SELECT id FROM calendars WHERE slug = 'barcelona');

UPDATE people SET name = 'Anna',    primer_apellido = 'Casas',    segundo_apellido = 'Monfort'
WHERE name = 'ANNA' AND calendar_id = (SELECT id FROM calendars WHERE slug = 'barcelona');

UPDATE people SET name = 'Pepe',    primer_apellido = 'Merino',   segundo_apellido = 'Delgado'
WHERE name = 'PEPE' AND calendar_id = (SELECT id FROM calendars WHERE slug = 'barcelona');

UPDATE people SET name = 'Ivan',    primer_apellido = 'Rodriguez', segundo_apellido = 'Moliner'
WHERE name = 'IVAN' AND calendar_id = (SELECT id FROM calendars WHERE slug = 'barcelona');

UPDATE people SET name = 'Yeray',   primer_apellido = 'De Manuel', segundo_apellido = 'Alvarez'
WHERE name = 'YERAY' AND calendar_id = (SELECT id FROM calendars WHERE slug = 'barcelona');

-- ============================================================
-- Cachorritas
-- ============================================================

UPDATE people SET name = 'Susanna',  primer_apellido = 'Mora',     segundo_apellido = 'Undurraga'
WHERE name = 'SUSANNA' AND calendar_id = (SELECT id FROM calendars WHERE slug = 'cachorritas');

UPDATE people SET name = 'Victor',   primer_apellido = 'Zuaza',    segundo_apellido = 'Marti'
WHERE name = 'ZUA' AND calendar_id = (SELECT id FROM calendars WHERE slug = 'cachorritas');

UPDATE people SET name = 'Pepe',     primer_apellido = 'Merino',   segundo_apellido = 'Delgado'
WHERE name = 'PEPE' AND calendar_id = (SELECT id FROM calendars WHERE slug = 'cachorritas');

UPDATE people SET name = 'Antonella', primer_apellido = 'Cristina', segundo_apellido = 'Rodriguez'
WHERE name = 'ANTO' AND calendar_id = (SELECT id FROM calendars WHERE slug = 'cachorritas');

UPDATE people SET name = 'Josep Maria', primer_apellido = 'Elias', segundo_apellido = 'Eslava'
WHERE name = 'ELIAS' AND calendar_id = (SELECT id FROM calendars WHERE slug = 'cachorritas');

UPDATE people SET name = 'Cristina', primer_apellido = 'Acha',     segundo_apellido = 'Duck'
WHERE name = 'CRIS' AND calendar_id = (SELECT id FROM calendars WHERE slug = 'cachorritas');

-- ============================================================
-- Eliminar usuario merino (ya no existe como persona)
-- ============================================================

DELETE FROM users WHERE username = 'merino';
