<?php

namespace App\Services;

use App\Models\Property;
use App\Models\PropertyEvent;
use App\Models\Contract;
use Illuminate\Support\Facades\Auth;

/**
 * Registra eventos en el historial de una propiedad. Cada método toma
 * snapshots con todo el contexto necesario para mostrar el evento después
 * sin tener que hacer joins (los modelos referenciados pueden ser borrados).
 */
class PropertyEventLogger
{
    public static function statusChanged(Property $property, ?string $from, string $to): void
    {
        if ($from === $to) {
            return;
        }

        self::log($property, 'status_change', [
            'from_value' => $from,
            'to_value' => $to,
            'snapshot' => [
                'client' => $property->client ? [
                    'id' => $property->client->id,
                    'full_name' => trim("{$property->client->first_name} {$property->client->last_name}"),
                ] : null,
            ],
        ]);
    }

    public static function clientAssigned(Property $property, int $personId): void
    {
        $person = \App\Models\Person::withoutGlobalScopes()->find($personId);
        if (! $person) {
            return;
        }

        self::log($property, 'client_assigned', [
            'to_value' => trim("{$person->first_name} {$person->last_name}"),
            'snapshot' => [
                'client_id' => $person->id,
                'full_name' => trim("{$person->first_name} {$person->last_name}"),
                'email' => $person->email,
                'phone' => $person->phone,
            ],
        ]);
    }

    public static function clientRemoved(Property $property, int $previousId): void
    {
        $person = \App\Models\Person::withoutGlobalScopes()->find($previousId);

        self::log($property, 'client_removed', [
            'from_value' => $person ? trim("{$person->first_name} {$person->last_name}") : null,
            'snapshot' => $person ? [
                'client_id' => $person->id,
                'full_name' => trim("{$person->first_name} {$person->last_name}"),
            ] : null,
        ]);
    }

    public static function leaseCreated(Property $property, Contract $contract): void
    {
        $contract->loadMissing('tenant');

        self::log($property, 'lease_created', [
            'to_value' => $contract->code,
            'snapshot' => self::contractSnapshot($contract),
        ]);
    }

    public static function leaseUpdated(Property $property, Contract $contract): void
    {
        $contract->loadMissing('tenant');

        self::log($property, 'lease_updated', [
            'to_value' => $contract->code,
            'snapshot' => self::contractSnapshot($contract),
        ]);
    }

    public static function leaseEnded(Property $property, Contract $contract): void
    {
        $contract->loadMissing('tenant');

        self::log($property, 'lease_ended', [
            'from_value' => $contract->code,
            'snapshot' => self::contractSnapshot($contract),
        ]);
    }

    private static function contractSnapshot(Contract $contract): array
    {
        return [
            'contract_id' => $contract->id,
            'code' => $contract->code,
            'start_date' => $contract->start_date?->toDateString(),
            'end_date' => $contract->end_date?->toDateString(),
            'monthly_rent' => $contract->monthly_rent !== null ? (float) $contract->monthly_rent : null,
            'deposit' => $contract->deposit !== null ? (float) $contract->deposit : null,
            'auto_renew' => (bool) $contract->auto_renew,
            'tenant' => $contract->tenant ? [
                'id' => $contract->tenant->id,
                'full_name' => trim("{$contract->tenant->first_name} {$contract->tenant->last_name}"),
                'email' => $contract->tenant->email,
                'phone' => $contract->tenant->phone,
                'nif' => $contract->tenant->nif,
            ] : null,
        ];
    }

    private static function log(Property $property, string $type, array $data): void
    {
        PropertyEvent::create(array_merge([
            'agency_id' => $property->agency_id,
            'property_id' => $property->id,
            'user_id' => Auth::id(),
            'type' => $type,
            'occurred_at' => now(),
        ], $data));
    }
}
