<?php

namespace Database\Factories;

use App\Models\Property;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class PropertyFactory extends Factory
{
    protected $model = Property::class;

    public function definition(): array
    {
        $type = fake()->randomElement(['apartamento', 'apartamento', 'apartamento', 'casa', 'oficina', 'local']);
        $status = fake()->randomElement([
            'disponible', 'disponible', 'ocupada', 'ocupada', 'ocupada', 'mantenimiento',
        ]);
        $listingType = fake()->randomElement(['alquiler', 'alquiler', 'alquiler', 'venta']);

        $bedrooms = $type === 'oficina' || $type === 'local' ? 0 : fake()->numberBetween(1, 4);
        $bathrooms = $type === 'oficina' || $type === 'local' ? 1 : fake()->numberBetween(1, 3);
        $area = match ($type) {
            'casa' => fake()->numberBetween(120, 320),
            'oficina', 'local' => fake()->numberBetween(60, 200),
            default => fake()->numberBetween(45, 140),
        };

        $rentBase = $area * fake()->randomFloat(2, 12, 22);

        return [
            'code' => 'P-'.strtoupper(Str::random(6)),
            'title' => ucfirst($type).' en '.fake()->randomElement([
                'Russafa', 'Carmen', 'Sorní', 'Cabanyal', 'Patacona', 'Centro',
                'Eixample', 'Mestalla', 'Benimaclet', 'Plaza España',
            ]),
            'type' => $type,
            'status' => $status,
            'listing_type' => $listingType,
            'bedrooms' => $bedrooms,
            'bathrooms' => $bathrooms,
            'area_sqm' => $area,
            'floor' => fake()->randomElement(['Bajo', '1º', '2º', '3º', '4º', '5º', 'Ático']),
            'door' => fake()->randomElement(['A', 'B', 'C', 'D', 'Dcha', 'Izq']),
            'address' => fake()->streetAddress(),
            'postal_code' => '460'.fake()->numerify('##'),
            'city' => 'Valencia',
            'province' => 'Valencia',
            'country' => 'ES',
            'price_rent' => round($rentBase, -1),
            'price_sale' => $listingType === 'venta' ? fake()->numberBetween(120, 650) * 1000 : null,
            'community_fee' => fake()->randomFloat(2, 0, 80),
            'features' => fake()->randomElements([
                'aire_acondicionado', 'calefaccion_central', 'ascensor',
                'amueblado', 'terraza', 'balcon', 'parking', 'trastero',
                'lavadora', 'horno', 'lavavajillas', 'fibra_optica',
            ], fake()->numberBetween(3, 7)),
            'tags' => fake()->randomElements(
                ['exterior', 'reformado', 'luminoso', 'ático', 'orientación sur', 'cerca metro', 'a estrenar'],
                fake()->numberBetween(1, 3),
            ),
        ];
    }

    public function available(): static
    {
        return $this->state(fn () => ['status' => 'disponible']);
    }

    public function occupied(): static
    {
        return $this->state(fn () => ['status' => 'ocupada']);
    }
}
