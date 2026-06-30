# Calendarier — Todo lo que queda por hacer

## Última actualización: Junio 2026

---

## 1. Gestión de calendarios

### Base de datos
- [ ] **Migration 2**: Añadir columnas:
  - `calendars.created_by` (UUID → users) — quien creó el calendario
  - `people.role` ('manager' | 'member') — rol dentro del calendario
  - `people.alias` (TEXT, nullable) — apodo personalizado por calendario

### API
- [ ] `POST /api/calendars` — Crear calendario (slug auto-generado, creador = manager)
- [ ] `DELETE /api/calendars/[slug]` — Eliminar calendario (solo creador)
- [ ] `PATCH /api/calendars/[slug]` — Editar nombre, año, meses
- [ ] `POST /api/calendars/[slug]/people` — Añadir persona (manager, por username o email)
- [ ] `DELETE /api/calendars/[slug]/people/[personId]` — Eliminar persona (manager o uno mismo)
- [ ] `PATCH /api/calendars/[slug]/people/[personId]` — Cambiar alias/rol

### Frontend
- [ ] **Dashboard**: Botón "Crear calendario" → modal con nombre, año, meses
- [ ] **Dashboard**: Indicar si eres manager o miembro en cada calendario
- [ ] **Vista Settings**: Gestión de miembros del calendario
  - [ ] Lista de personas con rol y alias
  - [ ] Añadir persona (input de username + botón invitar)
  - [ ] Cambiar alias propio (por calendario)
  - [ ] Eliminar/expulsar persona (manager) o salirse (cualquiera)
  - [ ] Botón "Eliminar calendario" (solo manager, con confirmación)

---

## 2. Mobile-First

- [ ] **GridView responsive**: Celdas más grandes en móvil, texto legible
- [ ] **Touch targets**: Mínimo 44×44px para todos los botones y celdas
- [ ] **Sin zoom**: La cuadrícula debe ocupar el ancho completo sin necesidad de zoom
- [ ] **Scroll horizontal**: Si la tabla es muy ancha, scroll suave
- [ ] **Bottom sheet** en vez de modales en móvil
- [ ] **Probar en WhatsApp Web**: El enlace debe abrirse bien desde el chat

---

## 3. Drag & Drop (arrastrar para votar)

- [ ] **Touch swipe**: Arrastrar el dedo por celdas de disponibilidad para marcarlas
- [ ] **Mouse drag**: También funciona con ratón (mousedown + mousemove + mouseup)
- [ ] **Feedback visual**: Resaltar las celdas por las que pasa el dedo
- [ ] **Batch mode**: Al soltar, enviar batch update a la API
- [ ] **Modo "pintar"**: Un toggle para activar/desactivar el modo arrastre

---

## 4. Invitaciones

- [ ] **Por username**: Manager introduce username, se añade al calendario
- [ ] **Notificación**: El invitado ve el calendario nuevo en su dashboard
- [ ] **Email de invitación**: Enviar email con enlace directo al calendario
- [ ] **Auto-link**: Al registrarse, si hay invitaciones pendientes, aparecen solas

---

## 5. Email (Resend)

- [ ] Instalar `resend` npm package
- [ ] Crear `src/lib/email.ts` con funciones de envío
- [ ] Configurar `RESEND_API_KEY` en Vercel
- [ ] **Email de bienvenida** al registrarse (con usuario y contraseña)
- [ ] **Email de invitación** al ser añadido a un calendario
- [ ] **Email de recuperación** de contraseña (futuro)

---

## 6. Mejoras UX

- [ ] **Loading skeletons** en todas las páginas (vs texto "Cargando...")
- [ ] **Página 404** personalizada
- [ ] **Toasts/notificaciones** para acciones (guardado, error, éxito)
- [ ] **Confirmación** antes de eliminar cosas
- [ ] **Tema oscuro** (ThemeToggle)
- [ ] **Tests** de API y componentes
- [ ] **Paginación** en calendarios con muchos datos

---

## 7. Producción

- [ ] Cambiar `JWT_SECRET` a uno real y seguro
- [ ] Configurar dominio personalizado en Vercel
- [ ] SSL/HTTPS (automático con Vercel)
- [ ] Monitoreo de errores (Sentry o similar)
- [ ] Analytics básico
