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

class CrmSeeder extends Seeder
{
    public function run(): void
    {
        $agency = Agency::first();
        if (! $agency) {
            $this->command->warn('No hay agency. Corre DatabaseSeeder antes.');

            return;
        }

        $admin = User::where('email', 'hola@bookforce.io')->first();
        $agents = User::where('agency_id', $agency->id)->get();

        // Pipeline default: alquiler residencial
        $pipeline = Pipeline::firstOrCreate(
            ['agency_id' => $agency->id, 'slug' => 'alquiler-residencial'],
            [
                'name' => 'Alquiler residencial',
                'purpose' => 'alquiler',
                'is_default' => true,
                'position' => 0,
            ],
        );

        $stagesConfig = [
            ['name' => 'Nuevo lead', 'color' => 'neutral', 'probability_pct' => 10],
            ['name' => 'Contactado', 'color' => 'info', 'probability_pct' => 25],
            ['name' => 'Visita agendada', 'color' => 'info', 'probability_pct' => 50],
            ['name' => 'Negociación', 'color' => 'warning', 'probability_pct' => 70],
            ['name' => 'Firmado', 'color' => 'positive', 'probability_pct' => 100, 'is_won' => true],
            ['name' => 'Perdido', 'color' => 'negative', 'probability_pct' => 0, 'is_lost' => true],
        ];

        $stages = collect();
        foreach ($stagesConfig as $i => $cfg) {
            $stages->push(
                Stage::firstOrCreate(
                    [
                        'agency_id' => $agency->id,
                        'pipeline_id' => $pipeline->id,
                        'name' => $cfg['name'],
                    ],
                    [
                        'color' => $cfg['color'],
                        'position' => $i,
                        'probability_pct' => $cfg['probability_pct'],
                        'is_won' => $cfg['is_won'] ?? false,
                        'is_lost' => $cfg['is_lost'] ?? false,
                    ],
                ),
            );
        }

        // Leads activos: distribuir entre los primeros 4 stages
        $activeStages = $stages->slice(0, 4);

        if (Lead::count() > 0) {
            $this->command->info('Leads ya existen, omitiendo seed.');

            return;
        }

        foreach ($activeStages as $stage) {
            $count = match ($stage->position) {
                0 => 12,
                1 => 8,
                2 => 5,
                3 => 3,
                default => 2,
            };

            Lead::factory()
                ->count($count)
                ->create([
                    'agency_id' => $agency->id,
                    'pipeline_id' => $pipeline->id,
                    'stage_id' => $stage->id,
                    'probability_pct' => $stage->probability_pct,
                    'assigned_user_id' => $agents->random()->id,
                ])
                ->each(function (Lead $lead, int $idx) use ($admin) {
                    $lead->update(['position' => $idx]);

                    LeadActivity::create([
                        'agency_id' => $lead->agency_id,
                        'lead_id' => $lead->id,
                        'user_id' => $admin?->id,
                        'type' => 'note',
                        'title' => 'Lead creado',
                        'body' => 'Se generó automáticamente desde formulario web.',
                        'occurred_at' => Carbon::now()->subDays(rand(1, 14)),
                    ]);

                    if (rand(0, 1)) {
                        LeadActivity::create([
                            'agency_id' => $lead->agency_id,
                            'lead_id' => $lead->id,
                            'user_id' => $admin?->id,
                            'type' => 'call',
                            'title' => 'Llamada de cualificación',
                            'body' => 'Confirmamos zona y presupuesto.',
                            'occurred_at' => Carbon::now()->subDays(rand(0, 5)),
                        ]);
                    }
                });
        }

        // Algunos leads ganados/perdidos
        Lead::factory()->count(4)->create([
            'agency_id' => $agency->id,
            'pipeline_id' => $pipeline->id,
            'stage_id' => $stages[4]->id,
            'status' => 'won',
            'probability_pct' => 100,
            'assigned_user_id' => $agents->random()->id,
        ]);

        Lead::factory()->count(3)->create([
            'agency_id' => $agency->id,
            'pipeline_id' => $pipeline->id,
            'stage_id' => $stages[5]->id,
            'status' => 'lost',
            'probability_pct' => 0,
            'lost_reason' => fake()->randomElement([
                'Precio fuera de presupuesto',
                'No respondió',
                'Cerró con la competencia',
                'Cambio de planes',
            ]),
            'assigned_user_id' => $agents->random()->id,
        ]);

        $this->command->info("✓ Pipeline '{$pipeline->name}' con ".$pipeline->stages()->count().' etapas y '.Lead::count().' leads.');
    }
}
