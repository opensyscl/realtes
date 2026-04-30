<?php

namespace App\Services\MercadoLibre;

use App\Models\MlCategoryMap;
use App\Models\Property;
use RuntimeException;

class MlPropertyMapper
{
    /**
     * Construye el payload para POST /items.
     *
     * @return array{payload: array, category_id: string, listing_type_id: string}
     */
    public function map(Property $property): array
    {
        $cat = MlCategoryMap::resolve(
            $property->agency_id,
            (string) $property->type,
            (string) $property->listing_type,
        );

        if (! $cat) {
            throw new RuntimeException(
                "Sin categoría ML mapeada para tipo='{$property->type}' / listing='{$property->listing_type}'. ".
                'Configurá ml_category_map antes de publicar.'
            );
        }

        $price = $property->listing_type === 'venta' ? $property->price_sale : $property->price_rent;
        if (! $price || $price <= 0) {
            throw new RuntimeException('La propiedad no tiene precio definido para publicar en ML.');
        }

        $title = $this->buildTitle($property);

        $payload = [
            'title' => $title,
            'category_id' => $cat->category_id,
            'price' => (int) $price,
            'currency_id' => strtoupper((string) ($property->currency ?: 'CLP')),
            'available_quantity' => 1,
            'buying_mode' => 'classified',
            'listing_type_id' => $cat->listing_type_id ?: 'gold_special',
            'condition' => 'not_specified',
            'site_id' => (string) config('services.mercadolibre.site_id', 'MLC'),
            'pictures' => $this->buildPictures($property),
            'description' => [
                'plain_text' => (string) ($property->description ?: $title),
            ],
            'attributes' => $this->buildAttributes($property),
        ];

        $location = $this->buildLocation($property);
        if ($location) {
            $payload['location'] = $location;
        }

        return [
            'payload' => $payload,
            'category_id' => $cat->category_id,
            'listing_type_id' => $cat->listing_type_id ?: 'gold_special',
        ];
    }

    private function buildTitle(Property $p): string
    {
        // ML limita títulos a 60 caracteres.
        $base = trim((string) $p->title);
        if ($base !== '') {
            return mb_substr($base, 0, 60);
        }
        $type = ucfirst((string) $p->type);
        $beds = $p->bedrooms ? "{$p->bedrooms}D" : '';
        $area = $p->area_sqm ? "{$p->area_sqm}m²" : '';
        $where = $p->city ?: '';
        return mb_substr(trim("{$type} {$beds} {$area} en {$where}"), 0, 60);
    }

    /**
     * @return list<array{source:string}>
     */
    private function buildPictures(Property $p): array
    {
        $urls = [];
        if ($p->cover_image_url) {
            $urls[] = $p->cover_image_url;
        }
        try {
            foreach ($p->getMedia('photos') as $m) {
                $urls[] = $m->getFullUrl();
            }
        } catch (\Throwable $e) {
            // Si Spatie media no está disponible en este request, ignoramos.
        }
        $urls = array_values(array_unique(array_filter($urls)));
        $urls = array_slice($urls, 0, 12);
        return array_map(fn (string $u) => ['source' => $u], $urls);
    }

    /**
     * Atributos requeridos por ML inmobiliario.
     *
     * @return list<array{id:string, value_name:string}>
     */
    private function buildAttributes(Property $p): array
    {
        $attrs = [];

        $address = trim(implode(', ', array_filter([
            $p->address, $p->city, $p->province, $p->postal_code,
        ])));
        if ($address !== '') {
            $attrs[] = ['id' => 'FULL_ADDRESS', 'value_name' => $address];
        }
        if ($p->area_sqm) {
            $attrs[] = ['id' => 'TOTAL_AREA', 'value_name' => "{$p->area_sqm} m²"];
        }
        if ($p->built_sqm) {
            $attrs[] = ['id' => 'COVERED_AREA', 'value_name' => "{$p->built_sqm} m²"];
        }
        if (! is_null($p->bedrooms)) {
            $attrs[] = ['id' => 'BEDROOMS', 'value_name' => (string) $p->bedrooms];
        }
        if (! is_null($p->bathrooms)) {
            $attrs[] = ['id' => 'FULL_BATHROOMS', 'value_name' => (string) (int) $p->bathrooms];
        }
        if ($p->parking_spaces) {
            $attrs[] = ['id' => 'PARKING_LOTS', 'value_name' => (string) $p->parking_spaces];
        }
        if ($p->year_built) {
            $attrs[] = ['id' => 'PROPERTY_AGE', 'value_name' => (string) max(0, now()->year - (int) $p->year_built)];
        }
        if ($p->orientation) {
            $attrs[] = ['id' => 'ORIENTATION', 'value_name' => (string) $p->orientation];
        }
        if ($p->floor) {
            $attrs[] = ['id' => 'FLOORS', 'value_name' => (string) $p->floor];
        }
        if ($p->community_fee) {
            $attrs[] = [
                'id' => 'MAINTENANCE_FEE',
                'value_name' => number_format((float) $p->community_fee, 0, ',', '.').' '.strtoupper((string) ($p->currency ?: 'CLP')),
            ];
        }
        $attrs[] = [
            'id' => 'OPERATION',
            'value_name' => $p->listing_type === 'venta' ? 'Venta' : 'Arriendo',
        ];
        $attrs[] = [
            'id' => 'PROPERTY_TYPE',
            'value_name' => $this->mapPropertyTypeLabel((string) $p->type),
        ];

        return $attrs;
    }

    private function buildLocation(Property $p): ?array
    {
        // $p->lat / $p->lng aparecen sólo cuando la query usa ST_Y/ST_X (ver
        // PublicController). Si no están seteados, dejamos location sin coords —
        // ML acepta address_line + city + state.
        $lat = $p->lat ?? null;
        $lng = $p->lng ?? null;

        if (! $p->address && ! $p->city) {
            return null;
        }

        $loc = [
            'address_line' => $p->address ?: null,
            'city' => ['name' => $p->city ?: null],
            'state' => ['name' => $p->province ?: null],
            'country' => ['id' => 'CL', 'name' => 'Chile'],
            'zip_code' => $p->postal_code ?: null,
        ];

        if ($lat && $lng) {
            $loc['latitude'] = (float) $lat;
            $loc['longitude'] = (float) $lng;
        }

        return $loc;
    }

    private function mapPropertyTypeLabel(string $type): string
    {
        return match (strtolower($type)) {
            'apartamento', 'departamento' => 'Departamento',
            'casa' => 'Casa',
            'oficina' => 'Oficina',
            'local' => 'Local',
            'terreno', 'sitio' => 'Terreno',
            default => 'Departamento',
        };
    }
}
