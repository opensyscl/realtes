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
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
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
                'plan' => 'starter',
                'current_plan_code' => 'starter',
                'subscription_status' => 'active',
                'subscription_started_at' => now(),
                'trial_ends_at' => null,
                'current_period_end' => null,
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

    /**
     * Solicita un email con enlace para resetear la contraseña.
     * Por seguridad responde 200 incluso si el email no existe (no revelar registros).
     * Token válido por 60 minutos.
     */
    public function forgotPassword(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => ['required', 'email', 'max:160'],
        ]);

        $user = User::where('email', $data['email'])
            ->where('active', true)
            ->first();

        if (! $user) {
            // No revelamos si el email está registrado o no.
            return response()->json(['ok' => true]);
        }

        $rawToken = Str::random(64);

        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $data['email']],
            ['token' => Hash::make($rawToken), 'created_at' => now()],
        );

        $frontendUrl = rtrim(config('app.frontend_url', env('FRONTEND_URL', 'http://localhost:3001')), '/');
        $url = $frontendUrl
            . '/reset?token=' . $rawToken
            . '&email=' . urlencode($data['email']);

        Mail::to($user->email)->send(
            new \App\Mail\PasswordResetMail($user, $url),
        );

        return response()->json(['ok' => true]);
    }

    /**
     * Cambia la contraseña usando el token enviado por email.
     * En éxito devuelve token Sanctum nuevo (auto-login).
     */
    public function resetPassword(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => ['required', 'email', 'max:160'],
            'token' => ['required', 'string', 'min:32', 'max:200'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $row = DB::table('password_reset_tokens')
            ->where('email', $data['email'])
            ->first();

        if (! $row || ! Hash::check($data['token'], $row->token)) {
            throw ValidationException::withMessages([
                'token' => ['Enlace inválido o ya usado. Solicita uno nuevo.'],
            ]);
        }

        // Token expira en 60 minutos
        if (Carbon::parse($row->created_at)->addMinutes(60)->isPast()) {
            DB::table('password_reset_tokens')->where('email', $data['email'])->delete();
            throw ValidationException::withMessages([
                'token' => ['El enlace expiró. Solicita uno nuevo.'],
            ]);
        }

        $user = User::where('email', $data['email'])->where('active', true)->first();

        if (! $user) {
            throw ValidationException::withMessages([
                'email' => ['Usuario no encontrado.'],
            ]);
        }

        DB::transaction(function () use ($user, $data) {
            $user->update(['password' => Hash::make($data['password'])]);
            // Invalida tokens previos (cierra sesiones)
            $user->tokens()->delete();
            // Limpia el token de reset
            DB::table('password_reset_tokens')->where('email', $data['email'])->delete();
        });

        $user->load('agency');
        $token = $user->createToken('reset-web')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => new UserResource($user),
        ]);
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
