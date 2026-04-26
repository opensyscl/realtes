<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\Agency;
use App\Models\Pipeline;
use App\Models\Stage;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
            'device_name' => ['nullable', 'string', 'max:60'],
        ]);

        $user = User::where('email', $data['email'])->first();

        if (! $user || ! Hash::check($data['password'], $user->password) || ! $user->active) {
            throw ValidationException::withMessages([
                'email' => ['Credenciales incorrectas.'],
            ]);
        }

        $user->update(['last_login_at' => now()]);
        $user->load('agency');

        $token = $user->createToken($data['device_name'] ?? 'web')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => new UserResource($user),
        ]);
    }

    /**
     * Signup multi-tenant: crea Agency + Owner + Pipeline default + Stages.
     */
    public function register(Request $request): JsonResponse
    {
        $data = $request->validate([
            'agency_name' => ['required', 'string', 'max:120'],
            'agency_slug' => [
                'required', 'string', 'max:60', 'alpha_dash',
                Rule::unique('agencies', 'slug'),
            ],
            'agency_phone' => ['nullable', 'string', 'max:30'],
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:160', Rule::unique('users', 'email')],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $result = DB::transaction(function () use ($data) {
            $agency = Agency::create([
                'name' => $data['agency_name'],
                'slug' => Str::lower($data['agency_slug']),
                'email' => $data['email'],
                'phone' => $data['agency_phone'] ?? null,
                'city' => 'Valencia',
                'country' => 'ES',
                'plan' => 'pro',
                'current_plan_code' => 'pro',
                'subscription_status' => 'trialing',
                'subscription_started_at' => now(),
                'trial_ends_at' => now()->addDays(14),
                'current_period_end' => now()->addDays(14),
                'billing_cycle' => 'monthly',
                'active' => true,
            ]);

            $user = User::create([
                'agency_id' => $agency->id,
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => Hash::make($data['password']),
                'role' => User::ROLE_OWNER,
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

            $defaultStages = [
                ['Nuevo lead', 'neutral', 10, false, false],
                ['Contactado', 'info', 25, false, false],
                ['Visita agendada', 'info', 50, false, false],
                ['Negociación', 'warning', 75, false, false],
                ['Firmado', 'positive', 100, true, false],
                ['Perdido', 'negative', 0, false, true],
            ];

            foreach ($defaultStages as $i => [$name, $color, $pct, $won, $lost]) {
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

            return [$agency, $user];
        });

        [, $user] = $result;
        $user->load('agency');
        $token = $user->createToken('signup-web')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => new UserResource($user),
        ], 201);
    }

    public function me(Request $request): UserResource
    {
        return new UserResource($request->user()->load('agency'));
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['ok' => true]);
    }

    public function updateProfile(Request $request): UserResource
    {
        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:120'],
            'phone' => ['nullable', 'string', 'max:30'],
            'avatar_url' => ['nullable', 'url', 'max:500'],
            'password' => ['nullable', 'string', 'min:8', 'confirmed'],
        ]);

        $user = $request->user();
        if (! empty($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        } else {
            unset($data['password']);
        }

        $user->update($data);

        return new UserResource($user->fresh()->load('agency'));
    }
}
