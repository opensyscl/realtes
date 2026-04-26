# Real State Valencia — SaaS Inmobiliario

SaaS multi-tenant para gestión inmobiliaria (ERP + CRM) orientado a agencias en Valencia.

## Stack

- **Backend:** Laravel 11 · PHP 8.3 · PostgreSQL 16 + PostGIS · Redis · Meilisearch
- **Frontend:** Next.js 16 · TypeScript 5 · Tailwind CSS 4 · Hugeicons · TanStack Query/Table
- **Infra dev:** Docker Compose (un solo `docker compose up`)
- **Multi-tenancy:** `stancl/tenancy` — single DB con `tenant_id`, subdominio por agencia.

## Estructura

```
real-state-valencia/
├── backend/        Laravel API
├── frontend/       Next.js app (dashboard + portales)
├── docker/         Dockerfiles y configs
├── docker-compose.yml
└── plan-desarrollo.md
```

## Arrancar en local

```bash
cp .env.example .env
docker compose up -d
```

Servicios:

| Servicio      | URL / Puerto                    |
|---------------|---------------------------------|
| Frontend      | http://localhost:3000           |
| API (Nginx)   | http://localhost:8000           |
| Postgres      | localhost:5432                  |
| Redis         | localhost:6379                  |
| Meilisearch   | http://localhost:7700           |
| Mailpit       | http://localhost:8025           |

## Convenciones

- Cards: `rounded-3xl border border-border` (ver memoria `feedback_card_styling`).
- Iconos: **Hugeicons exclusivamente** (`@hugeicons/react`).
- Tipografía: **Euclid Circular B** (cargada desde `/frontend/public/fonts`).
- Nada de colores chillones en botones: paleta sobria (neutro + acentos mínimos).

Referencias visuales: dashboard Kravio + Villa Solara en la raíz del repo.
