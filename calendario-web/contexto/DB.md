# Base de datos

## Esquema

```
users
├── id          UUID (PK)
├── username    TEXT UNIQUE
├── email       TEXT
├── password    TEXT (bcrypt hash)
└── created_at  TIMESTAMPTZ

calendars
├── id          UUID (PK)
├── slug        TEXT UNIQUE      # Identificador para URLs
├── name        TEXT
├── year        INT
├── months      INT[]            # Meses seleccionados (1-12)
├── created_by  UUID → users(id)
└── created_at  TIMESTAMPTZ

people           # Usuario dentro de un calendario
├── id          UUID (PK)
├── calendar_id UUID → calendars(id) ON DELETE CASCADE
├── name        TEXT             # Nombre visible (ej: "PEPE")
├── sort_order  INT
├── user_id     UUID → users(id) (nullable)
├── role        TEXT             # 'manager' | 'member'
└── alias       TEXT             # Apodo opcional en este calendario
UNIQUE(calendar_id, name)

availability
├── id          UUID (PK)
├── calendar_id UUID → calendars(id) ON DELETE CASCADE
├── person_id   UUID → people(id) ON DELETE CASCADE
├── date        DATE
├── code        TEXT             # TM/TT/TN/FV/FN/OC/RE/OT/CL/null
└── updated_at  TIMESTAMPTZ
UNIQUE(person_id, date)

custom_events    # Eventos personales
├── id, calendar_id, person_id, date
├── start_time, end_time (TIME)
├── label, code
└── created_at

group_plans      # Planes grupales
├── id, calendar_id, title, description
├── start_date, end_date (DATE)
├── created_by → people(id)
└── created_at

plan_responses   # Respuestas a planes
├── id, plan_id, person_id
├── response     # 'accept' | 'decline' | 'maybe'
└── created_at
UNIQUE(plan_id, person_id)
```

## Reglas clave

- `ON DELETE CASCADE` en people, availability, custom_events, group_plans → al borrar un calendario se borra todo
- `UNIQUE(person_id, date)` → una persona solo tiene una marca por día
- El slug del calendario se genera desde el nombre (lowercase, guiones)

## Migraciones (orden de ejecución en Supabase SQL Editor)

| Orden | Archivo | Qué hace |
|-------|---------|----------|
| 1 | `schema.sql` | Crea todas las tablas + inserta seed data |
| 2 | `migration.sql` | Añade `user_id` a people. Crea usuarios. Linkea people a usuarios |
| 3 | `migration2.sql` | Añade `created_by`, `role`, `alias`. Asigna managers |
| 4 | `migration3.sql` | Asigna pepe como creador de todos los calendarios. Añade pepe a Grupo |

## Seed data

Ver `supabase/SEED_DATA.md` para usuarios, contraseñas y calendarios seed.

Resumen:
- **19 usuarios** seed, contraseña = `username2026` (ej: `pepe2026`)
- **3 calendarios**: Grupo, Barcelona, Cachorritas
- Cada usuario vinculado a sus calendarios correspondientes
