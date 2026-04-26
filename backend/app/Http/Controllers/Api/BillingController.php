<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Agency;
use App\Models\Plan;
use App\Models\PlanChange;
use App\Services\PlanGate;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class BillingController extends Controller
{
    public function me(Request $request): JsonResponse
    {
        $user = $request->user();
        $agency = Agency::find($user->agency_id);
        $plan = PlanGate::planFor($agency);
        $usage = PlanGate::usage($agency);

        return response()->json([
            'agency' => [
                'id' => $agency->id,
                'name' => $agency->name,
                'slug' => $agency->slug,
                'subscription_status' => $agency->subscription_status,
                'billing_cycle' => $agency->billing_cycle,
                'subscription_started_at' => $agency->subscription_started_at?->toIso8601String(),
                'current_period_end' => $agency->current_period_end?->toIso8601String(),
                'trial_ends_at' => $agency->trial_ends_at?->toIso8601String(),
                'cancelled_at' => $agency->cancelled_at?->toIso8601String(),
                'is_trialing' => PlanGate::isTrialing($agency),
                'trial_days_left' => PlanGate::trialDaysLeft($agency),
            ],
            'plan' => $plan,
            'usage' => $usage,
        ]);
    }

    public function upgrade(Request $request): JsonResponse
    {
        $data = $request->validate([
            'plan_code' => ['required', Rule::exists('plans', 'code')],
            'billing_cycle' => ['sometimes', Rule::in(['monthly', 'yearly'])],
        ]);

        $user = $request->user();
        $agency = Agency::find($user->agency_id);

        if (! $agency) {
            return response()->json(['message' => 'Agencia no encontrada'], 404);
        }

        $oldPlan = $agency->current_plan_code;

        $agency->update([
            'current_plan_code' => $data['plan_code'],
            'subscription_status' => 'active',
            'subscription_started_at' => $agency->subscription_started_at ?? now(),
            'current_period_end' => now()->addMonth(),
            'cancelled_at' => null,
            'trial_ends_at' => null,
            'billing_cycle' => $data['billing_cycle'] ?? 'monthly',
        ]);

        PlanChange::create([
            'agency_id' => $agency->id,
            'from_plan' => $oldPlan,
            'to_plan' => $data['plan_code'],
            'reason' => 'manual_upgrade',
            'user_id' => $user->id,
        ]);

        return response()->json([
            'ok' => true,
            'message' => 'Plan actualizado',
            'agency' => $agency->fresh(),
        ]);
    }

    public function cancel(Request $request): JsonResponse
    {
        $user = $request->user();
        $agency = Agency::find($user->agency_id);

        $agency->update([
            'subscription_status' => 'cancelled',
            'cancelled_at' => now(),
        ]);

        PlanChange::create([
            'agency_id' => $agency->id,
            'from_plan' => $agency->current_plan_code,
            'to_plan' => $agency->current_plan_code,
            'reason' => 'cancelled',
            'user_id' => $user->id,
        ]);

        return response()->json(['ok' => true]);
    }

    public function reactivate(Request $request): JsonResponse
    {
        $user = $request->user();
        $agency = Agency::find($user->agency_id);

        $agency->update([
            'subscription_status' => 'active',
            'cancelled_at' => null,
            'current_period_end' => now()->addMonth(),
        ]);

        return response()->json(['ok' => true]);
    }
}
