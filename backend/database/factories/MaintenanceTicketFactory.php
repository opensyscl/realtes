<?php

namespace Database\Factories;

use App\Models\MaintenanceTicket;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

class MaintenanceTicketFactory extends Factory
{
    protected $model = MaintenanceTicket::class;

    public function definition(): array
    {
        $titles = [
            'Fuga en grifo de cocina',
            'Persiana atascada en dormitorio principal',
            'Caldera no enciende',
            'Aire acondicionado pierde agua',
            'Cerradura puerta principal con holgura',
            'Lavavajillas no drena',
            'Bombilla pasillo fundida',
            'Goteras en techo del baño',
            'Microondas no calienta',
            'Ascensor parado',
            'Pintura desconchada en salón',
            'Llave de paso oxidada',
        ];

        $category = fake()->randomElement([
            'fontaneria', 'electricidad', 'calefaccion', 'electrodomesticos',
            'pintura', 'cerrajeria', 'jardineria', 'ascensor', 'otros',
        ]);
        $priority = fake()->randomElement(['baja', 'media', 'media', 'alta', 'urgente']);
        $status = fake()->randomElement([
            'abierto', 'abierto', 'en_progreso', 'en_progreso',
            'esperando_proveedor', 'resuelto', 'cerrado',
        ]);

        $opened = Carbon::now()->subDays(fake()->numberBetween(0, 25));
        $resolved = in_array($status, ['resuelto', 'cerrado'], true)
            ? $opened->copy()->addDays(fake()->numberBetween(1, 7))
            : null;

        return [
            'code' => 'M-'.strtoupper(Str::random(5)),
            'title' => fake()->randomElement($titles),
            'description' => fake()->sentence(12),
            'category' => $category,
            'priority' => $priority,
            'status' => $status,
            'estimated_cost' => fake()->randomFloat(2, 30, 800),
            'actual_cost' => $resolved ? fake()->randomFloat(2, 25, 850) : null,
            'vendor' => fake()->boolean(60) ? fake()->company() : null,
            'opened_at' => $opened,
            'resolved_at' => $resolved,
            'scheduled_for' => $status === 'en_progreso' || $status === 'esperando_proveedor'
                ? Carbon::now()->addDays(fake()->numberBetween(1, 10))
                : null,
        ];
    }
}
