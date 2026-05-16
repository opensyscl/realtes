<?php

namespace App\Models;

use App\Models\Concerns\BelongsToAgency;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Estado de publicación de una propiedad en un canal. Generaliza `ml_publications`:
 * una propiedad tiene una fila por cada canal donde está (o estuvo) publicada.
 *
 * `status` es el ciclo de vida genérico del Hub; `external_status` conserva el
 * estado crudo del portal.
 */
class ChannelPublication extends Model
{
    use BelongsToAgency;

    public const STATUS_DRAFT = 'draft';
    public const STATUS_QUEUED = 'queued';
    public const STATUS_SYNCING = 'syncing';
    public const STATUS_PUBLISHED = 'published';
    public const STATUS_PAUSED = 'paused';
    public const STATUS_ERROR = 'error';
    public const STATUS_CLOSED = 'closed';

    protected $fillable = [
        'agency_id', 'channel_id', 'property_id',
        'external_id', 'external_url', 'status', 'external_status',
        'category_external_id', 'payload_snapshot', 'meta',
        'last_synced_at', 'published_at', 'last_error',
    ];

    protected $casts = [
        'payload_snapshot' => 'array',
        'meta' => 'array',
        'last_synced_at' => 'datetime',
        'published_at' => 'datetime',
    ];

    public function channel(): BelongsTo
    {
        return $this->belongsTo(Channel::class);
    }

    public function property(): BelongsTo
    {
        return $this->belongsTo(Property::class);
    }
}
