# Cloudflare R2 — Setup

## Credenciales

`.env`:
```
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_ENDPOINT=https://<account_id>.r2.cloudflarestorage.com
R2_BUCKET=realtes
R2_PUBLIC_URL=https://pub-xxxxxxxx.r2.dev
MEDIA_DISK=r2
```

## CORS del bucket

En R2 Dashboard → bucket `realtes` → **Settings** → **CORS Policy** → pega:

```json
[
  {
    "AllowedOrigins": [
      "http://localhost:3001",
      "https://*.realstatevalencia.com"
    ],
    "AllowedMethods": ["GET", "PUT", "POST", "HEAD"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```

> Cuando tengas dominio de producción, sustituye `https://*.realstatevalencia.com`
> por el dominio real (ej. `https://app.tudominio.com`).

## Cómo se usa

- **Spatie Media Library** lee `MEDIA_DISK=r2` en runtime — todo `addMedia(...)` se
  guarda en R2 sin tocar código de upload.
- `Storage::disk('r2')->url($path)` devuelve la URL pública concatenando
  `R2_PUBLIC_URL` + path del objeto.
- **Visibility**: el disk está configurado con `'visibility' => 'public'`, así que
  los objetos quedan accesibles vía la URL pública por defecto.

## Test rápido

```bash
docker exec rsv-php php artisan tinker
> Storage::disk('r2')->put('test.txt', 'hola');
> Storage::disk('r2')->url('test.txt');
# → https://pub-xxxxxxxx.r2.dev/test.txt
```

## Notas

- `region: 'auto'` siempre en R2 (no usa regions reales).
- `use_path_style_endpoint: true` siempre — R2 no soporta virtual-hosted style.
- Si cambias `MEDIA_DISK`, las fotos antiguas en `storage/app/public` siguen ahí
  (no se migran automáticamente). Solo las nuevas van a R2.
