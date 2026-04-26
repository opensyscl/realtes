<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class UploadController extends Controller
{
    /**
     * POST /api/uploads/property-cover
     * Body (multipart): file, property_id (opcional)
     *
     * Sube la imagen de portada de una propiedad a R2 con estructura:
     *   agencies/{agency_id}/properties/{property_id|_pending}/cover/{uuid}.{ext}
     *
     * Devuelve `{ url, key }` para que el frontend guarde la URL pública en
     * `cover_image_url` del form. Si la propiedad aún no existe (creación),
     * se usa el bucket `_pending` y al guardar el form el path se mantiene tal cual
     * (no movemos el archivo — la URL pública sigue funcionando).
     */
    public function propertyCover(Request $request): JsonResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'image', 'max:10240'],
            'property_id' => ['nullable', 'integer'],
        ]);

        $agencyId = $request->user()->agency_id;
        $propertyPart = $request->integer('property_id') ?: '_pending';

        $file = $request->file('file');
        $ext = $file->getClientOriginalExtension() ?: 'webp';
        $name = Str::uuid()->toString().'.'.$ext;

        $key = "agencies/{$agencyId}/properties/{$propertyPart}/cover/{$name}";

        $disk = Storage::disk(config('media-library.disk_name', 'public'));
        $disk->put($key, file_get_contents($file->getRealPath()), 'public');

        return response()->json([
            'data' => [
                'key' => $key,
                'url' => $disk->url($key),
            ],
        ], 201);
    }
}
