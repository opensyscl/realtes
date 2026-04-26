# Real State Valencia — API Reference

Base URL: `http://localhost:58000/api` (en producción, sustituye por el dominio de tu instancia).

Toda respuesta es JSON. Toda petición autenticada espera el header:

```
Authorization: Bearer <TU_TOKEN>
Accept: application/json
```

---

## Índice

1. [Autenticación](#1-autenticación)
2. [Tokens API (Personal Access Tokens)](#2-tokens-api)
3. [Propiedades](#3-propiedades)
4. [Leads (CRM)](#4-leads-crm)
5. [Pipelines y Stages](#5-pipelines-y-stages)
6. [Contratos](#6-contratos)
7. [Personas](#7-personas)
8. [Cargos y Pagos](#8-cargos-y-pagos)
9. [Comisiones](#9-comisiones)
10. [Endpoints públicos (sin auth)](#10-endpoints-públicos-sin-auth)
11. [Filtros, paginación y errores](#11-filtros-paginación-y-errores)
12. [Rate limits](#12-rate-limits)

---

## 1. Autenticación

Todos los endpoints (excepto los de la sección 10) requieren un Bearer token. Hay dos formas de obtener uno:

### Login con email y password

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "tu@email.com",
  "password": "tu-password",
  "device_name": "mi-app"
}
```

Respuesta:
```json
{
  "token": "53|Xjr81x1mbb1VN8L8eD28u7g2rwYNUtWqbCNFI1yua82d0cac",
  "user": {
    "id": 10,
    "name": "María",
    "email": "tu@email.com",
    "agency": { "id": 2, "slug": "mediterraneo" }
  }
}
```

> **Recomendación:** para integraciones externas usa la sección 2 (tokens con scopes) en vez de login con password.

### Tu identidad

```http
GET /api/auth/me
Authorization: Bearer <TOKEN>
```

### Logout

```http
POST /api/auth/logout
```

Revoca el token usado en la petición.

---

## 2. Tokens API

Personal Access Tokens generados desde **Ajustes → API & Tokens**, ideales para integraciones, scripts, apps móviles, etc.

### Listar tokens

```http
GET /api/tokens
```

Respuesta:
```json
{
  "data": [
    {
      "id": 54,
      "name": "Mi App Externa",
      "abilities": ["properties:read", "leads:read"],
      "last_used_at": "2026-04-26T14:16:59+00:00",
      "created_at": "2026-04-26T14:00:00+00:00",
      "preview": "rsv_…0054"
    }
  ],
  "available_abilities": [
    "properties:read", "properties:write",
    "leads:read", "leads:write",
    "contracts:read",
    "persons:read", "persons:write",
    "*"
  ]
}
```

### Crear un token

```http
POST /api/tokens

{
  "name": "App móvil",
  "abilities": ["properties:read", "leads:write"]
}
```

Respuesta (el `plain_text_token` solo se devuelve **una vez** — guárdalo):
```json
{
  "data": {
    "id": 55,
    "name": "App móvil",
    "abilities": ["properties:read", "leads:write"],
    "plain_text_token": "55|XXXX...XXXX"
  }
}
```

### Revocar

```http
DELETE /api/tokens/{id}
```

---

## 3. Propiedades

### Listar (con filtros y paginación)

```http
GET /api/properties?search=valencia&status=disponible&listing_type=alquiler&min_price=600&max_price=2000&bedrooms_min=2&page=1&per_page=12&sort=created_at&dir=desc
```

Filtros aceptados: `search`, `status`, `type`, `listing_type`, `city`, `min_price`, `max_price`, `bedrooms_min`, `bathrooms_min`, `area_min`, `area_max`, `is_published`, `is_shared`, `agent_id`.

Respuesta:
```json
{
  "data": [
    {
      "id": 80,
      "code": "P-KLYIZI",
      "title": "Casa en Cabanyal",
      "type": "casa",
      "status": "disponible",
      "listing_type": "venta",
      "bedrooms": 3,
      "bathrooms": 2,
      "area_sqm": 238,
      "address": "Praza Laura, 311, 9º A",
      "city": "Valencia",
      "postal_code": "46025",
      "price_rent": null,
      "price_sale": 350000,
      "community_fee": 65.84,
      "features": ["ascensor", "fibra_optica", "terraza"],
      "tags": ["luminoso"],
      "cover_image_url": "https://..."
    }
  ],
  "meta": {
    "current_page": 1,
    "last_page": 5,
    "per_page": 12,
    "total": 56
  }
}
```

### Stats agregadas

```http
GET /api/properties/stats
```

Devuelve: `total`, `available`, `occupied`, `avg_rent`, etc.

### Mapa (geo-points)

```http
GET /api/properties/map?bounds=lat1,lng1,lat2,lng2
```

### Obtener una propiedad

```http
GET /api/properties/{id}
```

### Crear

```http
POST /api/properties

{
  "title": "Apartamento en Russafa",
  "type": "apartamento",
  "listing_type": "alquiler",
  "address": "Calle Cuba 12",
  "city": "Valencia",
  "bedrooms": 2,
  "bathrooms": 1,
  "area_sqm": 78,
  "price_rent": 1200,
  "is_published": true,
  "features": ["balcon", "ascensor"]
}
```

### Actualizar

```http
PATCH /api/properties/{id}
```

Mismos campos que crear, todos opcionales.

### Eliminar (soft delete)

```http
DELETE /api/properties/{id}
```

### Operaciones masivas

```http
POST /api/properties/bulk

{
  "ids": [10, 11, 12],
  "action": "publish" | "unpublish" | "delete" | "set_status",
  "status": "ocupada"
}
```

### Compartir en marketplace cross-broker

```http
POST /api/properties/{id}/share

{
  "is_shared": true,
  "share_pct": 50
}
```

### Documentos y fotos

```http
GET    /api/properties/{id}/documents
POST   /api/properties/{id}/documents     (multipart/form-data, campo "file")
GET    /api/properties/{id}/photos
POST   /api/properties/{id}/photos        (multipart, campo "photo")
POST   /api/photos/{media}/set-cover
DELETE /api/documents/{media}
```

### Analytics de una propiedad

```http
GET /api/properties/{id}/analytics
```

---

## 4. Leads (CRM)

### Board (agrupado por stage)

```http
GET /api/leads?pipeline_id=1&status=open
```

Respuesta:
```json
{
  "data": {
    "1": [ { "id": 47, "code": "L-QKCBP5", "title": "...", "stage_id": 1, "position": 0, ... } ],
    "2": [ ... ]
  }
}
```

### Crear lead

```http
POST /api/leads

{
  "title": "Interesado en piso en Russafa",
  "pipeline_id": 1,
  "stage_id": 1,
  "contact_name": "Juan",
  "contact_email": "juan@ejemplo.com",
  "contact_phone": "+34 600 000 000",
  "property_id": 87,
  "source": "web",
  "value": 1200,
  "probability_pct": 20
}
```

### Mover lead entre stages (kanban drag & drop)

```http
POST /api/leads/{id}/move

{
  "stage_id": 2,
  "position": 0
}
```

### Convertir lead a contrato

```http
POST /api/leads/{id}/convert

{
  "monthly_rent": 1200,
  "start_date": "2026-05-01",
  "duration_months": 12
}
```

### Convertir lead (de captación) a propiedad

```http
POST /api/leads/{id}/convert-to-property
```

### Actividades del lead

```http
GET  /api/leads/{id}/activities
POST /api/leads/{id}/activities

{
  "type": "call" | "note" | "email" | "visit",
  "title": "Llamada de seguimiento",
  "body": "Hablamos de la visita del jueves",
  "occurred_at": "2026-04-26T15:00:00Z"
}
```

### Mostrar / actualizar / borrar

```http
GET    /api/leads/{id}
PATCH  /api/leads/{id}
DELETE /api/leads/{id}
```

---

## 5. Pipelines y Stages

### Listar pipelines

```http
GET /api/pipelines
```

Devuelve cada pipeline con sus stages anidados.

### Crear pipeline

```http
POST /api/pipelines

{
  "name": "Captación residencial",
  "purpose": "captacion",
  "stages": [
    { "name": "Nuevo", "color": "neutral", "probability_pct": 10 },
    { "name": "Visita", "color": "info", "probability_pct": 50 },
    { "name": "Firmado", "color": "positive", "probability_pct": 100, "is_won": true }
  ]
}
```

`purpose`: `alquiler` | `venta` | `captacion` | `otros`.

### Actualizar / eliminar pipeline

```http
PATCH  /api/pipelines/{id}
DELETE /api/pipelines/{id}
```

### Stages

```http
POST   /api/pipelines/{pipelineId}/stages
PATCH  /api/stages/{id}
DELETE /api/stages/{id}
POST   /api/pipelines/{pipelineId}/stages/reorder

{ "order": [3, 1, 4, 2] }
```

---

## 6. Contratos

```http
GET    /api/contracts?status=vigente&page=1
GET    /api/contracts/{id}
POST   /api/contracts
PATCH  /api/contracts/{id}
DELETE /api/contracts/{id}
```

Campos del POST:
```json
{
  "code": "C-2026-0001",
  "property_id": 87,
  "tenant_id": 12,
  "owner_id": 5,
  "start_date": "2026-05-01",
  "end_date": "2027-04-30",
  "monthly_rent": 1200,
  "deposit": 2400,
  "status": "vigente"
}
```

---

## 7. Personas

```http
GET    /api/persons?search=juan&type=tenant
GET    /api/persons/{id}
POST   /api/persons
PATCH  /api/persons/{id}
DELETE /api/persons/{id}
```

Campos:
```json
{
  "first_name": "Juan",
  "last_name": "García",
  "email": "juan@x.com",
  "phone": "+34 600 000 000",
  "type": "tenant" | "owner" | "lead"
}
```

---

## 8. Cargos y Pagos

```http
GET   /api/charges?status=pendiente&due_before=2026-05-01
GET   /api/charges/{id}
GET   /api/charges/stats
POST  /api/charges/generate           # genera la mensualidad de los contratos vigentes
```

### Pagos

```http
POST /api/payments

{
  "charge_id": 123,
  "amount": 1200,
  "method": "transferencia" | "efectivo" | "tarjeta",
  "paid_at": "2026-04-26"
}

DELETE /api/payments/{id}
```

---

## 9. Comisiones

```http
GET   /api/commissions?status=pending
GET   /api/commissions/stats
GET   /api/contracts/{id}/commissions
POST  /api/contracts/{id}/commissions
PATCH /api/commissions/{id}
POST  /api/commissions/{id}/pay
DELETE /api/commissions/{id}
```

---

## 10. Endpoints públicos (sin auth)

Para escaparate público de cada agencia. Identificada por `slug`.

```http
GET  /api/public/{slug}                       # info de la agencia + template
GET  /api/public/{slug}/properties            # listing
GET  /api/public/{slug}/properties/{id}       # detalle de propiedad publicada
POST /api/public/{slug}/leads                 # captura de lead desde el formulario
```

Ejemplo de captura de lead:
```bash
curl -X POST -H "Content-Type: application/json" \
  -d '{"name":"Juan","email":"juan@x.com","property_id":87,"message":"Quiero verla"}' \
  http://localhost:58000/api/public/mediterraneo/leads
```

Respuesta:
```json
{ "ok": true, "lead_code": "L-ABC123", "deduped": false }
```

Si el mismo email pide info de la misma propiedad < 24h, `deduped: true` y se añade actividad al lead existente en vez de duplicar.

---

## 11. Filtros, paginación y errores

### Paginación
- `page` (default `1`)
- `per_page` (default `15`, max `100`)
- Respuesta incluye `meta.current_page`, `meta.last_page`, `meta.total`.

### Ordenado
- `sort` (campo) + `dir` (`asc` | `desc`).

### Errores

| Código | Significado |
|--------|-------------|
| `400` | Sintaxis inválida |
| `401` | Token ausente o inválido |
| `402` | Límite de plan alcanzado (devuelve `feature` + `current` + `limit`) |
| `403` | Token sin la ability necesaria |
| `404` | Recurso no existe o no es de tu agencia |
| `422` | Validación falló — `errors` por campo |
| `429` | Rate limit superado |

Formato del error:
```json
{
  "message": "El correo ya existe.",
  "errors": {
    "email": ["El correo ya existe."]
  }
}
```

---

## 12. Rate limits

| Endpoint | Límite |
|----------|--------|
| `POST /api/auth/login` | 6/min por IP |
| `POST /api/auth/register` | 3 cada 10 min por IP |
| `POST /api/public/{slug}/leads` | 5/min y 30/h por IP |
| Resto | sin límite específico, sujeto al plan |

Cuando se supera, la respuesta es `429 Too Many Requests` con header `Retry-After`.
