# Estrategia de Monetización — Calenadarier

## Modelo propuesto: **Freemium + SaaS por suscripción**

---

## 1. Planes y precios

| Plan | Precio | Límites | Ideal para |
|---|---|---|---|
| **Gratuito** | €0 (con anuncios) | Hasta 10 personas, 2 meses simultáneos, puedes unirte a 3 calendarios pero solo crear 1 | Grupos de amigos, pruebas |
| **Pro** | €4.99/mes o €49/año | Calendarios ilimitados, personas ilimitadas, todos los meses del año, exportación Excel, estadísticas avanzadas | Pequeñas empresas, restaurantes, departamentos |
| **Team** | €14.99/mes o €149/año | Todo lo de Pro + roles (admin/editor/viewer), múltiples grupos, integración con Google Calendar/Outlook, API para integraciones | Empresas con varios equipos, hostelería |
| **Enterprise** | Personalizado | Todo lo de Team + gestores con visibilidad total, privacidad entre miembros, SSO, on-premise / VPC, SLA | Grandes empresas, franquicias, cadenas hoteleras |

---

## 2. Features por plan

### Gratuito (con anuncios)
- Calendario de disponibilidad básico (grid + tabla)
- Códigos de turno estándar (TM, TT, TN, FV, FN, OC, RE, OT, CL)
- Vista resumen básica
- Planes de grupo (máx. 3 activos)
- Unirte hasta a 3 calendarios, pero solo crear 1
- Autenticación por nombre + contraseña
- Anuncios no intrusivos (banners discretos)

### Pro (todo Gratuito +)
- Exportación a Excel con formato completo
- Exportación a PDF / CSV
- Historial de cambios (audit log)
- Eventos personalizados ilimitados
- Planes de grupo ilimitados
- Estadísticas avanzadas (% ocupación por persona, tendencias)
- Tema claro/oscuro
- Sin anuncios

### Team (todo Pro +)
- Roles y permisos (admin, editor, viewer)
- Múltiples calendarios por organización
- Notificaciones por email/Telegram/WhatsApp
- Integración de calendario externo (Google, Outlook)
- API REST para integraciones propias
- Importación desde Excel
- Plantillas de calendario (preconfiguradas por sector)

### Enterprise (todo Team +)
- **Gestores con visibilidad total**: los managers pueden crear calendarios y ver la disponibilidad de todos los miembros
- **Privacidad entre miembros**: los trabajadores ven su propia disponibilidad pero NO la del resto del equipo
- Estructura jerárquica: empresa → departamentos → equipos → empleados
- SSO (SAML/OIDC)
- On-premise o VPC dedicada
- SLA 99.9%
- Soporte prioritario 24/7
- Custom branding (logo, colores, dominio)
- Auditoría completa
- Formación del equipo

---

## 3. Canales de monetización adicionales

### 3.1. Exportación avanzada (micro-pago)
- **€0.99/exportación** para usuarios gratuitos que necesiten una exportación puntual a Excel sin contratar Pro

### 3.2. Marketplace de plantillas
- Plantillas sectoriales: hostelería, sanidad (turnos de enfermería), logística, limpieza
- Venta individual (€2.99) o incluidas en Team/Enterprise

### 3.3. SMS / WhatsApp recordatorios
- Créditos para enviar recordatorios a miembros del grupo que no han marcado disponibilidad
- **€0.05/recordatorio** o paquetes (€5 = 120 recordatorios)

### 3.4. Consultoría e implementación (B2B)
- Implantación del sistema en empresas (€500-2000)
- Formación de equipos
- Personalización de códigos de turno y flujos

### 3.5. Donaciones / "Buy me a coffee"
- Para usuarios gratuitos que quieran apoyar el proyecto
- Sin expectativa de contraprestación

---

## 4. Crowdfunding y preventas

### 4.1. Preventas / Lifetime Deals (recomendado)
| Plan de preventa | Precio | Lo que incluye |
|---|---|---|
| **Founder Pack** | €29 (único pago) | Pro de por vida con todas las actualizaciones |
| **Founder Pack Team** | €79 (único pago) | Team de por vida (hasta 5 calendarios) |
| **Founder Pack Enterprise** | €249 (único pago) | Enterprise de por vida (hasta 20 calendarios) |

- Objetivo: validar demanda real antes de invertir más horas
- Landing page simple + anuncios a grupos de hostelería en Facebook/Instagram
- Si se venden 100 Founder Packs → **€2,900** que financian el desarrollo completo

### 4.2. Kickstarter / Crowdfunding
**Cuándo tiene sentido:** después de validar con preventas y tener comunidad (>500 usuarios gratuitos).

| Aspecto | Realidad |
|---|---|
| **Público objetivo** | Nicho español/hostelería — comunidad Kickstarter pequeña en España |
| **Mejor plataforma** | **Indiegogo** (más flexible, acepta más categorías SaaS) o **Crowd Supply** (mejor para herramientas técnicas) |
| **Meta mínima** | €5,000–€10,000 (suficiente para cubrir 1 año de desarrollo + infra) |
| **Recompensas típicas** | €10 → Menciones + pegatina; €29 → Pro 1 año; €49 → Pro de por vida; €149 → Team de por vida; €499 → Enterprise + consultoría |
| **Riesgo principal** | Sin audiencia previa, no se financia. Construir lista de email antes de lanzar |

### 4.3. GitHub Sponsors / Open Source
- Si abres el proyecto como open source (MIT o AGPL), los sponsors pueden cubrir costes recurrentes
- Modelo híbrido: código abierto + licencia Enterprise para empresas (AGPL → quienes quieran uso privativo pagan)

### 4.4. Estrategia recomendada (orden)
1. **Landing page** con preventa Founder Pack → valida si hay demanda real (mínimo 1 mes)
2. Si se alcanzan 50 ventas → acelerar desarrollo web full
3. Con 500+ usuarios gratuitos → lanzar Kickstarter/Indiegogo con meta €10K para features avanzados
4. Independientemente del crowdfunding, mantener suscripciones mensuales como ingreso recurrente

---

## 5. Estrategia de conversión

| Embudo | Acción |
|---|---|
| **Captación** | SEO para "calendario de turnos gratis", "organizar disponibilidad grupo", "cuadrante horario online" |
| **Activación** | Registro sin tarjeta, calendario funcional en < 2 minutos, onboarding guiado |
| **Retención** | Recordatorios semanales por email "tu calendario sigue activo", nuevas features anunciadas |
| **Conversión** | Bloqueo suave de features Pro con llamadas a la acción no intrusivas ("Desbloquea exportación Excel por €4.99/mes") |
| **Upgrade** | Al llegar a 10 personas → banner sugiriendo Pro; al crear segundo calendario → banner |
| **Referral** | Invita a 3 amigos → 1 mes Pro gratis |

---

## 6. Proyección financiera estimada (web, 12 meses)

| Métrica | Año 1 |
|---|---|
| Usuarios registrados | 5,000 |
| Tasa de conversión a Pro | 3% (150 usuarios) |
| Tasa de conversión a Team | 0.5% (25 usuarios) |
| Ingresos Pro (€49/año) | €7,350 |
| Ingresos Team (€149/año) | €3,725 |
| Exportaciones puntuales | ~€500 |
| **Total estimado** | **~€11,575** |
| Costes (Supabase + Vercel + dominio) | ~€2,400/año |
| **Margen bruto** | **~€9,175** |

> Ajustable según estrategia de precios y mercado objetivo.

---

## 7. Ventajas competitivas a destacar

- **100% en español** — pocos competidores en el mercado hispanohablante
- **Código de turnos específico para hostelería** (TM, TT, TN) — nicho claro
- **Doble modalidad** (web app + Excel exportable) para quienes necesitan papel/offline
- **Sin publicidad** en planes de pago (solo el plan gratuito tiene anuncios)
- **Open Source** (opcional: vender licencias Enterprise sobre código abierto)

---

## 8. Next Steps recomendados

1. Preparar landing page con preventa Founder Pack (€29 Pro de por vida)
2. Lanzar versión gratuita funcional (MVP web)
3. Validar demanda con preventas (objetivo: 50 ventas en 30 días)
4. Añadir pasarela de pago (Stripe)
5. Implementar bloqueos soft de features Pro
6. Lanzar campaña SEO para captar tráfico orgánico
7. Contactar directamente con pequeñas cadenas de hostelería para pilotos B2B
8. Recoger feedback y ajustar precios
9. Si hay tracción suficiente, lanzar Kickstarter/Indiegogo con meta €10K
