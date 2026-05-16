<?php

namespace Database\Seeders;

use App\Models\Building;
use App\Models\Charge;
use App\Models\Contract;
use App\Models\Payment;
use App\Models\Person;
use App\Models\Property;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

/**
 * Siembra data demo (edificios, propiedades, personas, contratos, cargos y pagos)
 * para la agencia del usuario joheandroid@gmail.com. Modelado sobre DatabaseSeeder
 * pero apuntado a una agencia existente en vez de crear una nueva.
 *
 * Correr con: php artisan db:seed --class=JoheandroidDemoSeeder
 */
class JoheandroidDemoSeeder extends Seeder
{
    use WithoutModelEvents;

    private const TARGET_EMAIL = 'joheandroid@gmail.com';

    public function run(): void
    {
        $user = User::where('email', self::TARGET_EMAIL)->first();
        if (! $user) {
            $this->command->error('Usuario '.self::TARGET_EMAIL.' no existe. Abortando.');

            return;
        }

        $agency = $user->agency;
        if (! $agency) {
            $this->command->error('El usuario '.self::TARGET_EMAIL.' no tiene agencia asociada. Abortando.');

            return;
        }

        if (Property::where('agency_id', $agency->id)->exists()) {
            $this->command->warn("La agencia '{$agency->name}' ya tiene propiedades; se omite para no duplicar.");

            return;
        }

        // Agentes para asignar a los contratos. El owner (joheandroid) ya existe;
        // sumamos 3 agentes y lo incluimos a él en el pool.
        $agents = User::factory()->count(3)->create([
            'agency_id' => $agency->id,
            'role' => User::ROLE_AGENT,
        ]);
        $agents->push($user);

        // Edificios + propiedades (algunas en edificio, otras sueltas).
        $buildings = Building::factory()->count(5)->create(['agency_id' => $agency->id]);

        $properties = collect();
        foreach ($buildings as $building) {
            $properties = $properties->merge(
                Property::factory()
                    ->count(fake()->numberBetween(3, 6))
                    ->create([
                        'agency_id' => $agency->id,
                        'building_id' => $building->id,
                    ]),
            );
        }
        $properties = $properties->merge(
            Property::factory()->count(6)->create([
                'agency_id' => $agency->id,
                'building_id' => null,
            ]),
        );

        // Propietarios e inquilinos.
        $owners = Person::factory()->count(12)->owner()->create(['agency_id' => $agency->id]);
        $tenants = Person::factory()->count(20)->tenant()->create(['agency_id' => $agency->id]);

        // Contratos vigentes + sus cargos mensuales + pagos, para las ocupadas.
        $occupied = $properties->where('status', 'ocupada')->values();
        foreach ($occupied as $i => $property) {
            $start = Carbon::now()->subMonths(fake()->numberBetween(2, 30))->startOfMonth();
            $rent = $property->price_rent ?? fake()->numberBetween(700, 1800);

            $contract = Contract::create([
                'agency_id' => $agency->id,
                'code' => 'C-'.str_pad((string) (5300 + $i), 4, '0', STR_PAD_LEFT),
                'property_id' => $property->id,
                'owner_id' => $owners->random()->id,
                'tenant_id' => $tenants->random()->id,
                'agent_user_id' => $agents->random()->id,
                'type' => 'alquiler_residencial',
                'status' => 'vigente',
                'start_date' => $start,
                'end_date' => (clone $start)->addYear(),
                'monthly_rent' => $rent,
                'deposit' => $rent * 2,
                'commission_pct' => 10,
                'ipc_adjustment' => true,
                'payment_day' => fake()->randomElement([1, 5, 10]),
                'signed_at' => $start,
            ]);

            $cursor = $start->copy();
            $j = 0;
            while ($cursor->lte(Carbon::now())) {
                $due = $cursor->copy()->setDay($contract->payment_day);
                $isPast = $due->lt(Carbon::today());
                $code = 'CG-'.str_pad((string) ($contract->id * 100 + $j++), 7, '0', STR_PAD_LEFT);

                $charge = Charge::create([
                    'agency_id' => $agency->id,
                    'contract_id' => $contract->id,
                    'person_id' => $contract->tenant_id,
                    'code' => $code,
                    'concept' => 'renta',
                    'description' => 'Renta '.$cursor->translatedFormat('F Y'),
                    'amount' => $contract->monthly_rent,
                    'paid_amount' => 0,
                    'issued_at' => $cursor->copy()->startOfMonth(),
                    'due_date' => $due,
                    'status' => $isPast ? (fake()->boolean(85) ? 'pagado' : 'vencido') : 'pendiente',
                ]);

                if ($charge->status === 'pagado') {
                    $charge->update([
                        'paid_amount' => $charge->amount,
                        'paid_at' => $due->copy()->addDays(fake()->numberBetween(-2, 6)),
                    ]);
                    Payment::create([
                        'agency_id' => $agency->id,
                        'charge_id' => $charge->id,
                        'amount' => $charge->amount,
                        'method' => fake()->randomElement(['transferencia', 'domiciliacion']),
                        'reference' => 'TR-'.Str::random(8),
                        'received_at' => $charge->paid_at,
                        'registered_by' => $user->id,
                    ]);
                }

                $cursor->addMonth();
            }
        }

        $this->command->info(
            "✓ Demo data para '{$agency->name}' (".self::TARGET_EMAIL.'): '
            ."{$properties->count()} propiedades, {$occupied->count()} contratos vigentes."
        );
    }
}
