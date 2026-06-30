-- ============================================================
-- MIGRACION 3: Asignar pepe como creador de todos los calendarios
-- ============================================================
-- 1. Ejecutar DESPUES de migration2.sql
-- 2. Hace a pepe el creador/dueno de Grupo, Barcelona, Cachorritas
-- 3. Anade a pepe al calendario Grupo
-- ============================================================

-- 1. Anadir pepe al calendario Grupo (si no existe ya)
INSERT INTO people (calendar_id, name, sort_order, user_id, role)
SELECT c.id, 'PEPE', 99, u.id, 'manager'
FROM calendars c, users u
WHERE c.slug = 'grupo'
  AND u.username = 'pepe'
  AND NOT EXISTS (
    SELECT 1 FROM people p
    WHERE p.calendar_id = c.id AND p.user_id = u.id
  );

-- 2. Hacer a pepe manager en Barcelona y Cachorritas (por si acaso)
UPDATE people p
SET role = 'manager'
FROM users u
WHERE u.username = 'pepe'
  AND p.user_id = u.id
  AND p.role != 'manager';

-- 3. Asignar pepe como creador de todos los calendarios
UPDATE calendars c
SET created_by = (SELECT id FROM users WHERE username = 'pepe')
WHERE created_by IS NULL
   OR created_by != (SELECT id FROM users WHERE username = 'pepe');
