<?php

namespace App\Services\Channels;

use App\Models\AgencyChannel;
use App\Models\Channel;
use App\Services\Channels\Contracts\ChannelDriver;
use App\Services\Channels\Drivers\MercadoLibreDriver;
use Illuminate\Contracts\Container\Container;
use RuntimeException;

/**
 * Punto de entrada del Hub de Canales.
 *
 * Resuelve el driver de cada canal y expone la conexión (agency_channel) de una
 * corredora. Sumar un canal nuevo = una entrada en $drivers + su clase Driver.
 */
class ChannelManager
{
    /** @var array<string, class-string<ChannelDriver>> */
    private array $drivers = [
        Channel::MERCADOLIBRE => MercadoLibreDriver::class,
    ];

    public function __construct(private readonly Container $container) {}

    public function hasDriver(string $slug): bool
    {
        return isset($this->drivers[$slug]);
    }

    public function driver(string $slug): ChannelDriver
    {
        if (! $this->hasDriver($slug)) {
            throw new RuntimeException("No hay driver implementado para el canal '{$slug}'.");
        }

        return $this->container->make($this->drivers[$slug]);
    }

    /** Conexión de una corredora con un canal, o null si no la conectó. */
    public function connection(int $agencyId, string $slug): ?AgencyChannel
    {
        $channel = Channel::where('slug', $slug)->first();
        if (! $channel) {
            return null;
        }

        return AgencyChannel::withoutGlobalScopes()
            ->where('agency_id', $agencyId)
            ->where('channel_id', $channel->id)
            ->first();
    }

    /** Slugs de los canales con driver implementado. */
    public function availableDrivers(): array
    {
        return array_keys($this->drivers);
    }
}
