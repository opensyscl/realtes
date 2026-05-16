<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Catálogo global de canales de publicación del Hub. No es por tenant.
 */
class Channel extends Model
{
    public const MERCADOLIBRE = 'mercadolibre';
    public const PROPPIT = 'proppit';
    public const TOCTOC = 'toctoc';
    public const YAPO = 'yapo';

    public const KIND_API = 'api';
    public const KIND_AGGREGATOR = 'aggregator';
    public const KIND_FEED = 'feed';

    protected $fillable = [
        'slug', 'name', 'kind', 'description',
        'supports_oauth', 'is_active', 'sort_order', 'meta',
    ];

    protected $casts = [
        'supports_oauth' => 'boolean',
        'is_active' => 'boolean',
        'sort_order' => 'integer',
        'meta' => 'array',
    ];

    /** El binding de rutas resuelve canales por slug, no por id. */
    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    public function agencyChannels(): HasMany
    {
        return $this->hasMany(AgencyChannel::class);
    }

    public function publications(): HasMany
    {
        return $this->hasMany(ChannelPublication::class);
    }
}
