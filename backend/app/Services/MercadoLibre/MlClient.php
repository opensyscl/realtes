<?php

namespace App\Services\MercadoLibre;

use App\Models\MlToken;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use RuntimeException;

/**
 * Wrapper sobre el HTTP client de Laravel que:
 *  - Auto-refresca el access_token cuando faltan <5 min para expirar
 *  - Serializa el refresh con Cache::lock para evitar tormenta de /oauth/token
 *  - Centraliza logging y formateo de errores
 */
class MlClient
{
    public function __construct(
        private readonly MlToken $token,
        private readonly MlOAuth $oauth,
        private readonly string $apiBase,
    ) {}

    public static function for(MlToken $token): self
    {
        return new self(
            $token,
            MlOAuth::fromConfig(),
            (string) config('services.mercadolibre.api_base', 'https://api.mercadolibre.com'),
        );
    }

    public function get(string $path, array $query = []): array
    {
        return $this->send('GET', $path, ['query' => $query]);
    }

    public function post(string $path, array $body = []): array
    {
        return $this->send('POST', $path, ['json' => $body]);
    }

    public function put(string $path, array $body = []): array
    {
        return $this->send('PUT', $path, ['json' => $body]);
    }

    public function delete(string $path): array
    {
        return $this->send('DELETE', $path, []);
    }

    private function send(string $method, string $path, array $opts): array
    {
        $token = $this->ensureFresh();

        $req = Http::withToken($token->access_token)
            ->acceptJson()
            ->timeout(30)
            ->retry(2, 250, throw: false);

        $url = str_starts_with($path, 'http') ? $path : $this->apiBase.$path;

        $response = match ($method) {
            'GET' => $req->get($url, $opts['query'] ?? []),
            'POST' => $req->post($url, $opts['json'] ?? []),
            'PUT' => $req->put($url, $opts['json'] ?? []),
            'DELETE' => $req->delete($url),
        };

        return $this->handle($response, $method, $url);
    }

    private function ensureFresh(): MlToken
    {
        if (! $this->token->isExpired()) {
            return $this->token;
        }

        return Cache::lock("ml:token-refresh:{$this->token->id}", 10)->block(5, function () {
            $fresh = $this->token->fresh();
            if (! $fresh->isExpired()) {
                return $fresh;
            }
            return $this->oauth->refresh($fresh);
        });
    }

    private function handle(Response $response, string $method, string $url): array
    {
        if ($response->successful()) {
            $json = $response->json();
            return is_array($json) ? $json : [];
        }

        Log::warning('ML API error', [
            'method' => $method,
            'url' => $url,
            'status' => $response->status(),
            'body' => $response->body(),
        ]);

        $json = $response->json();
        $msg = is_array($json)
            ? (string) ($json['message'] ?? $json['error'] ?? $response->body())
            : $response->body();

        throw new RuntimeException("ML {$method} {$url} → HTTP {$response->status()}: {$msg}", $response->status() ?: 500);
    }
}
