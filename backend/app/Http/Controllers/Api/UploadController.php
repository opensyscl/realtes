<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Agency;
use App\Services\WatermarkService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class UploadController extends Controller
{
    public function __construct(private WatermarkService $watermark)
    {
    }

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
     *
     * Aplica el watermark de la agency con contexto `cover` antes de subir.
     */
    public function propertyCover(Request $request): JsonResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'image', 'max:10240'],
            'property_id' => ['nullable', 'integer'],
        ]);

        $agencyId = $request->user()->agency_id;
        $agency = Agency::find($agencyId);
        $propertyPart = $request->integer('property_id') ?: '_pending';

        $file = $request->file('file');
        $ext = $file->getClientOriginalExtension() ?: 'webp';
        $name = Str::uuid()->toString().'.'.$ext;

        $key = "agencies/{$agencyId}/properties/{$propertyPart}/cover/{$name}";

        // Aplicar watermark con contexto 'cover' antes de subir
        $processedPath = $agency
            ? $this->watermark->apply($file, $agency, 'cover')
            : $file->getRealPath();

        $disk = Storage::disk(config('media-library.disk_name', 'public'));
        $disk->put($key, file_get_contents($processedPath), 'public');

        // Cleanup tmp si el watermark generó un archivo nuevo
        if ($processedPath !== $file->getRealPath() && file_exists($processedPath)) {
            @unlink($processedPath);
        }

        return response()->json([
            'data' => [
                'key' => $key,
                'url' => $disk->url($key),
            ],
        ], 201);
    }
}
