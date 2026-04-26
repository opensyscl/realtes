<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Laravel\Sanctum\PersonalAccessToken;

/**
 * CRUD de Personal Access Tokens (API keys) para uso externo.
 *
 * El token se devuelve en TEXTO PLANO solo una vez en la respuesta de `store`.
 * Después solo queda guardada la versión hasheada — no hay forma de recuperarlo.
 */
class TokenController extends Controller
{
    /** @var string[] Abilities (scopes) disponibles */
    public const AVAILABLE_ABILITIES = [
        'properties:read',
        'properties:write',
        'leads:read',
        'leads:write',
        'contracts:read',
        'persons:read',
        'persons:write',
        '*', // full access (mismo nivel que la sesión web)
    ];

    public function index(Request $request): JsonResponse
    {
        $tokens = $request->user()->tokens()
            ->orderByDesc('created_at')
            ->get(['id', 'name', 'abilities', 'last_used_at', 'created_at']);

        return response()->json([
            'data' => $tokens->map(fn ($t) => [
                'id' => (int) $t->id,
                'name' => (string) $t->name,
                'abilities' => $t->abilities ?? [],
                'last_used_at' => $t->last_used_at?->toIso8601String(),
                'created_at' => $t->created_at?->toIso8601String(),
                'preview' => 'rsv_…'.substr($t->id, -4), // hint visual, no es el token real
            ])->all(),
            'available_abilities' => self::AVAILABLE_ABILITIES,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:80'],
            'abilities' => ['sometimes', 'array'],
            'abilities.*' => ['string', Rule::in(self::AVAILABLE_ABILITIES)],
        ]);

        $abilities = $data['abilities'] ?? ['*'];

        $token = $request->user()->createToken($data['name'], $abilities);

        return response()->json([
            'data' => [
                'id' => (int) $token->accessToken->id,
                'name' => (string) $token->accessToken->name,
                'abilities' => $token->accessToken->abilities ?? [],
                'created_at' => $token->accessToken->created_at?->toIso8601String(),
                // El token EN CLARO solo se devuelve aquí, una sola vez:
                'plain_text_token' => $token->plainTextToken,
            ],
        ], 201);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $token = $request->user()->tokens()->where('id', $id)->firstOrFail();
        $token->delete();

        return response()->json(['ok' => true]);
    }
}
