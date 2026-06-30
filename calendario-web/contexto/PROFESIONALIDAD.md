# Profesionalidad — mejoras para una imagen más seria

## UI / Visual

### Estado actual
- Diseño limpio con glassmorphism en nav y sombras suaves
- Paleta de colores consistente (azul como acento principal)
- Tipografía Inter como sans-serif, mono para códigos

### Mejoras propuestas

| Área | Actual | Propuesto |
|------|--------|-----------|
| **Carga inicial** | "Cargando..." texto plano | Skeleton screens con shimmer |
| **Transiciones** | Solo fadeInUp en vistas | Micro-interacciones en hover de botones y celdas |
| **Badges de código** | Fondo sólido con texto blanco | Badges con borde sutil y sombra interior |
| **Tabla diaria** | Scroll horizontal básico | Sombra de degradado en los bordes del scroll (como iOS) |
| **WeekView (móvil)** | Iniciales en círculo | Círculos con borde fino + sombra sutil |
| **Toast/Snackbar** | No hay | Sistema de notificaciones temporales (guardado, error, éxito) |
| **Modales** | Sin animación de apertura | Backdrop blur + scale-in animado |
| **Nav activo** | Línea inferior | Indicador más prominente con badge de píldora |

## UX / Flujos

| Área | Actual | Propuesto |
|------|--------|-----------|
| **Feedback de guardado** | No hay indicación visual | Badge "Guardado" animado + spinner en operaciones lentas |
| **Error handling** | Mensajes de error básicos | Toasts descriptivos con acción de reintentar |
| **Confirmaciones** | `confirm()` nativo de JS | Modal personalizado con diseño coherente |
| **Formularios** | Sin validación inline | Validación en tiempo real con mensajes junto al campo |
| **Onboarding** | No hay | Tour guiado al primer inicio o al crear un calendario |
| **404 / errores** | Página vacía | Páginas de error con ilustración y acciones útiles |
| **Empty states** | Texto plano | Ilustraciones minimalistas + CTA claro |

## Técnico

| Área | Actual | Propuesto |
|------|--------|-----------|
| **Rendimiento** | Sin optimizar | Virtualización de listas largas, lazy loading de meses |
| **SEO** | Sin meta tags | Meta tags básicos en páginas públicas (login, register) |
| **Accesibilidad** | Básica | Roles ARIA, focus visible, skip-to-content, contraste mínimo |
| **PWA** | No | Service Worker para offline, manifest.json, splash screen |
| **Analytics** | No | Eventos básicos de uso (sin identificar al usuario) |
| **Monitorización** | No | Logs de error en producción (Sentry o similar) |
| **Testing** | Manual build-pass | Tests unitarios en componentes críticos (ResumenView, availability) |

## Correcciones menores

- Revisar ortografía y tildes en toda la UI (ej: "anadir" → "añadir")
- Asegurar que todos los textos usan el mismo registro (tuteo consistente)
- Revisar padding y alineación en vistas con muchos datos
- Estandarizar bordes y radios de esquina entre componentes
