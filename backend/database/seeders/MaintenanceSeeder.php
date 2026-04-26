<?php

namespace Database\Seeders;

use App\Models\Agency;
use App\Models\Contract;
use App\Models\MaintenanceComment;
use App\Models\MaintenanceTicket;
use App\Models\Property;
use App\Models\User;
use Illuminate\Database\Seeder;

class MaintenanceSeeder extends Seeder
{
    public function run(): void
    {
        $agency = Agency::first();
        if (! $agency) {
            return;
        }
        if (MaintenanceTicket::count() > 0) {
            $this->command->info('Tickets ya existen, omitiendo seed.');
            return;
        }

        $admin = User::where('email', 'hola@bookforce.io')->first();
        $agents = User::where('agency_id', $agency->id)->get();
        $properties = Property::where('agency_id', $agency->id)->get();
        $contracts = Contract::where('agency_id', $agency->id)->get();

        $tickets = MaintenanceTicket::factory()
            ->count(20)
            ->make(['agency_id' => $agency->id])
            ->each(function (MaintenanceTicket $t) use ($properties, $contracts, $agents) {
                $property = $properties->random();
                $t->property_id = $property->id;
                $contract = $contracts->where('property_id', $property->id)->first();
                if ($contract) {
                    $t->contract_id = $contract->id;
                    $t->reported_by = $contract->tenant_id;
                }
                if (in_array($t->status, ['en_progreso', 'esperando_proveedor', 'resuelto', 'cerrado'], true)) {
                    $t->assigned_user_id = $agents->random()->id;
                }
                $t->save();
            });

        // Comentarios de timeline
        foreach ($tickets as $t) {
            MaintenanceComment::create([
                'agency_id' => $agency->id,
                'ticket_id' => $t->id,
                'user_id' => $admin?->id,
                'type' => 'comment',
                'body' => 'Ticket creado y notificado al equipo de mantenimiento.',
                'created_at' => $t->opened_at,
                'updated_at' => $t->opened_at,
            ]);

            if ($t->assigned_user_id) {
                MaintenanceComment::create([
                    'agency_id' => $agency->id,
                    'ticket_id' => $t->id,
                    'user_id' => $admin?->id,
                    'type' => 'assignment',
                    'body' => "Asignado a {$t->assignedTo?->name}.",
                    'payload' => ['assigned_user_id' => $t->assigned_user_id],
                    'created_at' => $t->opened_at->copy()->addHours(2),
                    'updated_at' => $t->opened_at->copy()->addHours(2),
                ]);
            }

            if ($t->resolved_at) {
                MaintenanceComment::create([
                    'agency_id' => $agency->id,
                    'ticket_id' => $t->id,
                    'user_id' => $t->assigned_user_id,
                    'type' => 'status_change',
                    'body' => 'Resuelto. ' . ($t->vendor ? "Proveedor: {$t->vendor}." : ''),
                    'payload' => ['from' => 'en_progreso', 'to' => 'resuelto'],
                    'created_at' => $t->resolved_at,
                    'updated_at' => $t->resolved_at,
                ]);
            }
        }

        $this->command->info("✓ {$tickets->count()} tickets de mantenimiento creados.");
    }
}
