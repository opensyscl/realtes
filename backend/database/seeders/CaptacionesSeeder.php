<?php

namespace Database\Seeders;

use App\Models\Agency;
use App\Models\Lead;
use App\Models\LeadActivity;
use App\Models\Pipeline;
use App\Models\Stage;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

class CaptacionesSeeder extends Seeder
{
    public function run(): void
    {
        $agency = Agency::first();
        if (! $agency) {
            return;
        }

        // Pipeline captaciones (idempotente)
        $pipeline = Pipeline::firstOrCreate(
            ['agency_id' => $agency->id, 'slug' => 'captaciones'],
            [
                'name' => 'Captaciones',
                'purpose' => 'captacion',
                'is_default' => false,
                'position' => 2,
            ],
        );

        $stages = [
            ['name' => 'Contacto inicial', 'color' => 'neutral', 'pct' => 10, 'won' => false, 'lost' => false],
            ['name' => 'Visita realizada', 'color' => 'info', 'pct' => 30, 'won' => false, 'lost' => false],
            ['name' => 'Valoración enviada', 'color' => 'info', 'pct' => 50, 'won' => false, 'lost' => false],
            ['name' => 'Negociación', 'color' => 'warning', 'pct' => 75, 'won' => false, 'lost' => false],
            ['name' => 'Exclusiva firmada', 'color' => 'positive', 'pct' => 100, 'won' => true, 'lost' => false],
            ['name' => 'Descartado', 'color' => 'negative', 'pct' => 0, 'won' => false, 'lost' => true],
        ];

        $stageModels = [];
        foreach ($stages as $i => $s) {
            $stageModels[] = Stage::firstOrCreate(
                ['pipeline_id' => $pipeline->id, 'name' => $s['name']],
                [
                    'agency_id' => $agency->id,
                    'color' => $s['color'],
                    'position' => $i,
                    'probability_pct' => $s['pct'],
                    'is_won' => $s['won'],
                    'is_lost' => $s['lost'],
                ],
            );
        }

        // Si ya hay leads de captación, no rehacemos
        if (Lead::where('pipeline_id', $pipeline->id)->count() > 0) {
            $this->command->info('Captaciones ya tienen leads, saltando.');
            return;
        }

        $agents = User::where('agency_id', $agency->id)->get();

        $sources = [
            ['name' => 'Familia Pérez Martín', 'address' => 'Calle Sorní 28, 4ºA', 'rooms' => 3, 'sqm' => 95, 'estimate' => 1850],
            ['name' => 'Carmen López', 'address' => 'Avenida del Puerto 15, 2ºB', 'rooms' => 2, 'sqm' => 75, 'estimate' => 1320],
            ['name' => 'Antonio García', 'address' => 'Calle Russafa 22, 5ºD', 'rooms' => 4, 'sqm' => 130, 'estimate' => 2400],
            ['name' => 'Inmobiliaria competidora', 'address' => 'Calle Cuba 47', 'rooms' => 2, 'sqm' => 68, 'estimate' => 1100],
            ['name' => 'Hermanos Ruiz', 'address' => 'Plaza Ayuntamiento 7', 'rooms' => 5, 'sqm' => 180, 'estimate' => 3200],
            ['name' => 'Doña Rosario', 'address' => 'Calle Cirilo Amorós 12, 3ºA', 'rooms' => 3, 'sqm' => 110, 'estimate' => 1980],
            ['name' => 'Familia Soler', 'address' => 'Calle Colón 35, ático', 'rooms' => 4, 'sqm' => 150, 'estimate' => 2750],
            ['name' => 'Sr. Vicente', 'address' => 'Avenida Blasco Ibáñez 88, 1º', 'rooms' => 2, 'sqm' => 80, 'estimate' => 1450],
        ];

        foreach ($sources as $i => $src) {
            // Distribuir entre los primeros 4 stages
            $stageIdx = $i % 4;
            $stage = $stageModels[$stageIdx];

            $lead = Lead::create([
                'agency_id' => $agency->id,
                'pipeline_id' => $pipeline->id,
                'stage_id' => $stage->id,
                'code' => 'C-'.strtoupper(Str::random(5)),
                'title' => 'Captación: '.$src['address'],
                'contact_name' => $src['name'],
                'contact_email' => Str::slug($src['name']).'@example.com',
                'contact_phone' => '+34 6'.fake()->numerify('## ### ## ##'),
                'source' => fake()->randomElement(['referral', 'walk_in', 'llamada', 'instagram']),
                'value' => $src['estimate'] * 12 * 0.10, // estimación de comisión año 1 al 10%
                'probability_pct' => $stage->probability_pct,
                'requirements' => [
                    'address' => $src['address'],
                    'estimated_rent' => $src['estimate'],
                    'bedrooms' => $src['rooms'],
                    'area_sqm' => $src['sqm'],
                ],
                'expected_close_date' => Carbon::now()->addDays(fake()->numberBetween(7, 45)),
                'last_activity_at' => Carbon::now()->subDays(fake()->numberBetween(0, 5)),
                'assigned_user_id' => $agents->random()->id,
                'status' => 'open',
                'position' => $i,
                'notes' => "Propietario {$src['name']} interesado en cedernos la propiedad.",
            ]);

            LeadActivity::create([
                'agency_id' => $agency->id,
                'lead_id' => $lead->id,
                'user_id' => $agents->random()->id,
                'type' => 'note',
                'title' => 'Captación creada',
                'body' => "Primer contacto con {$src['name']}. Vive en {$src['address']}.",
                'occurred_at' => $lead->created_at,
            ]);
        }

        $this->command->info("✓ Pipeline 'Captaciones' con 6 stages y 8 leads sembrados.");
    }
}
