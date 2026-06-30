# Calendarier — Visión General

App web para **coordinación de grupos**: varias personas marcan su disponibilidad (libre / turnos / no disponible) en un calendario compartido.

## Conceptos clave

- **Usuario**: persona con cuenta (username + password). Puede pertenecer a varios calendarios.
- **Calendario**: un grupo con nombre, año y meses concretos. Tiene un **creador** (owner).
- **Persona**: la representación de un usuario dentro de un calendario. Tiene un **rol** (manager/member), un **nombre** visible y un **alias** opcional.
- **Disponibilidad**: cada persona marca cada día con un código (o nada = libre).
- **Códigos**: TM (mañana), TT (tarde), TN (noche), FV (fuera vuelve), FN (fuera no vuelve), OC (ocupado), RE (recuperación), OT (otros), CL (clases).

## Roles

| Rol | Permisos |
|-----|----------|
| **manager** | Añadir/expulsar personas, cambiar roles, editar/eliminar el calendario |
| **member** | Marcar disponibilidad, crear planes/eventos, cambiar su propio alias |

El **creador** del calendario es siempre manager.

## Tech Stack

- **Frontend**: Next.js 16 App Router, React 19, TypeScript
- **Backend**: API Routes de Next.js (serverless)
- **Base de datos**: Supabase (PostgreSQL)
- **Auth**: JWT propio (jose) con cookie httpOnly
- **Email**: Resend (welcome, invitation, password reset)
- **Hosting**: Vercel
