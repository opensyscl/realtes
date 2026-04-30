<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MlToken;
use App\Services\MercadoLibre\MlOAuth;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class MlAuthController extends Controller
{
    public function __construct(private readonly MlOAuth $oauth) {}

    /** GET /api/integrations/mercadolibre/connect — devuelve URL de autorización */
    public function connect(Request $request): JsonResponse
    {
        $user = $request->user();
        if (! $user || ! $user->agency_id) {
            return response()->json(['message' => 'No autenticado o sin agencia.'], 403);
        }

        return response()->json([
            'url' => $this->oauth->authorizationUrl((int) $user->agency_id, (int) $user->id),
        ]);
    }

    /** GET /api/integrations/mercadolibre/callback — público, valida state firmado */
    public function callback(Request $request): RedirectResponse
    {
        $code = (string) $request->query('code', '');
        $state = (string) $request->query('state', '');
        $error = (string) $request->query('error', '');
        $redirect = (string) config('services.mercadolibre.frontend_redirect');

        if ($error) {
            Log::warning('ML callback returned error', [
                'error' => $error,
                'desc' => $request->query('error_description'),
            ]);
            return redirect()->away($redirect.'?ml=error&reason='.urlencode($error));
        }

        if (! $code || ! $state) {
            return redirect()->away($redirect.'?ml=error&reason=missing_code_or_state');
        }

        try {
            $verified = $this->oauth->decodeState($state);
            $token = $this->oauth->exchangeCode($code, $verified['agency_id'], $verified['user_id']);
        } catch (\Throwable $e) {
            Log::error('ML OAuth exchange failed', ['err' => $e->getMessage()]);
            return redirect()->away($redirect.'?ml=error&reason='.urlencode($e->getMessage()));
        }

        return redirect()->away($redirect.'?ml=connected&user='.urlencode((string) $token->ml_user_id));
    }

    /** GET /api/integrations/mercadolibre/me */
    public function me(Request $request): JsonResponse
    {
        $token = MlToken::where('agency_id', $request->user()->agency_id)->first();
        if (! $token) {
            return response()->json(['connected' => false]);
        }

        return response()->json([
            'connected' => true,
            'ml_user_id' => $token->ml_user_id,
            'connected_at' => $token->connected_at,
            'expires_at' => $token->expires_at,
            'last_refresh_at' => $token->last_refresh_at,
            'last_error' => $token->last_error,
        ]);
    }

    /** DELETE /api/integrations/mercadolibre/disconnect */
    public function disconnect(Request $request): JsonResponse
    {
        MlToken::where('agency_id', $request->user()->agency_id)->delete();
        return response()->json(['ok' => true]);
    }
}
