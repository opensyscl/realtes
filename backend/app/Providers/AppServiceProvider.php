<?php

namespace App\Providers;

use App\Services\MercadoLibre\MlOAuth;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        // MlOAuth requiere strings primitivos en su constructor; el container no
        // puede auto-resolverlos. Lo bindeamos via la fábrica fromConfig().
        $this->app->singleton(MlOAuth::class, fn () => MlOAuth::fromConfig());
    }

    public function boot(): void
    {
        // Rate limiter para el formulario de contacto del escaparate público:
        // por IP (no global) — 5 envíos por minuto y 30 por hora bastan para
        // prevenir spam sin bloquear visitantes legítimos.
        RateLimiter::for('public-leads', function (Request $request) {
            return [
                Limit::perMinute(5)->by($request->ip()),
                Limit::perHour(30)->by($request->ip()),
            ];
        });
    }
}
