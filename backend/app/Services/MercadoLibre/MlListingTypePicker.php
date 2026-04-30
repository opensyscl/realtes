<?php

namespace App\Services\MercadoLibre;

use App\Models\MlCategoryMap;
use App\Models\MlToken;
use App\Models\Property;

/**
 * Decide qué listing_type_id usar al publicar una propiedad en ML.
 *
 * Reglas:
 *  - Si la agencia tiene `default_listing_type` distinto de 'auto', usamos ese (siempre que el seller lo tenga disponible).
 *  - Si es 'auto', elegimos el mejor tier con fee=0 que el seller tenga disponible:
 *      gold_premium (suscripción cubre) > gold > silver > free remaining
 *  - Si todos los gratis están agotados, devolvemos el más barato pago (silver) y dejamos
 *    que el caller decida si confirmar.
 */
class MlListingTypePicker
{
    /** @var list<string> orden de preferencia: mejor exposición primero */
    private const TIER_ORDER = ['gold_premium', 'gold', 'silver', 'free'];

    /**
     * @return array{
     *   chosen_listing_type_id: string,
     *   chosen_fee: int,
     *   chosen_remaining: int|null,
     *   options: list<array{id:string, name:string, fee:int, remaining:int|null, exposure:string|null}>
     * }
     */
    public function pickFor(MlToken $token, Property $property): array
    {
        $client = MlClient::for($token);
        $cat = MlCategoryMap::resolve(
            $property->agency_id,
            (string) $property->type,
            (string) $property->listing_type,
        );
        if (! $cat) {
            // Fallback razonable; el publish va a fallar con error claro de mapper.
            return [
                'chosen_listing_type_id' => 'free',
                'chosen_fee' => 0,
                'chosen_remaining' => null,
                'options' => [],
            ];
        }

        $price = (int) ($property->listing_type === 'venta' ? $property->price_sale : $property->price_rent);
        $available = $this->fetchAvailable($client, (int) $token->ml_user_id, $cat->category_id);
        $prices = $this->fetchPrices($client, $cat->category_id, $price);

        // Combinamos: solo nos interesan los tiers que el seller TIENE disponibles.
        $options = [];
        foreach ($available as $a) {
            $id = (string) $a['id'];
            $remaining = $a['remaining_listings'] ?? null;
            $price_row = $prices[$id] ?? null;
            $options[] = [
                'id' => $id,
                'name' => (string) ($a['name'] ?? $id),
                'fee' => $remaining !== null && $remaining > 0
                    ? 0  // ML tiene listings restantes incluidos en plan/free → fee efectivo 0
                    : (int) ($price_row['listing_fee_amount'] ?? 0),
                'remaining' => $remaining,
                'exposure' => $price_row['listing_exposure'] ?? null,
            ];
        }

        $preference = (string) ($token->default_listing_type ?: 'auto');
        $chosen = $this->resolveChoice($preference, $options);

        return [
            'chosen_listing_type_id' => $chosen['id'],
            'chosen_fee' => $chosen['fee'],
            'chosen_remaining' => $chosen['remaining'],
            'options' => $options,
        ];
    }

    /**
     * @param list<array{id:string, name:string, fee:int, remaining:int|null, exposure:string|null}> $options
     * @return array{id:string, fee:int, remaining:int|null}
     */
    private function resolveChoice(string $preference, array $options): array
    {
        // 1. Preferencia explícita: usar ese tier si está disponible
        if ($preference !== 'auto') {
            $match = collect($options)->firstWhere('id', $preference);
            if ($match) {
                return ['id' => $match['id'], 'fee' => $match['fee'], 'remaining' => $match['remaining']];
            }
        }

        // 2. Auto: el mejor tier gratis (fee=0) en orden de preferencia
        foreach (self::TIER_ORDER as $tier) {
            $match = collect($options)->firstWhere('id', $tier);
            if ($match && $match['fee'] === 0) {
                return ['id' => $match['id'], 'fee' => 0, 'remaining' => $match['remaining']];
            }
        }

        // 3. Sin gratis: el más barato disponible
        $sortable = collect($options)->sortBy('fee')->values();
        if ($sortable->isNotEmpty()) {
            $first = $sortable->first();
            return ['id' => $first['id'], 'fee' => $first['fee'], 'remaining' => $first['remaining']];
        }

        return ['id' => 'free', 'fee' => 0, 'remaining' => null];
    }

    /** @return list<array<string,mixed>> */
    private function fetchAvailable(MlClient $client, int $userId, string $categoryId): array
    {
        try {
            $resp = $client->get("/users/{$userId}/available_listing_types", [
                'category_id' => $categoryId,
            ]);
            return (array) ($resp['available'] ?? []);
        } catch (\Throwable) {
            return [];
        }
    }

    /** @return array<string,array<string,mixed>> indexed by listing_type_id */
    private function fetchPrices(MlClient $client, string $categoryId, int $price): array
    {
        if ($price <= 0) {
            return [];
        }
        try {
            $resp = $client->get('/sites/MLC/listing_prices', [
                'category_id' => $categoryId,
                'price' => $price,
            ]);
            $rows = is_array($resp) && isset($resp[0]) ? $resp : [];
            $indexed = [];
            foreach ($rows as $r) {
                if (isset($r['listing_type_id'])) {
                    $indexed[$r['listing_type_id']] = $r;
                }
            }
            return $indexed;
        } catch (\Throwable) {
            return [];
        }
    }
}
