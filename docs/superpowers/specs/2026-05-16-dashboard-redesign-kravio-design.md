# Diseño — Rediseño del dashboard (estilo Kravio "SLA")

Fecha: 2026-05-16
Proyecto: realtes (CRM/ERP inmobiliario, mercado Chile)
Estado: aprobado para implementación

## 1. Contexto

El dashboard actual (`frontend/src/app/(app)/dashboard/page.tsx`) ya fue rediseñado a
un layout estilo Kravio en el commit `feat(dashboard): rediseño al layout estilo Kravio`.
Comparte el esqueleto con la nueva imagen de referencia: tira de indicadores económicos,
saludo, 3 KPI cards con sparkline, gráfico de barras semanal, panel lateral de novedades
y tabla inferior.

La referencia nueva (dashboard de soporte/SLA) agrega varios detalles que el dashboard
actual no tiene. Este documento define cómo llevar el dashboard a paridad 1:1 con esa
referencia, adaptando todos los datos al dominio inmobiliario (propiedades, contratos,
cobros) — no se introducen tickets de soporte.

El `page.tsx` actual tiene ~580 líneas con todo inline (`KpiCard`, `Sparkline`,
`DeltaChip`, `ActivityChart`, `UpdatesPanel`, `ChargesTable`). En `components/dashboard/`
existen archivos huérfanos del diseño previo (`kpi-card.tsx`, `latest-updates.tsx`,
`volume-chart.tsx`, `contracts-table.tsx`) que hoy no se importan.

## 2. Objetivos

- Paridad visual y funcional 1:1 con la referencia, con datos inmobiliarios reales.
- Controles interactivos funcionales de verdad (no decorativos), incluyendo cambios
  de backend donde haga falta.
- Partir el `page.tsx` monolítico en componentes enfocados y testeables.

## 3. No-objetivos (fuera de scope)

- Acciones masivas sobre la selección de filas de la tabla.
- Export CSV / exportaciones.
- Pantalla de configuración del dashboard.
- Tickets de soporte / SLA reales: la referencia es solo plantilla visual.

## 4. Decisión de arquitectura — período y gráfico

El gráfico de actividad lleva su **propio dropdown de período** en la card
(Semana / Mes / Trimestre), que controla solo ese gráfico — tal como la imagen de
referencia. Los KPI cards llevarán su propio selector aparte. Esto revisa el
Enfoque A original (que proponía un único selector global): el usuario optó por el
control per-card sobre la referencia.

El gráfico de barras se re-agrupa según el período, manteniendo siempre pocas barras:

| Período   | Buckets del gráfico              |
|-----------|----------------------------------|
| Semana    | 7 barras diarias (Dom–Sáb)       |
| Mes       | 4 barras semanales (~7 días c/u) |
| Trimestre | 3 barras mensuales               |

Default del gráfico: **Mes**. A nivel semana la data del negocio inmobiliario es
demasiado dispersa para ser informativa.

## 5. Layout y componentes

La página, de arriba hacia abajo:

### 5.1 Header de la página (`dashboard-header.tsx`)
- Breadcrumb "Inicio / Dashboard".
- Saludo "Hola {primer nombre} 👋" + subtítulo con el nombre de la agencia (se
  mantiene el texto actual).
- Arriba a la derecha: selector de período (dropdown) + menú de 3 puntos.
  - El menú de 3 puntos es un popover con una acción: "Actualizar datos" (refetch de
    las queries del dashboard).
- La campana de notificaciones y el ícono de settings ya viven en el topbar global
  (`components/layout/topbar.tsx`); no se duplican.

### 5.2 Indicadores económicos
Se mantiene el componente `EconomicIndicators` tal cual, en su posición actual
(arriba de todo, antes del header).

### 5.3 KPI cards x3 (`kpi-card.tsx` + `sparkline.tsx`)
Tres cards: Propiedades · Contratos vigentes · Tasa de cobro. Cada card: label +
ícono, número grande, chip de delta + texto "vs período anterior", sparkline.
El delta se recalcula según el período global elegido.

### 5.4 Gráfico de actividad (`volume-chart.tsx`) — IMPLEMENTADO
Card con: ícono + título, dropdown de período, número total grande + chip de delta,
barras. Respecto del gráfico anterior se agrega:
- Eje Y con valores de referencia (grilla) sobre el borde derecho.
- Trama diagonal decorativa en la mitad superior del área.
- Línea punteada horizontal sobre la barra activa (resaltada / con hover), con su
  tooltip "{etiqueta} : {valor}" anclado. No es una línea de promedio: sigue a la
  barra activa, como muestra la imagen de referencia.
Las barras se re-agrupan según el período (ver tabla 4). Este componente ya fue
implementado como primer slice del rediseño.

### 5.5 Panel "Últimas novedades" (`latest-updates.tsx`)
- Tabs: Hoy / Ayer / Semana. Filtran el feed por fecha **client-side** sobre el
  campo `created_at` que ya devuelve el endpoint.
- Buscador de texto: filtra los items por título/descripción, client-side.
- Contador: "N novedades" según el tab activo.
- Lista de items con ícono por tipo + timestamp (se mantiene el render actual).

### 5.6 Tabla "Seguimiento de cobros" (`charges-monitor-table.tsx`)
Tabla al estilo "SLA Monitoring" de la referencia.

Columnas (ordenables: Código, Concepto, Estado, Emitido, Vence — vía backend.
Prioridad y Corredor no son ordenables: la primera es derivada, la segunda
requeriría sort por relación):
| Columna   | Origen                                                        |
|-----------|---------------------------------------------------------------|
| Checkbox  | Selección local (paridad visual; sin acción masiva)           |
| Código    | `charge.code`                                                 |
| Concepto  | `charge.concept` + subtexto con el inquilino (`person.full_name`) |
| Prioridad | Derivada client-side (ver 5.6.1)                              |
| Corredor  | `charge.contract.agent` — avatar con iniciales + nombre       |
| Estado    | `charge.status` — badge (pagado/pendiente/vencido/parcial)    |
| Emitido   | `charge.issued_at`                                            |
| Vence     | `charge.due_date` + countdown (ver 5.6.2)                     |

Header de la card:
- Buscador: dispara el param `q` contra `/api/charges`.
- Botón "Filtrar": popover con checkboxes de estado; dispara el param `status`.
- Menú de 3 puntos: link "Ver todos los cargos" (→ `/cargos`).

El ordenamiento y los filtros se mandan al backend vía `useCharges` (el endpoint
`/api/charges` ya soporta `sort`, `dir`, `status`, paginación). `per_page` ~8.

#### 5.6.1 Derivación de Prioridad (client-side)
- **Alta**: `status === 'vencido'`.
- **Media**: no pagado y `due_date` dentro de los próximos 7 días.
- **Baja**: el resto.
Se renderiza con una barra/ícono de color (Alta = danger, Media = warning,
Baja = muted), usando tokens semánticos.

#### 5.6.2 Countdown de "Vence"
Calculado client-side desde `due_date` vs hoy:
- Futuro: "Vence en N días" (o "Vence hoy").
- Pasado y no pagado: "Vencido hace N días".
- Pagado: se muestra solo la fecha.

## 6. Cambios de backend

`backend/app/Http/Controllers/Api/DashboardController.php`:
- `overview(Request $request)`: leer `?period=week|month|quarter` (default `week`).
  Ajustar la ventana de comparación de los deltas (`subWeek` / `subMonth` /
  `subQuarter` en vez del `subMonth` fijo actual).
- `activityVolume(Request $request)`: leer `?period=week|month|quarter`. Devolver
  las barras re-agrupadas según el período (7 diarias / 4 semanales / 3 mensuales),
  más `total`, `average` y `delta_pct` (vs el período anterior). La actividad se
  cuenta por la fecha de dominio del evento (cargo emitido, pago recibido, contrato
  firmado), no por `created_at`, para reflejar cuándo ocurrió de verdad. —
  IMPLEMENTADO.
- `activityFeed`: sin parámetro nuevo (los tabs se resuelven client-side). Se sube
  el límite de items a ~20 para que el tab "Semana" tenga material.
- Fix puntual: `activityFeed` arma descripciones con `€` hardcodeado
  (`'€'.number_format(...)`). El mercado es Chile — se cambia a formato CLP.
- Fix puntual: `overview` cuenta las propiedades arrendadas con
  `status === 'arrendada'`, pero ese valor no existe en el modelo (estados
  válidos: `disponible`, `ocupada`, `mantenimiento`, `fuera_mercado`). Hoy
  `properties_active.rented` siempre devuelve 0. Se corrige a `ocupada`.

`backend/app/Http/Controllers/Api/ChargeController.php` (endpoint `/api/charges`):
- Aceptar param de búsqueda `q`: filtra por `code`, `concept` y nombre del
  inquilino relacionado.
- Incluir en el payload de cada charge la relación `contract.agent` como
  `{ id, name }` (eager load + en el resource/respuesta).

## 7. Cambios de frontend

`frontend/src/lib/queries.ts`:
- `useDashboardOverview(period)` y `useActivityVolume(period)`: aceptan el período
  como argumento, lo incluyen en el `queryKey` y como query param.
- `ActivityVolume` response type: agregar `average: number`.
- `ChargeFilters`: agregar `q?: string`.
- `Charge` type: agregar `contract.agent?: { id: number; name: string }`.

`frontend/src/app/(app)/dashboard/page.tsx`:
- Queda fino (~80 líneas): sostiene el estado `period` (useState) y compone los
  componentes, pasando `period` hacia abajo.

Nuevos / reescritos en `frontend/src/components/dashboard/`:
- `dashboard-header.tsx` — nuevo.
- `kpi-card.tsx` — se reescribe el huérfano.
- `sparkline.tsx` — nuevo (extraído del inline).
- `volume-chart.tsx` — se reescribe el huérfano (eje Y + línea de promedio).
- `latest-updates.tsx` — se reescribe el huérfano (tabs + buscador).
- `charges-monitor-table.tsx` — nuevo.
- `economic-indicators.tsx` — se mantiene sin cambios.
- `contracts-table.tsx` — se elimina si se confirma que no lo importa nadie.

Tokens semánticos en todo el CSS nuevo (`bg-primary`, `bg-danger`, `bg-warning`,
`text-positive`, etc.), cards `rounded-3xl border border-border`. Sin colores raw
de Tailwind.

## 8. Flujo de datos

```
page.tsx [estado: period]
  ├─ dashboard-header        → onChange(period), acción "Actualizar"
  ├─ kpi-card x3             ← useDashboardOverview(period)
  ├─ volume-chart            ← useActivityVolume(period)   [incluye average]
  ├─ latest-updates          ← useActivityFeed()  + filtro client-side por tab/texto
  └─ charges-monitor-table   ← useCharges({ q, status, sort, dir, per_page })
                               prioridad y countdown derivados client-side
```

El menú "Actualizar datos" invalida las queries `["dashboard"]` y `["charges"]`.

## 9. Manejo de errores y estados vacíos

- Cada componente mantiene su estado de loading (skeleton) y vacío, como el actual.
- La DB local hoy tiene 0 propiedades: el dashboard se verá vacío. Es esperado;
  los estados vacíos ya existen y se conservan. No es un caso a resolver acá.

## 10. Testing

- Backend: tests de feature para `DashboardController` — `overview` y
  `activityVolume` con cada valor de `period` (week/month/quarter) verificando la
  forma de la respuesta y el campo `average`. Test del param `q` en `/api/charges`.
- Frontend: verificación manual de los controles (período, tabs, buscador, orden,
  filtro) y de la derivación de prioridad/countdown. Si hay setup de tests de
  componentes, test unitario de las funciones puras de derivación (prioridad,
  countdown, re-agrupación de barras).
