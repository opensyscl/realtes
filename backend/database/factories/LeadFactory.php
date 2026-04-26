<?php

namespace Database\Factories;

use App\Models\Lead;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class LeadFactory extends Factory
{
    protected $model = Lead::class;

    public function definition(): array
    {
        $sources = ['web', 'idealista', 'referral', 'instagram', 'llamada', 'walk_in'];
        $title = sprintf(
            '%s busca %s',
            fake()->name(),
            fake()->randomElement([
                'apartamento 2 hab Russafa',
                'piso 3 hab cerca metro',
                'oficina centro',
                'ático con terraza',
                'casa con jardín en Cabanyal',
                'piso reformado Eixample',
                'estudio para 1 persona',
                'piso amueblado Mestalla',
            ]),
        );

        return [
            'code' => 'L-'.strtoupper(Str::random(5)),
            'title' => $title,
            'contact_name' => fake()->name(),
            'contact_email' => fake()->unique()->safeEmail(),
            'contact_phone' => '+34 6'.fake()->numerify('## ### ## ##'),
            'source' => fake()->randomElement($sources),
            'value' => fake()->numberBetween(700, 2400),
            'probability_pct' => fake()->randomElement([20, 30, 50, 70, 80]),
            'requirements' => [
                'bedrooms_min' => fake()->numberBetween(1, 4),
                'max_price' => fake()->numberBetween(900, 2200),
                'zones' => fake()->randomElements(
                    ['Russafa', 'Eixample', 'Cabanyal', 'Centro', 'Mestalla', 'Benimaclet'],
                    fake()->numberBetween(1, 3),
                ),
            ],
            'expected_close_date' => fake()->dateTimeBetween('+1 week', '+8 weeks'),
            'last_activity_at' => fake()->dateTimeBetween('-7 days', 'now'),
            'status' => 'open',
            'notes' => fake()->boolean(30) ? fake()->sentence() : null,
        ];
    }
}
