<?php

namespace App\Services\MercadoLibre;

use App\Models\MlPublication;
use App\Models\MlToken;
use App\Models\Property;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use RuntimeException;

class MlPropertyPublisher
{
    public function __construct(
        private readonly MlPropertyMapper $mapper,
        private readonly MlListingTypePicker $picker,
    ) {}

    /**
     * Publica una propiedad. Si $listingTypeOverride se pasa explícito (por ej.
     * del modal de confirmación del frontend), se usa ese tier. Si no, el
     * picker decide en base al setting de la agencia + tiers disponibles.
     */
    public function publish(Property $property, ?string $listingTypeOverride = null): MlPublication
    {
        $token = $this->tokenFor($property->agency_id);
        $client = MlClient::for($token);

        $listingTypeId = $listingTypeOverride
            ?: $this->picker->pickFor($token, $property)['chosen_listing_type_id'];

        $mapped = $this->mapper->map($property, $listingTypeId);

        try {
            $resp = $client->post('/items', $mapped['payload']);
        } catch (\Throwable $e) {
            $this->upsert($property, $mapped, null, error: $e->getMessage());
            throw $e;
        }

        return $this->upsert($property, $mapped, $resp);
    }

    public function update(Property $property): MlPublication
    {
        $publication = MlPublication::where('property_id', $property->id)->firstOrFail();
        $token = $this->tokenFor($property->agency_id);
        $client = MlClient::for($token);
        $mapped = $this->mapper->map($property);

        // ML no permite cambiar category_id en update — solo metadata del item.
        $patch = collect($mapped['payload'])
            ->only(['title', 'price', 'currency_id', 'available_quantity', 'pictures', 'attributes'])
            ->all();

        try {
            $resp = $client->put("/items/{$publication->ml_item_id}", $patch);
            $client->put("/items/{$publication->ml_item_id}/description", [
                'plain_text' => (string) ($property->description ?: $property->title),
            ]);
        } catch (\Throwable $e) {
            $publication->update(['last_error' => $e->getMessage()]);
            throw $e;
        }

        $publication->update([
            'ml_status' => $resp['status'] ?? $publication->ml_status,
            'ml_permalink' => $resp['permalink'] ?? $publication->ml_permalink,
            'payload_snapshot' => $patch,
            'last_synced_at' => now(),
            'last_error' => null,
        ]);

        return $publication->fresh();
    }

    public function setStatus(Property $property, string $status): MlPublication
    {
        if (! in_array($status, ['active', 'paused', 'closed'], true)) {
            throw new RuntimeException("Estado ML inválido: {$status}");
        }
        $publication = MlPublication::where('property_id', $property->id)->firstOrFail();
        $token = $this->tokenFor($property->agency_id);
        $client = MlClient::for($token);

        $resp = $client->put("/items/{$publication->ml_item_id}", ['status' => $status]);

        $publication->update([
            'ml_status' => $resp['status'] ?? $status,
            'last_synced_at' => now(),
            'last_error' => null,
        ]);

        return $publication->fresh();
    }

    public function delete(Property $property): void
    {
        $publication = MlPublication::where('property_id', $property->id)->first();
        if (! $publication) {
            return;
        }

        $token = $this->tokenFor($property->agency_id);
        $client = MlClient::for($token);

        // ML no permite DELETE de items vivos: hay que cerrarlos primero.
        try {
            $client->put("/items/{$publication->ml_item_id}", ['status' => 'closed']);
        } catch (\Throwable $e) {
            Log::warning('ML close before delete failed', ['err' => $e->getMessage()]);
        }

        $publication->update(['ml_status' => 'closed', 'last_synced_at' => now()]);
    }

    private function tokenFor(int $agencyId): MlToken
    {
        $token = MlToken::where('agency_id', $agencyId)->first();
        if (! $token) {
            throw new RuntimeException('Esta agencia no tiene Mercado Libre conectado. Conectá la cuenta primero.');
        }
        return $token;
    }

    private function upsert(Property $property, array $mapped, ?array $response, ?string $error = null): MlPublication
    {
        $existing = MlPublication::where('property_id', $property->id)->first();
        $itemId = $response['id'] ?? $existing?->ml_item_id ?? '';
        $status = $response['status'] ?? ($existing?->ml_status ?? 'active');
        $permalink = $response['permalink'] ?? ($existing?->ml_permalink);

        return DB::transaction(fn () => MlPublication::updateOrCreate(
            ['property_id' => $property->id],
            [
                'agency_id' => $property->agency_id,
                'ml_item_id' => (string) $itemId,
                'ml_permalink' => $permalink,
                'ml_status' => $status,
                'ml_category_id' => $mapped['category_id'],
                'listing_type_id' => $mapped['listing_type_id'],
                'payload_snapshot' => $mapped['payload'],
                'last_synced_at' => now(),
                'published_at' => $itemId && ! $error ? now() : null,
                'last_error' => $error,
            ],
        ));
    }
}
