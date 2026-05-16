<?php

namespace App\Services\Channels\Contracts;

use App\Models\AgencyChannel;
use App\Models\ChannelPublication;
use App\Models\Property;

/**
 * Contrato que implementa cada canal del Hub.
 *
 * Un driver traduce las operaciones genéricas de publicación a la API o feed
 * concreto del portal, y devuelve siempre una ChannelPublication con el estado
 * normalizado al ciclo de vida del Hub.
 */
interface ChannelDriver
{
    /** Slug del canal en la tabla `channels`. */
    public function slug(): string;

    /** Publica la propiedad por primera vez en el canal. */
    public function publish(Property $property, AgencyChannel $connection, array $options = []): ChannelPublication;

    /** Re-sincroniza una publicación existente con los datos actuales de la propiedad. */
    public function update(Property $property, ChannelPublication $publication, AgencyChannel $connection): ChannelPublication;

    /** Cambia el estado de la publicación: published | paused | closed. */
    public function setStatus(Property $property, ChannelPublication $publication, AgencyChannel $connection, string $status): ChannelPublication;

    /** Baja la publicación del canal. */
    public function unpublish(Property $property, ChannelPublication $publication, AgencyChannel $connection): void;
}
