<?php

namespace Database\Factories;

use App\Models\Building;
use Illuminate\Database\Eloquent\Factories\Factory;

class BuildingFactory extends Factory
{
    protected $model = Building::class;

    public function definition(): array
    {
        $streets = [
            'Calle Sorní', 'Calle Cirilo Amorós', 'Avenida del Puerto',
            'Gran Vía Marqués del Turia', 'Calle Colón', 'Calle Russafa',
            'Avenida del Reino de Valencia', 'Plaza Ayuntamiento',
            'Calle Cuba', 'Calle Doctor Sumsi', 'Avenida Blasco Ibáñez',
            'Calle de la Paz',
        ];

        $name = $streets[array_rand($streets)].' '.fake()->numberBetween(2, 88);

        return [
            'name' => 'Edificio '.$name,
            'address' => $name,
            'city' => 'Valencia',
            'postal_code' => '460'.fake()->numerify('##'),
            'province' => 'Valencia',
            'country' => 'ES',
            'year_built' => fake()->numberBetween(1925, 2024),
            'total_units' => fake()->numberBetween(4, 24),
            'amenities' => fake()->randomElements(
                ['ascensor', 'piscina', 'garaje', 'trastero', 'portero', 'jardín', 'rooftop'],
                fake()->numberBetween(1, 4),
            ),
        ];
    }
}
