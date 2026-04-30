<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MlPublication;
use App\Models\Property;
use App\Services\MercadoLibre\MlPropertyPublisher;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MlPropertyController extends Controller
{
    public function __construct(private readonly MlPropertyPublisher $publisher) {}

    /** GET /api/integrations/mercadolibre/properties/{property} — estado de la publicación */
    public function show(Property $property): JsonResponse
    {
        $pub = MlPublication::where('property_id', $property->id)->first();
        return response()->json([
            'data' => $pub ? $this->shape($pub) : null,
        ]);
    }

    /** POST /api/integrations/mercadolibre/properties/{property}/publish */
    public function publish(Property $property): JsonResponse
    {
        try {
            $pub = $this->publisher->publish($property);
        } catch (\Throwable $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
        return response()->json(['data' => $this->shape($pub)]);
    }

    /** PUT /api/integrations/mercadolibre/properties/{property} */
    public function update(Property $property): JsonResponse
    {
        try {
            $pub = $this->publisher->update($property);
        } catch (\Throwable $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
        return response()->json(['data' => $this->shape($pub)]);
    }

    /** PATCH /api/integrations/mercadolibre/properties/{property}/status */
    public function setStatus(Request $request, Property $property): JsonResponse
    {
        $data = $request->validate([
            'status' => ['required', 'in:active,paused,closed'],
        ]);
        try {
            $pub = $this->publisher->setStatus($property, $data['status']);
        } catch (\Throwable $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
        return response()->json(['data' => $this->shape($pub)]);
    }

    /** DELETE /api/integrations/mercadolibre/properties/{property} */
    public function destroy(Property $property): JsonResponse
    {
        $this->publisher->delete($property);
        return response()->json(['ok' => true]);
    }

    private function shape(MlPublication $p): array
    {
        return [
            'id' => $p->id,
            'property_id' => $p->property_id,
            'ml_item_id' => $p->ml_item_id,
            'ml_permalink' => $p->ml_permalink,
            'ml_status' => $p->ml_status,
            'ml_category_id' => $p->ml_category_id,
            'listing_type_id' => $p->listing_type_id,
            'last_synced_at' => $p->last_synced_at,
            'published_at' => $p->published_at,
            'last_error' => $p->last_error,
        ];
    }
}
