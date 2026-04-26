<?php

namespace App\Services;

use App\Models\AppNotification;
use App\Models\User;
use Illuminate\Support\Collection;

class NotificationService
{
    /**
     * Envía una notificación a uno o varios usuarios. Si $userIds es null,
     * la enviamos a todos los usuarios activos de la agency.
     *
     * @param  int|int[]|null  $userIds
     */
    public static function send(array $data, int $agencyId, $userIds = null): void
    {
        $defaults = [
            'agency_id' => $agencyId,
            'type' => 'custom',
            'icon_tone' => 'neutral',
        ];

        $payload = array_merge($defaults, $data);

        $targetUserIds = self::resolveUserIds($agencyId, $userIds);

        foreach ($targetUserIds as $uid) {
            AppNotification::create([
                ...$payload,
                'user_id' => $uid,
            ]);
        }
    }

    /**
     * @param  int|int[]|null  $userIds
     * @return Collection<int, int>
     */
    private static function resolveUserIds(int $agencyId, $userIds): Collection
    {
        if ($userIds === null) {
            return User::query()
                ->where('agency_id', $agencyId)
                ->where('active', true)
                ->pluck('id');
        }

        return collect(is_array($userIds) ? $userIds : [$userIds]);
    }

    public static function leadCreated(\App\Models\Lead $lead): void
    {
        self::send([
            'type' => 'lead_created',
            'title' => 'Nuevo lead',
            'body' => $lead->title,
            'link' => '/leads',
            'icon_tone' => 'info',
            'payload' => ['lead_id' => $lead->id, 'source' => $lead->source],
        ], $lead->agency_id, $lead->assigned_user_id);
    }

    public static function contractSigned(\App\Models\Contract $contract): void
    {
        self::send([
            'type' => 'contract_signed',
            'title' => 'Contrato firmado',
            'body' => "Contrato {$contract->code} ahora vigente",
            'link' => "/contratos/{$contract->id}",
            'icon_tone' => 'positive',
            'payload' => ['contract_id' => $contract->id],
        ], $contract->agency_id, $contract->agent_user_id);
    }

    public static function commissionDue(\App\Models\CommissionSplit $split): void
    {
        self::send([
            'type' => 'commission_pending',
            'title' => 'Comisión pendiente >7 días',
            'body' => "€{$split->amount} a ".(optional($split->user)->name ?? 'agente'),
            'link' => '/comisiones',
            'icon_tone' => 'warning',
            'payload' => ['split_id' => $split->id],
        ], $split->agency_id);
    }

    public static function chargeOverdue(\App\Models\Charge $charge): void
    {
        self::send([
            'type' => 'charge_overdue',
            'title' => 'Cargo vencido',
            'body' => "Cargo {$charge->code} no cobrado",
            'link' => '/cargos',
            'icon_tone' => 'negative',
            'payload' => ['charge_id' => $charge->id],
        ], $charge->agency_id);
    }
}
