<?php

namespace Database\Factories;

use App\Models\Person;
use Illuminate\Database\Eloquent\Factories\Factory;

class PersonFactory extends Factory
{
    protected $model = Person::class;

    public function definition(): array
    {
        return [
            'type' => fake()->randomElement(['owner', 'tenant']),
            'first_name' => fake()->firstName(),
            'last_name' => fake()->lastName().' '.fake()->lastName(),
            'nif' => fake()->numerify('########').strtoupper(fake()->randomLetter()),
            'email' => fake()->unique()->safeEmail(),
            'phone' => '+34 6'.fake()->numerify('## ### ## ##'),
            'address' => fake()->streetAddress(),
            'city' => 'Valencia',
            'postal_code' => '460'.fake()->numerify('##'),
            'country' => 'ES',
            'iban_last4' => fake()->numerify('####'),
        ];
    }

    public function owner(): static
    {
        return $this->state(fn () => ['type' => 'owner']);
    }

    public function tenant(): static
    {
        return $this->state(fn () => ['type' => 'tenant']);
    }
}
