<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Jobs\ProcessMlWebhook;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class MlWebhookController extends Controller
{
    /** POST /api/webhooks/mercadolibre */
    public function handle(Request $request): JsonResponse
    {
        // ML no firma webhooks: validamos por IP whitelist (ver config/services.php).
        $allowed = (array) config('services.mercadolibre.allowed_ips', []);
        if (! empty($allowed) && ! in_array($request->ip(), $allowed, true)) {
            Log::warning('ML webhook rechazado por IP no whitelisted', [
                'ip' => $request->ip(),
                'topic' => $request->input('topic'),
            ]);
            // Devolvemos 200 igual para que ML no haga retry-storm — no procesamos.
            return response()->json(['ok' => true]);
        }

        $payload = $request->all();
        Log::info('ML webhook recibido', [
            'topic' => $payload['topic'] ?? null,
            'resource' => $payload['resource'] ?? null,
            'user_id' => $payload['user_id'] ?? null,
        ]);

        // ML exige 200 en <500ms — encolamos.
        ProcessMlWebhook::dispatch($payload);

        return response()->json(['ok' => true]);
    }
}
