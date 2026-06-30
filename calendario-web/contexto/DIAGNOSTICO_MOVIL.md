# Diagnóstico Móvil — Calenadarier

## Problemas detectados

### 1. GridView (Cuadrícula mensual) — *crítico*

**Síntoma:**  
En móvil (<768px), la cuadrícula de 7 columnas se renderiza con `grid-template-columns: repeat(7, 1fr)`. Cada celda contiene N chips de persona (uno por participante), apilados verticalmente. Esto produce:

- **Corte horizontal:** Las 7 columnas exceden el ancho de la pantalla; no hay overflow-x:auto en el contenedor, así que los últimos días se ocultan o rompen el layout.
- **Saturación vertical:** Cada celda mide `min-height: 5.5rem` (88px) y los chips se apilan dentro. Con 5+ personas, una semana puede ocupar 600+ px de alto.

**Causa raíz:**  
El componente GridView no tiene ninguna adaptación móvil. Usa el mismo layout de escritorio en todos los tamaños. No hay media queries ni detección de viewport.

**Archivo:** `src/components/GridView.tsx`

### 2. TableView (Tabla diaria) — *aceptable con matices*

**Síntoma:**  
La tabla horizontal funciona gracias a `overflow-x: auto` y columnas sticky (Fecha/Dia a la izquierda, Libres a la derecha). Sin embargo:

- Con muchas personas, la tabla se vuelve muy ancha y el scroll horizontal es incómodo.
- Las cabeceras sticky pueden solaparse en pantallas muy pequeñas.

**Estado:** **Funcional** — el scroll horizontal es un compromiso aceptable para datos tabulares en móvil.

**Archivo:** `src/components/TableView.tsx`

### 3. CalendarView (Selector de pestañas) — *mejorable*

**Síntoma:**  
Por defecto muestra "Cuadrícula" (el peor view para móvil). El usuario tiene que cambiar manualmente a "Tabla diaria" cada vez.

**Causa raíz:**  
`const [tab, setTab] = useState<"grid" | "table">("grid")` — sin detección deviewport.

**Archivo:** `src/components/CalendarView.tsx`

## Recomendación

1. **Detectar móvil** en CalendarView y mostrar "Tabla diaria" por defecto.
2. **Ocultar la pestaña "Cuadrícula" en móvil** — no es usable en pantallas estrechas.
3. **Mantener Cuadrícula en desktop** donde las 7 columnas y chips verticales funcionan bien.
