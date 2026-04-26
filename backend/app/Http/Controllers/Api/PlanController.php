<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Plan;
use Illuminate\Http\JsonResponse;

/**
 * Endpoint público con los 3 planes de suscripción.
 */
class PlanController extends Controller
{
    public function index(): JsonResponse
    {
        $plans = Plan::where('active', true)
            ->orderBy('position')
            ->get();

        return response()->json([
            'data' => $plans,
        ]);
    }
}
