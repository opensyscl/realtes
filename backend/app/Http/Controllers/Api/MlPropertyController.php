<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MlPublication;
use App\Models\MlToken;
use App\Models\Property;
use App\Services\MercadoLibre\MlListingTypePicker;
use App\Services\MercadoLibre\MlPropertyPublisher;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MlPropertyController extends Controller
{
    public function __construct(
        private readonly MlPropertyPublisher $publisher,
        private readonly MlListingTypePicker $picker,
    ) {}

    /**
     * GET /api/integrations/mercadolibre/properties/{property}/listing-types
     * Devuelve los tiers disponibles + sus fees + el que el sistema usaría por default.
     * Sirve para que el frontend muestre el modal de confirmación antes de publicar.
     */
    public function listingTypes(Property $property): JsonResponse
    {
        $token = MlToken::where('agency_id', $property->agency_id)->first();
        if (! $token) {
            return response()->json(['message' => 'Mercado Libre no está conectado.'], 422);
        }
        try {
            $data = $this->picker->pickFor($token, $property);
        } catch (\Throwable $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
        return response()->json([
            'data' => array_merge($data, [
                'agency_default' => $token->default_listing_type ?: 'auto',
                'confirm_before_charge' => (bool) $token->confirm_before_charge,
            ]),
        ]);
    }

    /** GET /api/integrations/mercadolibre/properties/{property} — estado de la publicación */
    public function show(Property $property): JsonResponse
    {
        $pub = MlPublication::where('property_id', $property->id)->first();
        return response()->json([
            'data' => $pub ? $this->shape($pub) : null,
        ]);
    }

    /**
     * POST /api/integrations/mercadolibre/properties/{property}/publish
     *
     * Body opcional: { "listing_type_id": "silver" } para forzar el tier.
     * Si no se pasa, el picker decide en base al setting de la agencia.
     */
    public function publish(Request $request, Property $property): JsonResponse
    {
        $data = $request->validate([
            'listing_type_id' => ['nullable', 'string', 'in:free,silver,gold,gold_special,gold_premium'],
        ]);
        try {
            $pub = $this->publisher->publish($property, $data['listing_type_id'] ?? null);
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
