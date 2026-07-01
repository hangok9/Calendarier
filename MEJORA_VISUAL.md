# Mejora Visual — Calenadarier

Objetivo: interfaz profesional, cómoda y atractiva, pensada para empresas del sector hostelería.

---

## 1. Paleta de color corporativa

### 1.1. Colores principales
| Uso | Color | Hex | Tailwind |
|---|---|---|---|
| Primary / accent | Azul corporativo | `#2563EB` | `blue-600` |
| Primary hover | Azul oscuro | `#1D4ED8` | `blue-700` |
| Secondary | Teal / verde azulado | `#0D9488` | `teal-600` |
| Background (light) | Blanco roto | `#F8FAFC` | `slate-50` |
| Background (dark) | Gris muy oscuro | `#0F172A` | `slate-900` |
| Surface (light) | Blanco | `#FFFFFF` | `white` |
| Surface (dark) | Gris oscuro | `#1E293B` | `slate-800` |
| Text (light) | Casi negro | `#0F172A` | `slate-900` |
| Text (dark) | Casi blanco | `#F1F5F9` | `slate-100` |
| Muted (light) | Gris suave | `#64748B` | `slate-500` |
| Muted (dark) | Gris medio | `#94A3B8` | `slate-400` |

### 1.2. Colores de códigos de turno (mantener actuales, refinar)
Los códigos actuales funcionan bien, pero conviene estandarizar:

| Código | Significado | Hex actual | Propuesta |
|---|---|---|---|
| TM | Trabajar mañana | `#22C55E` (green-500) | `#16A34A` (green-600) — más serio |
| TT | Trabajar tarde | `#10B981` (emerald-500) | `#059669` (emerald-600) |
| TN | Trabajar noche | `#15803D` (green-700) | `#166534` (green-800) |
| FV | Fuera, vuelve | `#F97316` (orange-500) | `#EA580C` (orange-600) |
| FN | Fuera, no vuelve | `#EF4444` (red-500) | `#DC2626` (red-600) |
| OC | Ocupado | `#6B7280` (gray-500) | `#4B5563` (gray-600) |
| RE | Recuperaciones | `#A855F7` (purple-500) | `#9333EA` (purple-600) |
| OT | Otros | `#14B8A6` (teal-500) | `#0D9488` (teal-600) |
| CL | Clases | `#F59E0B` (amber-500) | `#D97706` (amber-600) |

> Unifica el tono: todos los códigos con el mismo nivel de saturación (600) para que ninguno grite más que otro.

---

## 2. Tipografía

| Propiedad | Valor |
|---|---|
| Fuente principal | **Inter** (ya incluida en layout) |
| Fuente mono (códigos/badges) | **JetBrains Mono** (ya incluida) |
| Tamaño base | 16px → escalado `text-sm` en tablets, `text-xs` en móvil |
| Jerarquía | Títulos: `font-semibold tracking-tight`; cuerpo: `font-normal leading-relaxed` |

- En badges de código (TM, TT, etc.): `font-mono text-xs font-bold uppercase tracking-wider`
- Números de día: `font-mono text-lg tabular-nums` (mismo ancho, profesional)

---

## 3. Layout general

### 3.1. Sidebar (escritorio) / Bottom nav (móvil)
- **Escritorio (>1024px)**: sidebar lateral izquierdo fijo de 240px con opacidad glassmorphism. Contiene logo, navegación, calendario activo, y avatar/usuario.
- **Tablet**: sidebar colapsable (iconos + tooltip).
- **Móvil (<768px)**: bottom navigation con 4-5 iconos.

### 3.2. Header
- Breadcrumb: `Calendario > Grupo Barcelona > Julio 2026`
- Botones de acción: "Exportar", "Añadir persona", "Plan grupo" → alineados a la derecha
- Selector de mes: flechas `< >` con el mes actual en grande entre ellas

### 3.3. Zona principal
- Ancho máximo de contenido: `1280px` centrado
- Margen lateral: `px-4 md:px-8 lg:px-12`
- Fondo: sutileza con un patrón muy tenue de puntos ( `background-image: radial-gradient(circle, ...)` ) o grid

---

## 4. Componentes visuales

### 4.1. Vista Grid (semanal)
```
┌────────────────────────────────────────────────┐
│  Lun 30   │  Mar 1   │  Mie 2   │  Jue 3  ... │
│ ┌──────┐  │ ┌──────┐ │ ┌──────┐ │ ┌──────┐    │
│ │ TM   │  │ │ TM   │ │ │ FV   │ │ │      │    │
│ │ Pepe │  │ │ Pepe │ │ │ Pepe │ │ │ Pepe │    │
│ ├──────┤  │ ├──────┤ │ ├──────┤ │ ├──────┤    │
│ │ TT   │  │ │      │ │ │ TT   │ │ │ TM   │    │
│ │ Ana  │  │ │ Ana  │ │ │ Ana  │ │ │ Ana  │    │
│ └──────┘  │ └──────┘ │ └──────┘ │ └──────┘    │
└────────────────────────────────────────────────┘
```
**Mejoras:**
- Chips redondeados (`rounded-xl`) con sombra suave (`shadow-sm`)
- El chip de código (TM, TT…) como badge pequeño arriba a la izquierda, nombre abajo
- Scroll horizontal suave con `snap-x snap-mandatory` en móvil
- El día de hoy con un anillo `ring-2 ring-blue-500`

### 4.2. Vista Tabla (días × personas)
- Cabecera de persona fija (sticky) con scroll horizontal
- Celdas con border muy sutil (`border-slate-200` / `border-slate-700`)
- Al hacer hover sobre una celda, `bg-blue-50/50` (light) o `bg-blue-900/20` (dark)
- Al hacer clic, dropdown contextual con los códigos disponibles (evitar ir a un modal)
- Selector rápido: atajos de teclado (ej: pulsar `T` → menú de códigos TM/TT/TN)

### 4.3. Badges de código
- Fondo con opacidad baja del color + texto con el color completo
- Ej: TM → `bg-green-100 text-green-700` (light) / `bg-green-900/30 text-green-400` (dark)
- Borde sutil del mismo color
- Animación al cambiar: fade de 200ms

### 4.4. Resumen / Dashboard
- Cards con `bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700`
- Stat principal en número grande con `font-bold tabular-nums`
- Mini sparkline (gráfico de línea sencillo) en cada card mostrando tendencia semanal
- Barras de progreso con gradiente suave y animación al cargar

### 4.5. Modal / Batch
- Modal centrado con overlay oscuro (`bg-black/40 backdrop-blur-sm`)
- Esquinas redondeadas (`rounded-2xl`), padding generoso (`p-6`)
- Animación de entrada: scale + fade (300ms)
- Inputs con foco azul y label flotante

---

## 5. Animaciones y transiciones

| Elemento | Animación | Duración |
|---|---|---|
| Navegación entre tabs | Slide horizontal | 200ms |
| Apertura de modal | Scale (1→0.95→1) + fade | 300ms |
| Badge al cambiar código | Fade out → new → fade in | 200ms |
| Hover en fila/celda | Background color | 150ms |
| Scroll entre semanas | Snap + fade indicador | 300ms |
| Carga de datos | Skeleton shimmer (placeholder gris animado) | — |
| Notificación toast | Slide in desde arriba + fade out | 300ms + 3s visible |
| Tooltip en iconos | Fade + slide up | 150ms |

---

## 6. Responsive por dispositivo

| Breakpoint | Comportamiento |
|---|---|
| **< 640px** (móvil) | Bottom nav, tabla con scroll horizontal, grid semanal 1 columna, batchn modal fullscreen |
| **640–1024px** (tablet) | Tabla con scroll horizontal, grid semanal 2-3 columnas, sidebar colapsable |
| **1024–1536px** (escritorio) | Sidebar fija, grid semanal 5-7 columnas,Tabla completa visible |
| **> 1536px** (ultrawide) | Grid semanal expandida, resumen con gráficos más grandes, soporte para 2 paneles |

---

## 7. Mejoras de usabilidad

### 7.1. Atajos de teclado
| Tecla | Acción |
|---|---|
| `T` | Abrir menú de códigos de turno (TM/TT/TN) |
| `F` | Abrir menú de fuera (FV/FN) |
| `O` | Ocupado |
| `R` | Recuperaciones |
| `C` | Clases |
| `X` | Limpiar / quitar código |
| `←` `→` | Navegar entre meses |
| `Escape` | Cerrar modal |
| `Ctrl+Z` | Deshacer último cambio |

### 7.2. Drag & drop
- Arrastrar un código desde una leyenda hasta una celda para aplicarlo
- Arrastrar persona para reordenar (cambia `sort_order`)
- Arrastrar esquina de selección para marcar rango (similar a Google Sheets)

### 7.3. Feedback háptico
- Tooltip al hacer hover sobre un código explicando su significado
- Confirmación visual al marcar (el badge hace un pequeño "pop")
- Toast "Guardado" con checkmark verde cuando se confirma en servidor

### 7.4. Carga vacía / estados
- **Loading**: skeleton shimmer con 5 filas de celdas grises animadas
- **Empty**: ilustración simple + "Este calendario está vacío. Añade personas para empezar"
- **Error**: card con icono de error + "No se pudo cargar" + botón "Reintentar"

---

## 8. Temporada / Contexto

- Fondo sutil del calendario que cambia según el mes (ej: diciembre tonos fríos, julio tonos cálidos)
- Días festivos marcados con un punto rojo o icono pequeño
- Fines de semana con fondo ligeramente distinto (`bg-slate-100 dark:bg-slate-800/50`)

---

## 9. Ejemplo visual (Grid)

```
┌──────────────────────────────────────────────────────────────┐
│  📅 Julio 2026                                    [Exportar] │
│  ◄  Junio          ● Julio          Agosto  ►                │
│                                                              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────┐│
│  │  Lun 30  │ │  Mar 1   │ │  Mie 2   │ │  Jue 3   │ │ Vie 4││
│  │ ┌──────┐ │ │ ┌──────┐ │ │ ┌──────┐ │ │ ┌──────┐ │ │ ...  ││
│  │ │  TM  │ │ │ │  TM  │ │ │ │  FV  │ │ │ │      │ │ │      ││
│  │ │ Pepe │ │ │ │ Pepe │ │ │ │ Pepe │ │ │ │ Pepe │ │ │      ││
│  │ ├──────┤ │ │ ├──────┤ │ │ ├──────┤ │ │ ├──────┤ │ │      ││
│  │ │  TT  │ │ │ │      │ │ │ │  OC  │ │ │ │  TT  │ │ │      ││
│  │ │ Ana  │ │ │ │ Ana  │ │ │ │ Ana  │ │ │ │ Ana  │ │ │      ││
│  │ └──────┘ │ │ └──────┘ │ │ └──────┘ │ │ └──────┘ │ │      ││
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────┘│
│                                                              │
│  [👤 + Añadir persona]    Leyenda: ●TM ●TT ●TN ●FV ●FN ●OC │
│                                                              │
│  Personas: Pepe · Ana · Resi · Oscar · Clara · Merino · ...  │
└──────────────────────────────────────────────────────────────┘
```

---

## 10. Prioridad de implementación

| Prioridad | Feature | Esfuerzo |
|---|---|---|
| 🔴 P0 | Paleta de color unificada + modo oscuro consistente | Bajo |
| 🔴 P0 | Badges de código con opacidad y color estandarizados | Bajo |
| 🔴 P0 | Responsive básico (móvil/tablet/escritorio) | Medio |
| 🟡 P1 | Sidebar + bottom nav | Medio |
| 🟡 P1 | Animaciones suaves (hover, fade, skeleton) | Medio |
| 🟡 P1 | Tooltips en códigos con significado | Bajo |
| 🟢 P2 | Atajos de teclado | Medio |
| 🟢 P2 | Drag & drop reordenar personas | Alto |
| 🟢 P2 | Sparklines en dashboard | Alto |
| 🔵 P3 | Cambio de fondo por temporada | Bajo |
| 🔵 P3 | Festivos y fines de semana marcados | Medio |
| 🔵 P3 | Atajos de teclado avanzados (Ctrl+Z, rangos) | Alto |
