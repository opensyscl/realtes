<?php

namespace App\Services\Channels\Drivers;

use App\Models\Agency;
use App\Models\AgencyChannel;
use App\Models\Channel;
use App\Models\ChannelPublication;
use App\Models\Property;
use App\Services\Channels\Contracts\ChannelDriver;

/**
 * Driver de Proppit para el Hub de Canales.
 *
 * Proppit es un agregador: en vez de una API por propiedad, expone un feed XML
 * (formato Trovit/Thribee) que Proppit consume y redistribuye a Trovit, Mitula,
 * iCasas, Nestoria, OLX y Properati. "Publicar" una propiedad = marcar su
 * channel_publication como `published`; el feed `/api/feeds/{slug}/proppit.xml`
 * incluye exactamente las propiedades publicadas.
 *
 * No hay llamada HTTP a un portal: el feed es pull (Proppit lo consume solo).
 */
class ProppitDriver implements ChannelDriver
{
    public function slug(): string
    {
        return Channel::PROPPIT;
    }

    public function publish(Property $property, AgencyChannel $connection, array $options = []): ChannelPublication
    {
        return $this->mark($property, $connection, ChannelPublication::STATUS_PUBLISHED);
    }

    public function update(Property $property, ChannelPublication $publication, AgencyChannel $connection): ChannelPublication
    {
        // El feed es dinámico — re-sincronizar solo refresca el timestamp.
        $publication->update(['last_synced_at' => now(), 'last_error' => null]);

        return $publication->fresh();
    }

    public function setStatus(Property $property, ChannelPublication $publication, AgencyChannel $connection, string $status): ChannelPublication
    {
        $publication->update(['status' => $status, 'last_synced_at' => now()]);

        return $publication->fresh();
    }

    public function unpublish(Property $property, ChannelPublication $publication, AgencyChannel $connection): void
    {
        $publication->update([
            'status' => ChannelPublication::STATUS_CLOSED,
            'last_synced_at' => now(),
        ]);
    }

    private function mark(Property $property, AgencyChannel $connection, string $status): ChannelPublication
    {
        $slug = Agency::whereKey($property->agency_id)->value('slug');
        $feedUrl = rtrim((string) config('app.url'), '/')."/api/feeds/{$slug}/proppit.xml";

        return ChannelPublication::updateOrCreate(
            ['property_id' => $property->id, 'channel_id' => $connection->channel_id],
            [
                'agency_id' => $property->agency_id,
                'status' => $status,
                'external_status' => 'feed',
                'external_url' => $feedUrl,
                'published_at' => now(),
                'last_synced_at' => now(),
                'last_error' => null,
            ],
        );
    }
}
