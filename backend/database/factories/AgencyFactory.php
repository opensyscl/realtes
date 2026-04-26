<?php

namespace Database\Factories;

use App\Models\Agency;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class AgencyFactory extends Factory
{
    protected $model = Agency::class;

    public function definition(): array
    {
        $name = fake()->company().' Inmobiliaria';

        return [
            'name' => $name,
            'slug' => Str::slug($name).'-'.Str::random(4),
            'email' => fake()->companyEmail(),
            'phone' => '+34 9'.fake()->numerify('## ### ## ##'),
            'address' => fake()->streetAddress(),
            'city' => 'Valencia',
            'country' => 'ES',
            'plan' => 'starter',
            'active' => true,
        ];
    }
}
