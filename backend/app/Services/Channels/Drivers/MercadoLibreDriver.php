<?php

namespace App\Services\Channels\Drivers;

use App\Models\AgencyChannel;
use App\Models\Channel;
use App\Models\ChannelPublication;
use App\Models\MlPublication;
use App\Models\Property;
use App\Services\Channels\Contracts\ChannelDriver;
use App\Services\MercadoLibre\MlPropertyPublisher;

/**
 * Driver de Mercado Libre para el Hub de Canales.
 *
 * Hito 1: delega en MlPropertyPublisher —que sigue siendo la fuente de verdad
 * de la integración ML sobre ml_tokens/ml_publications— y espeja el resultado
 * en channel_publications. Así el Hub queda poblado y consultable sin tocar el
 * flujo ML ya probado. El corte completo (ML leyendo de agency_channels) es un
 * paso posterior.
 */
class MercadoLibreDriver implements ChannelDriver
{
    public function __construct(private readonly MlPropertyPublisher $publisher) {}

    public function slug(): string
    {
        return Channel::MERCADOLIBRE;
    }

    public function publish(Property $property, AgencyChannel $connection, array $options = []): ChannelPublication
    {
        $ml = $this->publisher->publish($property, $options['listing_type_id'] ?? null);

        return $this->sync($property, $connection, $ml);
    }

    public function update(Property $property, ChannelPublication $publication, AgencyChannel $connection): ChannelPublication
    {
        $ml = $this->publisher->update($property);

        return $this->sync($property, $connection, $ml);
    }

    public function setStatus(Property $property, ChannelPublication $publication, AgencyChannel $connection, string $status): ChannelPublication
    {
        $ml = $this->publisher->setStatus($property, $this->toMlStatus($status));

        return $this->sync($property, $connection, $ml);
    }

    public function unpublish(Property $property, ChannelPublication $publication, AgencyChannel $connection): void
    {
        $this->publisher->delete($property);

        $publication->update([
            'status' => ChannelPublication::STATUS_CLOSED,
            'external_status' => 'closed',
            'last_synced_at' => now(),
        ]);
    }

    /** Espeja una MlPublication en la channel_publication equivalente. */
    private function sync(Property $property, AgencyChannel $connection, MlPublication $ml): ChannelPublication
    {
        return ChannelPublication::updateOrCreate(
            ['property_id' => $property->id, 'channel_id' => $connection->channel_id],
            [
                'agency_id' => $property->agency_id,
                'external_id' => $ml->ml_item_id ?: null,
                'external_url' => $ml->ml_permalink,
                'status' => $this->toHubStatus($ml),
                'external_status' => $ml->ml_status,
                'category_external_id' => $ml->ml_category_id,
                'payload_snapshot' => $ml->payload_snapshot,
                'meta' => ['listing_type_id' => $ml->listing_type_id],
                'last_synced_at' => $ml->last_synced_at,
                'published_at' => $ml->published_at,
                'last_error' => $ml->last_error,
            ],
        );
    }

    private function toHubStatus(MlPublication $ml): string
    {
        if ($ml->last_error) {
            return ChannelPublication::STATUS_ERROR;
        }

        return match ($ml->ml_status) {
            'active' => ChannelPublication::STATUS_PUBLISHED,
            'paused' => ChannelPublication::STATUS_PAUSED,
            'closed' => ChannelPublication::STATUS_CLOSED,
            'under_review' => ChannelPublication::STATUS_SYNCING,
            default => ChannelPublication::STATUS_DRAFT,
        };
    }

    private function toMlStatus(string $hubStatus): string
    {
        return match ($hubStatus) {
            ChannelPublication::STATUS_PUBLISHED => 'active',
            ChannelPublication::STATUS_PAUSED => 'paused',
            ChannelPublication::STATUS_CLOSED => 'closed',
            default => $hubStatus,
        };
    }
}
