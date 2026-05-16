# Contexto de sesión — realtes (2026-05-16)

Documento de traspaso para continuar en otra PC. Resume todo lo hecho, lo pendiente
y cómo levantar el entorno desde cero.

---

## 1. Resumen de la sesión

Se trabajó sobre el SaaS inmobiliario **realtes** (`/home/jos/josbert.dev/real-state-valencia`).
Mercado objetivo confirmado: **Chile** (UF/CLP, "arriendo", "corredora"). El nombre de la
carpeta dice "valencia" pero Valencia es un cliente, no el mercado.

Tres bloques de trabajo:

1. **Research + roadmap maestro** — investigación de diseño (Lazyweb) + integración de
   portales chilenos + features de Kommo/AlterEstate. Reporte en
   `.lazyweb/design-research/crm-erp-inmobiliario-2026-05-16/` (ojo: `.lazyweb/` está
   gitignored — ver sección 7).
2. **Hub de Canales — Hito 1** — arquitectura de publicación multi-portal (ver sección 4).
3. **Dashboard rediseñado** — al layout estilo Kravio (ver sección 5).

---

## 2. Levantar el entorno en la otra PC

```bash
cd real-state-valencia

# 1. Backend env — el .env NO viaja por git, hay que recrearlo
cp backend/.env.example backend/.env
#   editar backend/.env: APP_KEY, DB (hostnames docker internos), etc.
#   ML_CLIENT_ID / ML_CLIENT_SECRET quedan vacíos hasta conectar Mercado Libre.

# 2. Levantar servicios docker (SIN el servicio frontend — ese corre en host)
docker compose up -d postgres redis meilisearch mailpit php nginx

# 3. Dependencias backend + key + migraciones + seed
docker exec rsv-php composer install
docker exec rsv-php php artisan key:generate
docker exec rsv-php php artisan migrate --seed
docker exec rsv-php php artisan db:seed --class=ChannelsDemoSeeder   # data demo del Hub

# 4. Frontend (correr en el HOST, no en docker — el container ensucia permisos)
cd frontend && pnpm install && pnpm dev
```

| Servicio | URL |
|---|---|
| Frontend | http://localhost:3001 (o 3000) |
| API (Nginx) | http://localhost:58000 |
| Mailpit | http://localhost:58025 |
| Meilisearch | http://localhost:57700 |
| Postgres | localhost:55432 · Redis localhost:56379 |

Login demo: `hola@bookforce.io` / `password`.

**Importante:** no usar el servicio `frontend` de `docker compose` — corre como root y
deja archivos root-owned en `.next/` que rompen Turbopack. El dev server se corre en el
host con `pnpm dev`.

---

## 3. Estado de git

- Repo: `git@github.com:opensyscl/realtes.git` · branch `main`.
- **Todo el trabajo de esta sesión está SIN COMMITEAR** (17 archivos en working tree).
- Para que viaje a la otra PC hay que commitear y pushear. Archivos:
  - Modificados: `.gitignore`, `backend/routes/api.php`,
    `frontend/src/app/(app)/dashboard/page.tsx`,
    `frontend/src/app/(app)/propiedades/[id]/page.tsx`, `frontend/src/lib/queries.ts`
  - Nuevos: `backend/app/Http/Controllers/Api/ChannelController.php`,
    `backend/app/Models/{Channel,AgencyChannel,ChannelPublication}.php`,
    `backend/app/Services/Channels/`, 4 migraciones `2026_05_16_*`,
    `backend/database/seeders/ChannelsDemoSeeder.php`,
    `frontend/src/components/properties/channels-publication-card.tsx`,
    `CONTEXTO-SESION.md` (este archivo).

---

## 4. Hub de Canales — Hito 1 (hecho)

Generaliza la integración hardcodeada de Mercado Libre a una arquitectura de canales
"publicar una vez → sale en todos".

**Base de datos** (4 migraciones `2026_05_16_*`, ya corridas):
- `channels` — catálogo (mercadolibre, proppit, toctoc, yapo). Filas insertadas en la
  propia migración.
- `agency_channels` — conexión + credenciales encriptadas por corredora. Generaliza `ml_tokens`.
- `channel_publications` — estado por propiedad × canal. Generaliza `ml_publications`.
- Migración de backfill no destructiva: copia `ml_tokens`/`ml_publications` → tablas nuevas.

**Capa de servicios** (`backend/app/Services/Channels/`):
- `Contracts/ChannelDriver.php` — interfaz que implementa cada canal.
- `ChannelManager.php` — resuelve drivers, expone conexiones.
- `Drivers/MercadoLibreDriver.php` — delega en `MlPropertyPublisher` y espeja a `channel_publications`.

**API** (`ChannelController` + rutas en `routes/api.php`):
- `GET /api/channels`
- `GET /api/properties/{property}/publications`
- `POST /api/properties/{property}/channels/{channel}/publish`
- `POST /api/properties/{property}/channels/{channel}/sync`
- `PATCH /api/properties/{property}/channels/{channel}/status`
- `DELETE /api/properties/{property}/channels/{channel}`

**Frontend:**
- Hooks en `queries.ts`: `useChannelPublications`, `usePublishToChannel`,
  `useSyncChannel`, `useSetChannelStatus`, `useUnpublishChannel`.
- `channels-publication-card.tsx` — card "Publicar en canales", montada en el detalle
  de propiedad (reemplazó a `MlPublicationButtons`).

**Data demo:** `ChannelsDemoSeeder` siembra conexiones + 28 publicaciones en estados
variados. Re-corrible: `php artisan db:seed --class=ChannelsDemoSeeder`.

### Pendiente del Hito 1 — el "corte" de Mercado Libre

ML es **dual-path**: `MlController`/`ml_tokens`/`ml_publications` siguen vivos en
paralelo. El `MercadoLibreDriver` todavía delega en el flujo viejo. Falta:
- Que el driver lea credenciales de `agency_channels` (no `ml_tokens`).
- Unificar `MlAuthController` (OAuth) al Hub.
- Dropear tablas `ml_*` y borrar `ml-publication-card.tsx` (quedó huérfano).

---

## 5. Dashboard rediseñado (layout Kravio)

`frontend/src/app/(app)/dashboard/page.tsx` reescrito al layout de la referencia
`WhatsApp Image 2026-02-25 at 1.42.32 PM.jpeg`:
- Franja de indicadores económicos (UF/UTM/USD/EUR) arriba.
- Saludo + pill de período.
- Grid: izquierda (3 KPI cards con sparkline + gráfico de barras de actividad semanal),
  derecha (panel "Últimas novedades" alto).
- Tabla "Seguimiento de cobros" abajo.
- Se eliminaron: banner promo, sección Colaboraciones, las 2 cards inferiores.
- Datos: endpoints `dashboard/overview`, `activity-volume`, `activity-feed` (ya existían)
  + `useCharges` para la tabla.

---

## 6. Mercado Libre — TEMA PENDIENTE / SIN RESOLVER

El usuario sostiene que ya integró Mercado Libre. Estado verificado en este entorno local:
- El **código** de la integración ML existe y está commiteado (commits `feat(ml)`).
- Pero: `ml_tokens` = 0 filas, `ml_publications` = 0 filas, y `backend/.env` **no tiene**
  `ML_CLIENT_ID` / `ML_CLIENT_SECRET`. Las migraciones ML estaban *pendientes* al
  arrancar la sesión (señal de un `migrate:fresh` previo que borró la conexión).
- Lo que se ve "conectado" en el Hub es **data DEMO falsa** del `ChannelsDemoSeeder`.

**Pendiente de aclarar con el usuario:** ¿dónde conectó ML — en un server deployado o
local? ¿Tiene el `ML_CLIENT_ID`/`ML_CLIENT_SECRET` a mano? El usuario de ML mencionado
es `joheandroid@gmail.com`. Para reactivar ML local: poner las credenciales de la app en
`backend/.env` y rehacer el OAuth desde Ajustes → Integraciones.

---

## 7. Roadmap maestro — "el mejor ERP/CRM inmobiliario"

Reporte completo en `.lazyweb/design-research/crm-erp-inmobiliario-2026-05-16/report.md`
+ `report.html` + 15 screenshots de referencia. **`.lazyweb/` está gitignored** — si se
quiere en la otra PC, copiar la carpeta manualmente (no viaja por git).

5 hitos:
1. **Hub de Canales** — hecho (Hito 1), falta el corte de ML (sección 4).
2. **Portal Inmobiliario + Proppit** — Portal Inmobiliario es ML + atributo `CMG_SITE: POI`
   (esfuerzo: horas). Proppit: un feed XML cubre Trovit/Mitula/iCasas/Nestoria/OLX/Properati.
3. **Inbox omnicanal** — WhatsApp Cloud API pegado al lead.
4. **Motor de Automatizaciones** — "Digital Pipeline": acciones automáticas por etapa.
5. **Diferenciadores** — matching propiedad↔lead, lead scoring, agenda de visitas.

Portales chilenos (research técnico): orden recomendado Portal Inmobiliario → Proppit →
TocToc → Yapo. Doomos y Económicos: fuera de scope (sin API pública).

---

## 8. Cosas que NO viajan por git

| Qué | Cómo recuperarlo en la otra PC |
|---|---|
| `backend/.env` | Recrear desde `.env.example` (sección 2) |
| Base de datos Postgres | Se recrea con `migrate --seed` + `ChannelsDemoSeeder` |
| `.lazyweb/` (reporte de research) | Copiar la carpeta a mano si se quiere |
| Memoria de Claude Code | Está en `~/.claude/projects/-home-jos-josbert-dev/memory/` — copiar esa carpeta si se quiere conservar el contexto de Claude entre PCs |
| `vendor/`, `node_modules/` | `composer install` / `pnpm install` |

---

## 9. Próximos pasos sugeridos

1. Resolver el tema de Mercado Libre (sección 6).
2. Completar el corte de ML al Hub (sección 4).
3. Hito 2 del roadmap: Portal Inmobiliario (`CMG_SITE`) + driver Proppit (feed XML).
4. Revisar el dashboard rediseñado en `/dashboard` y ajustar detalles visuales.
