<?php

namespace Database\Seeders;

use App\Models\Agency;
use App\Models\Building;
use App\Models\Person;
use App\Models\Pipeline;
use App\Models\Property;
use App\Models\Stage;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class SecondAgencySeeder extends Seeder
{
    public function run(): void
    {
        if (Agency::where('slug', 'mediterraneo')->exists()) {
            $this->command->info('Inmobiliaria Mediterráneo ya existe, omitiendo.');
            return;
        }

        $agency = Agency::create([
            'name' => 'Inmobiliaria Mediterráneo',
            'slug' => 'mediterraneo',
            'email' => 'hola@mediterraneo.local',
            'phone' => '+34 963 555 444',
            'address' => 'Avenida del Puerto 50',
            'city' => 'Valencia',
            'country' => 'ES',
            'plan' => 'starter',
            'active' => true,
        ]);

        $owner = User::create([
            'agency_id' => $agency->id,
            'name' => 'María Hernández',
            'email' => 'maria@mediterraneo.local',
            'password' => Hash::make('password'),
            'role' => User::ROLE_OWNER,
            'phone' => '+34 600 555 444',
            'active' => true,
            'email_verified_at' => now(),
        ]);

        // Pipeline default
        $pipeline = Pipeline::create([
            'agency_id' => $agency->id,
            'name' => 'Alquiler residencial',
            'slug' => 'alquiler-residencial',
            'purpose' => 'alquiler',
            'is_default' => true,
            'position' => 0,
        ]);

        $stages = [
            ['Nuevo lead', 'neutral', 10, false, false],
            ['Contactado', 'info', 25, false, false],
            ['Visita agendada', 'info', 50, false, false],
            ['Negociación', 'warning', 75, false, false],
            ['Firmado', 'positive', 100, true, false],
            ['Perdido', 'negative', 0, false, true],
        ];
        foreach ($stages as $i => [$name, $color, $pct, $won, $lost]) {
            Stage::create([
                'agency_id' => $agency->id,
                'pipeline_id' => $pipeline->id,
                'name' => $name,
                'color' => $color,
                'position' => $i,
                'probability_pct' => $pct,
                'is_won' => $won,
                'is_lost' => $lost,
            ]);
        }

        // Edificios
        $buildings = Building::factory()->count(2)->create(['agency_id' => $agency->id]);

        // Propiedades — algunas marcadas como compartidas para que aparezcan en el marketplace
        $properties = collect();
        foreach ($buildings as $building) {
            $properties = $properties->merge(
                Property::factory()->count(5)->create([
                    'agency_id' => $agency->id,
                    'building_id' => $building->id,
                ]),
            );
        }
        $properties = $properties->merge(
            Property::factory()->count(5)->create([
                'agency_id' => $agency->id,
                'building_id' => null,
            ]),
        );

        // Marcar las primeras 6 disponibles como compartidas en el marketplace
        Property::withoutGlobalScopes()
            ->where('agency_id', $agency->id)
            ->where('status', 'disponible')
            ->take(6)
            ->update([
                'is_shared' => true,
                'shared_at' => now(),
                'is_published' => true,
                'published_at' => now(),
                'share_pct' => 50.00,
            ]);

        // Personas
        Person::factory()->count(5)->owner()->create(['agency_id' => $agency->id]);

        // Marcar también algunas de la agencia Sorní como compartidas para tener cross-flow
        $sorni = Agency::where('slug', 'sorni')->first();
        if ($sorni) {
            Property::withoutGlobalScopes()
                ->where('agency_id', $sorni->id)
                ->where('status', 'disponible')
                ->take(4)
                ->update([
                    'is_shared' => true,
                    'shared_at' => now(),
                    'share_pct' => 50.00,
                ]);
        }

        $this->command->info("✓ Inmobiliaria Mediterráneo creada (login: maria@mediterraneo.local / password)");
        $this->command->info("✓ Marketplace cruzado habilitado: Sorní comparte 4, Mediterráneo comparte 6.");

        // Mute warning unused
        unset($owner);
    }
}
