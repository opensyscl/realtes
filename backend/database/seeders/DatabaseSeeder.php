<?php

namespace Database\Seeders;

use App\Models\Agency;
use App\Models\Charge;
use App\Models\Contract;
use App\Models\Building;
use App\Models\Payment;
use App\Models\Person;
use App\Models\Property;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        // ---------- Agency demo ----------
        $agency = Agency::firstOrCreate(
            ['slug' => 'sorni'],
            [
                'name' => 'Inmobiliaria Sorní',
                'email' => 'hola@sorni.realstatevalencia.local',
                'phone' => '+34 963 222 111',
                'address' => 'Calle Sorní 12',
                'city' => 'Valencia',
                'country' => 'ES',
                'plan' => 'pro',
                'active' => true,
            ],
        );

        // ---------- Owner / user admin (el del proyecto) ----------
        $admin = User::firstOrCreate(
            ['email' => 'hola@bookforce.io'],
            [
                'agency_id' => $agency->id,
                'name' => 'Josbert Lonardi',
                'password' => Hash::make('password'),
                'role' => User::ROLE_OWNER,
                'phone' => '+34 600 000 000',
                'active' => true,
                'email_verified_at' => now(),
            ],
        );

        $agents = User::factory()->count(4)->create([
            'agency_id' => $agency->id,
            'role' => User::ROLE_AGENT,
        ]);

        $buildings = Building::factory()
            ->count(6)
            ->create(['agency_id' => $agency->id]);

        $properties = collect();
        foreach ($buildings as $building) {
            $properties = $properties->merge(
                Property::factory()
                    ->count(fake()->numberBetween(3, 7))
                    ->create([
                        'agency_id' => $agency->id,
                        'building_id' => $building->id,
                    ]),
            );
        }
        $properties = $properties->merge(
            Property::factory()
                ->count(8)
                ->create(['agency_id' => $agency->id, 'building_id' => null]),
        );

        $owners = Person::factory()->count(15)->owner()->create(['agency_id' => $agency->id]);
        $tenants = Person::factory()->count(25)->tenant()->create(['agency_id' => $agency->id]);

        $occupied = $properties->where('status', 'ocupada');
        foreach ($occupied as $i => $property) {
            $start = Carbon::now()->subMonths(fake()->numberBetween(2, 30))->startOfMonth();
            $end = (clone $start)->addYear();
            $rent = $property->price_rent ?? fake()->numberBetween(700, 1800);

            $contract = Contract::create([
                'agency_id' => $agency->id,
                'code' => 'C-'.str_pad((string) (2300 + $i), 4, '0', STR_PAD_LEFT),
                'property_id' => $property->id,
                'owner_id' => $owners->random()->id,
                'tenant_id' => $tenants->random()->id,
                'agent_user_id' => $agents->random()->id,
                'type' => 'alquiler_residencial',
                'status' => 'vigente',
                'start_date' => $start,
                'end_date' => $end,
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
                        'registered_by' => $admin->id,
                    ]);
                }

                $cursor->addMonth();
            }
        }

        $this->command->info("✓ Agency '{$agency->name}' lista con {$properties->count()} propiedades, {$occupied->count()} contratos vigentes.");
        $this->command->info("✓ Login: hola@bookforce.io / password");
    }
}
