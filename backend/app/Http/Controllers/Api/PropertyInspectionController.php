<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\PropertyInspectionResource;
use App\Models\Property;
use App\Models\PropertyInspection;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\Rule;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class PropertyInspectionController extends Controller
{
    private const TYPES = ['entrega', 'recepcion', 'inspeccion', 'devolucion', 'reparacion', 'otro'];
    private const CONDITIONS = ['excelente', 'bueno', 'regular', 'malo'];

    /** GET /api/properties/{property}/inspections */
    public function index(Property $property): AnonymousResourceCollection
    {
        $items = $property->load('agency')->relationLoaded('inspections')
            ? $property->inspections
            : PropertyInspection::with('createdBy')
                ->where('property_id', $property->id)
                ->orderByDesc('inspection_date')
                ->orderByDesc('id')
                ->get();

        return PropertyInspectionResource::collection($items);
    }

    /** POST /api/properties/{property}/inspections */
    public function store(Request $request, Property $property): JsonResponse
    {
        $data = $request->validate([
            'type' => ['required', Rule::in(self::TYPES)],
            'title' => ['required', 'string', 'max:200'],
            'description' => ['nullable', 'string', 'max:5000'],
            'inspection_date' => ['required', 'date'],
            'inspector_name' => ['nullable', 'string', 'max:160'],
            'condition' => ['nullable', Rule::in(self::CONDITIONS)],
            'contract_id' => ['nullable', 'integer', 'exists:contracts,id'],
        ]);

        $inspection = PropertyInspection::create([
            ...$data,
            'agency_id' => $property->agency_id,
            'property_id' => $property->id,
            'contract_id' => $data['contract_id'] ?? $property->active_contract_id ?? null,
            'created_by_user_id' => $request->user()->id,
        ]);

        return (new PropertyInspectionResource($inspection->load('createdBy')))
            ->response()
            ->setStatusCode(201);
    }

    /** PATCH /api/inspections/{inspection} */
    public function update(Request $request, PropertyInspection $inspection): JsonResponse
    {
        $this->authorizeAgency($inspection, $request);

        $data = $request->validate([
            'type' => ['sometimes', Rule::in(self::TYPES)],
            'title' => ['sometimes', 'string', 'max:200'],
            'description' => ['sometimes', 'nullable', 'string', 'max:5000'],
            'inspection_date' => ['sometimes', 'date'],
            'inspector_name' => ['sometimes', 'nullable', 'string', 'max:160'],
            'condition' => ['sometimes', 'nullable', Rule::in(self::CONDITIONS)],
            'signed_by_tenant' => ['sometimes', 'boolean'],
            'signed_by_landlord' => ['sometimes', 'boolean'],
        ]);

        // Auto-stamp signing timestamps cuando cambia el flag
        if (array_key_exists('signed_by_tenant', $data)) {
            $data['tenant_signed_at'] = $data['signed_by_tenant'] ? now() : null;
        }
        if (array_key_exists('signed_by_landlord', $data)) {
            $data['landlord_signed_at'] = $data['signed_by_landlord'] ? now() : null;
        }

        $inspection->update($data);

        return (new PropertyInspectionResource($inspection->fresh()->load('createdBy')))
            ->response();
    }

    /** DELETE /api/inspections/{inspection} */
    public function destroy(PropertyInspection $inspection, Request $request): JsonResponse
    {
        $this->authorizeAgency($inspection, $request);
        $inspection->delete();
        return response()->json(['ok' => true]);
    }

    /** POST /api/inspections/{inspection}/photos */
    public function uploadPhoto(Request $request, PropertyInspection $inspection): JsonResponse
    {
        $this->authorizeAgency($inspection, $request);

        $data = $request->validate([
            'file' => ['required', 'file', 'image', 'max:10240'],
            'description' => ['nullable', 'string', 'max:500'],
            'note' => ['nullable', 'string', 'max:500'],
            'tag' => ['nullable', 'string', 'max:40'],
        ]);

        $media = $inspection->addMedia($request->file('file'))
            ->withCustomProperties([
                'uploaded_by' => $request->user()->name,
                'description' => $data['description'] ?? null,
                'note' => $data['note'] ?? null,
                'tag' => $data['tag'] ?? null,
            ])
            ->toMediaCollection('photos');

        return response()->json(['data' => $this->photoPayload($media)], 201);
    }

    /** PATCH /api/inspections/photos/{media} — actualizar descripción/nota por foto */
    public function updatePhoto(Media $media, Request $request): JsonResponse
    {
        $this->authorizePhoto($media, $request);

        $data = $request->validate([
            'description' => ['sometimes', 'nullable', 'string', 'max:500'],
            'note' => ['sometimes', 'nullable', 'string', 'max:500'],
            'tag' => ['sometimes', 'nullable', 'string', 'max:40'],
        ]);

        $custom = $media->custom_properties ?? [];
        foreach ($data as $k => $v) {
            $custom[$k] = $v;
        }
        $media->custom_properties = $custom;
        $media->save();

        return response()->json(['data' => $this->photoPayload($media->fresh())]);
    }

    /** DELETE /api/inspections/photos/{media} */
    public function destroyPhoto(Media $media, Request $request): JsonResponse
    {
        $this->authorizePhoto($media, $request);
        $media->delete();
        return response()->json(['ok' => true]);
    }

    private function authorizePhoto(Media $media, Request $request): void
    {
        $owner = $media->model;
        if (! ($owner instanceof PropertyInspection)) {
            abort(422, 'No es una foto de inspección');
        }
        if ($owner->agency_id !== $request->user()->agency_id) {
            abort(403, 'No autorizado');
        }
    }

    private function photoPayload(Media $media): array
    {
        $cp = $media->custom_properties ?? [];
        return [
            'id' => $media->id,
            'url' => $media->getFullUrl(),
            'name' => $media->name,
            'mime_type' => $media->mime_type,
            'size' => $media->size,
            'description' => $cp['description'] ?? null,
            'note' => $cp['note'] ?? null,
            'tag' => $cp['tag'] ?? null,
        ];
    }

    private function authorizeAgency(PropertyInspection $inspection, Request $request): void
    {
        if ($inspection->agency_id !== $request->user()->agency_id) {
            abort(403, 'No autorizado');
        }
    }
}
