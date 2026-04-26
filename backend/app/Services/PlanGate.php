<?php

namespace App\Services;

use App\Models\Agency;
use App\Models\Plan;
use App\Models\Property;
use App\Models\User;
use App\Models\Lead;
use App\Models\Pipeline;

/**
 * Verifica límites y features según el plan de la agency.
 */
class PlanGate
{
    /**
     * Devuelve el plan actual o starter como fallback.
     */
    public static function planFor(Agency $agency): ?Plan
    {
        return Plan::where('code', $agency->current_plan_code ?: 'starter')->first();
    }

    public static function isTrialing(Agency $agency): bool
    {
        return $agency->subscription_status === 'trialing'
            && $agency->trial_ends_at
            && $agency->trial_ends_at->isFuture();
    }

    public static function isExpiredTrial(Agency $agency): bool
    {
        return $agency->subscription_status === 'trialing'
            && $agency->trial_ends_at
            && $agency->trial_ends_at->isPast();
    }

    public static function trialDaysLeft(Agency $agency): int
    {
        if (! $agency->trial_ends_at) {
            return 0;
        }
        return max(0, (int) round(now()->diffInSeconds($agency->trial_ends_at, false) / 86400));
    }

    /**
     * Resuelve el límite. -1 = ilimitado. null = sin plan (usar fallback).
     * Devuelve null si es ilimitado, o un int >= 0 con el tope.
     */
    private static function resolveLimit(Agency $agency, string $key, int $fallback): ?int
    {
        $plan = self::planFor($agency);
        $limit = $plan?->limit($key, $fallback) ?? $fallback;
        return $limit === -1 ? null : (int) $limit;
    }

    public static function canCreateProperty(Agency $agency): array
    {
        $limit = self::resolveLimit($agency, 'max_properties', 10);
        if ($limit === null) {
            return ['allowed' => true];
        }
        $current = Property::withoutGlobalScopes()->where('agency_id', $agency->id)->count();
        return [
            'allowed' => $current < $limit,
            'current' => $current,
            'limit' => $limit,
            'feature' => 'properties',
        ];
    }

    public static function canCreateUser(Agency $agency): array
    {
        $limit = self::resolveLimit($agency, 'max_users', 1);
        if ($limit === null) {
            return ['allowed' => true];
        }
        $current = User::where('agency_id', $agency->id)->where('active', true)->count();
        return [
            'allowed' => $current < $limit,
            'current' => $current,
            'limit' => $limit,
            'feature' => 'users',
        ];
    }

    public static function canCreateLead(Agency $agency): array
    {
        $limit = self::resolveLimit($agency, 'max_active_leads', 25);
        if ($limit === null) {
            return ['allowed' => true];
        }
        $current = Lead::withoutGlobalScopes()
            ->where('agency_id', $agency->id)
            ->where('status', 'open')
            ->count();
        return [
            'allowed' => $current < $limit,
            'current' => $current,
            'limit' => $limit,
            'feature' => 'leads',
        ];
    }

    public static function canCreatePipeline(Agency $agency): array
    {
        $limit = self::resolveLimit($agency, 'max_pipelines', 1);
        if ($limit === null) {
            return ['allowed' => true];
        }
        $current = Pipeline::withoutGlobalScopes()->where('agency_id', $agency->id)->count();
        return [
            'allowed' => $current < $limit,
            'current' => $current,
            'limit' => $limit,
            'feature' => 'pipelines',
        ];
    }

    public static function hasFeature(Agency $agency, string $code): bool
    {
        $plan = self::planFor($agency);
        return $plan ? $plan->hasFeature($code) : false;
    }

    /**
     * Snapshot de uso actual para mostrar en /facturacion.
     * `limit` puede ser:
     *  - int positivo: tope numérico
     *  - -1: ilimitado
     *  - null: plan no definido (UI debe mostrar "—")
     */
    public static function usage(Agency $agency): array
    {
        $plan = self::planFor($agency);

        $get = fn (string $k) => $plan?->limit($k);

        return [
            'properties' => [
                'current' => (int) Property::withoutGlobalScopes()->where('agency_id', $agency->id)->count(),
                'limit' => $get('max_properties'),
            ],
            'users' => [
                'current' => (int) User::where('agency_id', $agency->id)->where('active', true)->count(),
                'limit' => $get('max_users'),
            ],
            'active_leads' => [
                'current' => (int) Lead::withoutGlobalScopes()
                    ->where('agency_id', $agency->id)
                    ->where('status', 'open')->count(),
                'limit' => $get('max_active_leads'),
            ],
            'pipelines' => [
                'current' => (int) Pipeline::withoutGlobalScopes()->where('agency_id', $agency->id)->count(),
                'limit' => $get('max_pipelines'),
            ],
        ];
    }
}
