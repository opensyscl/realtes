<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\DocumentResource;
use App\Models\Contract;
use App\Models\Property;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\Rule;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class DocumentController extends Controller
{
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

        $media = $property->addMedia($request->file('file'))
            ->withCustomProperties([
                'category' => 'foto',
                'uploaded_by' => $request->user()->name,
            ])
            ->toMediaCollection('photos');

        // Si no hay portada todavía, esta foto se vuelve portada.
        if (! $property->cover_image_url) {
            $property->update(['cover_image_url' => $media->getFullUrl()]);
        }

        return (new DocumentResource($media))->response()->setStatusCode(201);
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

        $new = $owner->addMedia($request->file('file'))
            ->withCustomProperties(array_merge($customProps, [
                'replaced_at' => now()->toIso8601String(),
                'replaced_by' => $request->user()->name,
            ]))
            ->toMediaCollection('photos');

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
