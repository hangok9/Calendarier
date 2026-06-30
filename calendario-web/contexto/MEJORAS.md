# Mejoras realizadas y planificadas

## Realizadas

### UX / UI
- **Diseño profesional sin emojis** — reemplazados todos los emojis por iconos SVG, texto o badges limpios
- **Vista semanal en móvil** — WeekView con iniciales coloreadas, navegación entre semanas y meses
- **Detección de móvil** — CalendarView cambia automáticamente entre WeekView (móvil) y GridView (desktop)
- **Tabla diaria responsiva** — columnas sticky (Fecha/Dia a la izq., Libres a la der.), scroll horizontal, targets táctiles de 44px
- **Color libre gris** — el estado "libre" usa gris en vez de verde para no confundirlo con códigos activos
- **Corrección ortográfica** — "Manana" → "Mañana"

### Grid / Disponibilidad
- **Drag & drop** — arrastrar para marcar varias fechas seguidas con el mismo código
- **Prevención de onClick tras drag** — flag `didDrag` para no disparar click accidental

### Resumen
- **Desglose por persona** — cada persona muestra su cuenta de códigos y % de libres
- **Cobertura diaria** — tabla por día con conteo de libres y ocupados
- **Umbrales de disponibilidad** — barras de progreso para "todos libres", "max 1 ocupado", etc.

### Auth
- **Recuperación de contraseña** — flujo completo con email vía Resend
- **Página de cuenta** — cambiar email y contraseña

### Gestión de calendario
- **12 meses seleccionables** — al crear calendario
- **Roles** — manager puede añadir/expulsar personas
- **Alias** — cada persona puede tener un apodo distinto en cada calendario

## Planificadas

### Inmediatas
- Mejorar feedback visual al marcar disponibilidad (animación de guardado)
- Confirmación antes de recargar si hay cambios sin guardar
- Atajos de teclado (flechas para navegar semanas)

### Corto plazo
- Vista de agenda/día en móvil (tocar un día y ver detalle)
- Exportar disponibilidad a PDF/CSV
- Tema oscuro toggle recordable por usuario
- Notificaciones push cuando alguien marca

### Medio plazo
- Drag & drop táctil mejorado en WeekView
- Vista de solapamiento: "¿quién está libre cuando yo?"
- Estadísticas avanzadas: heatmap de disponibilidad por hora/persona
- Modo offline con SW cache

### Largo plazo
- App PWA instalable
- Sincronización con Google Calendar / Outlook
- Plantillas de calendarios predefinidos
- Soporte multi-idioma
