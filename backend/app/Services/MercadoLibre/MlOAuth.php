<?php

namespace App\Services\MercadoLibre;

use App\Models\MlToken;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use RuntimeException;

class MlOAuth
{
    public function __construct(
        private readonly string $clientId,
        private readonly string $clientSecret,
        private readonly string $redirectUri,
        private readonly string $authBase,
        private readonly string $apiBase,
    ) {}

    public static function fromConfig(): self
    {
        $cfg = config('services.mercadolibre');
        return new self(
            (string) ($cfg['client_id'] ?? ''),
            (string) ($cfg['client_secret'] ?? ''),
            (string) ($cfg['redirect_uri'] ?? ''),
            (string) ($cfg['auth_base'] ?? 'https://auth.mercadolibre.cl/authorization'),
            (string) ($cfg['api_base'] ?? 'https://api.mercadolibre.com'),
        );
    }

    /**
     * URL que el usuario debe visitar para autorizar Realtes contra su cuenta ML.
     * El parámetro `state` lleva agency_id + user_id firmados (Crypt::encrypt) para que
     * el callback público los pueda recuperar sin sesión activa.
     */
    public function authorizationUrl(int $agencyId, int $userId): string
    {
        $state = Crypt::encryptString(json_encode([
            'agency_id' => $agencyId,
            'user_id' => $userId,
            'nonce' => bin2hex(random_bytes(8)),
            'exp' => now()->addMinutes(15)->timestamp,
        ]));

        return $this->authBase.'?'.http_build_query([
            'response_type' => 'code',
            'client_id' => $this->clientId,
            'redirect_uri' => $this->redirectUri,
            'state' => $state,
        ]);
    }

    /**
     * @return array{agency_id:int, user_id:int}
     */
    public function decodeState(string $state): array
    {
        try {
            $raw = Crypt::decryptString($state);
        } catch (\Throwable $e) {
            throw new RuntimeException('OAuth state inválido o falsificado.', 400, $e);
        }

        $data = json_decode($raw, true);
        if (! is_array($data) || empty($data['agency_id']) || empty($data['user_id']) || empty($data['exp'])) {
            throw new RuntimeException('OAuth state malformado.', 400);
        }

        if (Carbon::createFromTimestamp($data['exp'])->isPast()) {
            throw new RuntimeException('OAuth state expirado, repite la conexión.', 400);
        }

        return ['agency_id' => (int) $data['agency_id'], 'user_id' => (int) $data['user_id']];
    }

    public function exchangeCode(string $code, int $agencyId, int $userId): MlToken
    {
        $response = Http::asForm()->acceptJson()
            ->post($this->apiBase.'/oauth/token', [
                'grant_type' => 'authorization_code',
                'client_id' => $this->clientId,
                'client_secret' => $this->clientSecret,
                'code' => $code,
                'redirect_uri' => $this->redirectUri,
            ]);

        $this->ensureOk($response, 'oauth.exchange');

        return $this->persist($agencyId, $userId, $response->json());
    }

    public function refresh(MlToken $token): MlToken
    {
        $response = Http::asForm()->acceptJson()
            ->post($this->apiBase.'/oauth/token', [
                'grant_type' => 'refresh_token',
                'client_id' => $this->clientId,
                'client_secret' => $this->clientSecret,
                'refresh_token' => $token->refresh_token,
            ]);

        if (! $response->ok()) {
            $token->update(['last_error' => $this->extractError($response)]);
            $this->ensureOk($response, 'oauth.refresh');
        }

        $data = $response->json();
        $token->update([
            'access_token' => (string) ($data['access_token'] ?? $token->access_token),
            'refresh_token' => (string) ($data['refresh_token'] ?? $token->refresh_token),
            'token_type' => (string) ($data['token_type'] ?? $token->token_type),
            'scope' => (string) ($data['scope'] ?? $token->scope),
            'expires_at' => isset($data['expires_in']) ? now()->addSeconds((int) $data['expires_in']) : $token->expires_at,
            'last_refresh_at' => now(),
            'last_error' => null,
        ]);

        return $token->fresh();
    }

    private function persist(int $agencyId, int $userId, array $data): MlToken
    {
        return MlToken::updateOrCreate(
            ['agency_id' => $agencyId],
            [
                'ml_user_id' => $data['user_id'] ?? null,
                'access_token' => (string) ($data['access_token'] ?? ''),
                'refresh_token' => (string) ($data['refresh_token'] ?? ''),
                'token_type' => (string) ($data['token_type'] ?? 'bearer'),
                'scope' => (string) ($data['scope'] ?? ''),
                'expires_at' => isset($data['expires_in']) ? now()->addSeconds((int) $data['expires_in']) : null,
                'connected_by_user_id' => $userId,
                'connected_at' => now(),
                'last_error' => null,
            ],
        );
    }

    private function ensureOk(Response $response, string $context): void
    {
        if ($response->ok()) {
            return;
        }

        Log::error("ML {$context} failed", [
            'status' => $response->status(),
            'body' => $response->body(),
        ]);

        throw new RuntimeException(
            "ML {$context}: HTTP {$response->status()}: ".$this->extractError($response),
            $response->status() ?: 500,
        );
    }

    private function extractError(Response $response): string
    {
        $json = $response->json();
        return is_array($json)
            ? (string) ($json['error_description'] ?? $json['message'] ?? $json['error'] ?? $response->body())
            : $response->body();
    }
}
