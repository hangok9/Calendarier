# Calendarier — Todo lo que queda por hacer

> Actualizado: Julio 2026 — refleja el estado real del código.

---

## ✅ Ya implementado (no marcado previamente en TODO)

### 1. Gestión de calendarios — API y frontend completos
- [x] Migration 2: columnas `created_by`, `role`, `alias` — `supabase/migration2.sql`
- [x] `POST /api/calendars` — Crear calendario con slug auto-generado, creador = manager
- [x] `DELETE /api/calendars/[slug]` — Solo creador
- [x] `PATCH /api/calendars/[slug]` — Editar nombre, año, meses
- [x] `POST /api/calendars/[slug]/people` — Añadir persona por username (manager)
- [x] `DELETE /api/calendars/[slug]/people/[personId]` — Manager expulsa, cualquiera se sale
- [x] `PATCH /api/calendars/[slug]/people/[personId]` — Cambiar alias/rol
- [x] Dashboard: botón "Crear calendario" → modal con nombre, año, meses
- [x] Dashboard: indicar rol (Gestor / Miembro) por calendario
- [x] Vista Configurar (SetupView): gestión completa de miembros, roles, alias
- [x] Botón "Eliminar calendario" con confirmación en dos pasos (solo manager)
- [x] Confirmación antes de expulsar/salirse

### 2. Drag & Drop (arrastrar para votar)
- [x] Touch swipe + mouse drag: `onPointerDown/Enter/Up` en GridView y WeekView
- [x] Feedback visual: las celdas se resaltan al pasar
- [x] Batch mode: al soltar, envía batch update a la API (`POST /api/batch`)

### 3. Email (Resend)
- [x] `resend` package instalado
- [x] `src/lib/email.ts` creado con 3 funciones
- [x] Email de bienvenida al registrarse (`sendWelcomeEmail`)
- [x] Email de invitación al ser añadido a calendario (`sendInvitationEmail`)
- [x] Email de recuperación de contraseña (`sendPasswordResetEmail`)

### 4. Invitaciones
- [x] Por username: manager introduce username, se añade al calendario
- [x] Email de invitación con enlace directo
- [x] Notificación: el calendario aparece en el dashboard del invitado automáticamente

### 5. UX
- [x] Confirmación antes de eliminar cosas (expulsar, salirse, eliminar calendario)

### 6. Mobile
- [x] Navegación móvil inferior (mobile-nav)
- [x] Scroll horizontal suave en TableView y ResumenView
- [x] `touchAction: "none"` en celdas del grid para evitar zoom al arrastrar

---

## ❌ Lo que realmente falta

### 1. Mobile-First
- [ ] **GridView responsive**: Celdas más grandes en móvil, texto legible
- [ ] **Touch targets**: Mínimo 44×44px para TODOS los botones y celdas (parcial)
- [ ] **Sin zoom**: La cuadrícula debe ocupar el ancho completo sin necesidad de zoom
- [ ] **Bottom sheet** en vez de modales en móvil
- [ ] **Probar en WhatsApp Web**: El enlace debe abrirse bien desde el chat

### 2. Drag & Drop
- [ ] **Modo "pintar"**: Un toggle para activar/desactivar el modo arrastre

### 3. Invitaciones
- [ ] **Auto-link al registrarse**: Sistema de invitaciones pendientes explícito (el actual linkea por coincidencia de nombre, no por invitación)

### 4. Email
- [ ] Configurar `RESEND_API_KEY` en Vercel (entorno de producción)

### 5. Mejoras UX
- [ ] **Loading skeletons** en todas las páginas (vs texto "Cargando...")
- [ ] **Página 404** personalizada
- [ ] **Toasts/notificaciones** para acciones (guardado, error, éxito)
- [ ] **Tema oscuro** (ThemeToggle)
- [ ] **Tests** de API y componentes
- [ ] **Paginación** en calendarios con muchos datos

### 6. Producción
- [ ] Cambiar `JWT_SECRET` a uno real y seguro
- [ ] Configurar dominio personalizado en Vercel
- [ ] SSL/HTTPS (automático con Vercel)
- [ ] Monitoreo de errores (Sentry o similar)
- [ ] Analytics básico
