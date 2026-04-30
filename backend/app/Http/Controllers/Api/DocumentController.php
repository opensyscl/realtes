<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\DocumentResource;
use App\Models\Contract;
use App\Models\Property;
use App\Services\WatermarkService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class DocumentController extends Controller
{
    public function __construct(private WatermarkService $watermark)
    {
    }

    /** GET /api/properties/{property}/documents */
    public function indexProperty(Property $property): AnonymousResourceCollection
    {
        return DocumentResource::collection(
            $property->getMedia('documents')->sortByDesc('created_at')->values(),
        );
    }

    /** POST /api/properties/{property}/documents */
    public function storeProperty(Request $request, Property $property): JsonResponse
    {
        return $this->upload($request, $property, 'documents');
    }

    /** GET /api/contracts/{contract}/documents */
    public function indexContract(Contract $contract): AnonymousResourceCollection
    {
        return DocumentResource::collection(
            $contract->getMedia('documents')->sortByDesc('created_at')->values(),
        );
    }

    /** POST /api/contracts/{contract}/documents */
    public function storeContract(Request $request, Contract $contract): JsonResponse
    {
        return $this->upload($request, $contract, 'documents');
    }

    /** GET /api/properties/{property}/photos */
    public function indexPhotos(Property $property): AnonymousResourceCollection
    {
        return DocumentResource::collection(
            $property->getMedia('photos')->sortBy('order_column')->values(),
        );
    }

    /** POST /api/properties/{property}/photos */
    public function storePhoto(Request $request, Property $property): JsonResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'image', 'max:10240'],
        ]);

        $file = $request->file('file');
        // Si no hay portada → esta foto se va a volver portada → contexto cover.
        // Sinó es una foto más de la galería.
        $context = $property->cover_image_url ? 'gallery' : 'cover';
        $isWatermarked = false;

        $processedPath = $this->watermark->apply($file, $property->agency, $context);
        $sourceForMedia = $processedPath !== $file->getRealPath()
            ? $this->mediaSourceFromTmp($processedPath, $file->getClientOriginalName(), $file->getMimeType())
            : $file;
        $isWatermarked = $processedPath !== $file->getRealPath();

        $media = $property->addMedia($sourceForMedia)
            ->withCustomProperties([
                'category' => 'foto',
                'uploaded_by' => $request->user()->name,
                'watermarked' => $isWatermarked,
                'watermark_context' => $isWatermarked ? $context : null,
            ])
            ->toMediaCollection('photos');

        // Si no hay portada todavía, esta foto se vuelve portada.
        if (! $property->cover_image_url) {
            $property->update(['cover_image_url' => $media->getFullUrl()]);
        }

        // Limpiar tmp procesado si lo hubo (Spatie ya copió el contenido)
        if ($isWatermarked && file_exists($processedPath)) {
            @unlink($processedPath);
        }

        return (new DocumentResource($media))->response()->setStatusCode(201);
    }

    /**
     * Convierte un path tmp en algo que Spatie Media puede consumir
     * preservando el nombre original del archivo subido.
     */
    private function mediaSourceFromTmp(string $tmpPath, string $originalName, ?string $mime): \Illuminate\Http\UploadedFile
    {
        return new \Illuminate\Http\UploadedFile(
            path: $tmpPath,
            originalName: $originalName,
            mimeType: $mime,
            test: true, // bypass validación de move_uploaded_file (no es upload real)
        );
    }

    /** POST /api/photos/{media}/set-cover */
    public function setCover(Media $media, Request $request): JsonResponse
    {
        if (! ($media->model instanceof Property)) {
            return response()->json(['message' => 'Solo se aplica a propiedades'], 422);
        }
        if ($media->model->agency_id !== $request->user()->agency_id) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $media->model->update(['cover_image_url' => $media->getFullUrl()]);

        return response()->json(['ok' => true, 'cover_image_url' => $media->getFullUrl()]);
    }

    /**
     * POST /api/properties/{property}/photos/reorder
     * Body: { order: [mediaId1, mediaId2, ...] }
     * Reordena las fotos según el array. Usa el helper de Spatie.
     */
    public function reorderPhotos(Request $request, Property $property): JsonResponse
    {
        $data = $request->validate([
            'order' => ['required', 'array'],
            'order.*' => ['integer'],
        ]);

        // Validamos que todos los IDs pertenecen al `photos` collection del property
        $validIds = $property->getMedia('photos')->pluck('id')->all();
        $cleanOrder = array_values(array_filter(
            $data['order'],
            fn ($id) => in_array($id, $validIds, true),
        ));

        Media::setNewOrder($cleanOrder);

        return response()->json(['ok' => true]);
    }

    /**
     * POST /api/photos/{media}/apply-watermark
     * Re-aplica el watermark configurado en la agency a una foto existente.
     * Útil para fotos subidas antes de habilitar el watermark, o cuando se
     * cambian los settings y se quiere forzar el reproceso.
     */
    public function applyWatermark(Media $media, Request $request): JsonResponse
    {
        $owner = $media->model;
        if (! ($owner instanceof Property)) {
            return response()->json(['message' => 'Solo se aplica a fotos de propiedad'], 422);
        }
        if ($owner->agency_id !== $request->user()->agency_id) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        // Si el watermark no está habilitado, no hay nada que hacer
        $settings = $owner->agency->watermarkSettings();
        if (! ($settings['enabled'] ?? false)) {
            return response()->json([
                'message' => 'La marca de agua está deshabilitada para esta agency',
            ], 422);
        }

        $isCover = $owner->cover_image_url === $media->getFullUrl();
        $context = $isCover ? 'cover' : 'gallery';

        // 1. Descargar el original a tmp
        $ext = pathinfo($media->file_name, PATHINFO_EXTENSION) ?: 'jpg';
        $tmpOriginal = sys_get_temp_dir() . '/' . 'wm_orig_' . \Illuminate\Support\Str::random(12) . '.' . $ext;
        $bytes = @file_get_contents($media->getFullUrl());
        if ($bytes === false) {
            return response()->json(['message' => 'No se pudo descargar la foto original desde R2'], 500);
        }
        file_put_contents($tmpOriginal, $bytes);

        // 2. Aplicar watermark
        $processed = $this->watermark->applyToPath(
            sourcePath: $tmpOriginal,
            extension: $ext,
            mimeType: $media->mime_type ?: 'image/jpeg',
            agency: $owner->agency,
            context: $context,
        );

        if ($processed === $tmpOriginal) {
            // Watermark no aplicó (deshabilitado para este contexto)
            @unlink($tmpOriginal);
            return response()->json([
                'message' => "El watermark no aplica para fotos de {$context} según los settings de la agency",
            ], 422);
        }

        // 3. Subir como nuevo media preservando metadata + posición
        $position = $media->order_column;
        $customProps = $media->custom_properties ?? [];

        $new = $owner->addMedia(new \Illuminate\Http\UploadedFile(
            $processed,
            $media->file_name,
            $media->mime_type,
            test: true,
        ))
            ->withCustomProperties(array_merge($customProps, [
                'watermarked' => true,
                'watermark_context' => $context,
                'rewatermarked_at' => now()->toIso8601String(),
                'rewatermarked_by' => $request->user()->name,
            ]))
            ->toMediaCollection('photos');

        if ($position !== null) {
            $new->order_column = $position;
            $new->save();
        }

        // 4. Si era portada, actualizar el URL en el property
        if ($isCover) {
            $owner->update(['cover_image_url' => $new->getFullUrl()]);
        }

        // 5. Borrar el media viejo (también borra el archivo en R2)
        $media->delete();

        // Cleanup tmp
        @unlink($tmpOriginal);
        if (file_exists($processed)) {
            @unlink($processed);
        }

        return (new DocumentResource($new->fresh()))->response();
    }

    /**
     * POST /api/properties/{property}/photos/apply-watermark
     * Aplica watermark a TODAS las fotos de una propiedad (incluida la cover).
     * Útil para limpiar fotos viejas de un saque.
     */
    public function applyWatermarkBulk(Property $property, Request $request): JsonResponse
    {
        if ($property->agency_id !== $request->user()->agency_id) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $settings = $property->agency->watermarkSettings();
        if (! ($settings['enabled'] ?? false)) {
            return response()->json([
                'message' => 'La marca de agua está deshabilitada para esta agency',
            ], 422);
        }

        $applied = 0;
        $skipped = 0;

        foreach ($property->getMedia('photos') as $m) {
            // Skip si ya está watermarked y los settings no cambiaron
            if (($m->custom_properties['watermarked'] ?? false) === true && ! $request->boolean('force')) {
                $skipped++;
                continue;
            }

            try {
                // Reusar la lógica del endpoint singular vía un sub-request interno
                $this->applyWatermark($m, $request);
                $applied++;
            } catch (\Throwable $e) {
                Log::warning('Watermark bulk falló para una foto', [
                    'media_id' => $m->id,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        return response()->json([
            'ok' => true,
            'applied' => $applied,
            'skipped' => $skipped,
        ]);
    }

    /**
     * POST /api/photos/{media}/replace
     * Body: file (multipart)
     * Reemplaza el archivo manteniendo posición, custom_properties y si era portada.
     */
    public function replacePhoto(Request $request, Media $media): JsonResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'image', 'max:10240'],
        ]);

        $owner = $media->model;
        if (! ($owner instanceof Property)) {
            return response()->json(['message' => 'Solo se aplica a fotos de propiedad'], 422);
        }
        if ($owner->agency_id !== $request->user()->agency_id) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $position = $media->order_column;
        $customProps = $media->custom_properties ?? [];
        $wasCover = $owner->cover_image_url === $media->getFullUrl();

        $file = $request->file('file');
        $context = $wasCover ? 'cover' : 'gallery';
        $processedPath = $this->watermark->apply($file, $owner->agency, $context);
        $isWatermarked = $processedPath !== $file->getRealPath();
        $sourceForMedia = $isWatermarked
            ? $this->mediaSourceFromTmp($processedPath, $file->getClientOriginalName(), $file->getMimeType())
            : $file;

        $new = $owner->addMedia($sourceForMedia)
            ->withCustomProperties(array_merge($customProps, [
                'replaced_at' => now()->toIso8601String(),
                'replaced_by' => $request->user()->name,
                'watermarked' => $isWatermarked,
                'watermark_context' => $isWatermarked ? $context : null,
            ]))
            ->toMediaCollection('photos');

        if ($isWatermarked && file_exists($processedPath)) {
            @unlink($processedPath);
        }

        // Mantener la posición original
        if ($position !== null) {
            $new->order_column = $position;
            $new->save();
        }

        // Si era portada, actualizar la URL en el property
        if ($wasCover) {
            $owner->update(['cover_image_url' => $new->getFullUrl()]);
        }

        $media->delete();

        return (new DocumentResource($new->fresh()))->response();
    }

    /** DELETE /api/documents/{media} */
    public function destroy(Media $media, Request $request): JsonResponse
    {
        // Authorization: el media debe pertenecer a un modelo de la agency del user
        $agencyId = $request->user()->agency_id;
        $owner = $media->model;

        if (! $owner || ! property_exists($owner, 'agency_id') && ! method_exists($owner, 'getAttribute')) {
            return response()->json(['message' => 'No autorizado'], 403);
        }
        if ($owner->agency_id !== $agencyId) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $media->delete();

        return response()->json(['ok' => true]);
    }

    /** Helper compartido */
    protected function upload(Request $request, $model, string $collection): JsonResponse
    {
        $data = $request->validate([
            'file' => ['required', 'file', 'max:10240'], // 10MB
            'category' => ['nullable', Rule::in([
                'contrato', 'identidad', 'nomina', 'aval', 'inventario',
                'reglamento', 'cedula_habitabilidad', 'certificado_energetico',
                'planos', 'foto', 'factura', 'otros',
            ])],
            'description' => ['nullable', 'string', 'max:255'],
            'name' => ['nullable', 'string', 'max:160'],
        ]);

        $file = $request->file('file');

        $media = $model->addMedia($file)
            ->usingName($data['name'] ?? pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME))
            ->withCustomProperties([
                'category' => $data['category'] ?? 'otros',
                'description' => $data['description'] ?? null,
                'uploaded_by' => $request->user()->name,
            ])
            ->toMediaCollection($collection);

        return (new DocumentResource($media))->response()->setStatusCode(201);
    }
}
