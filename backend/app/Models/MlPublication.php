<?php

namespace App\Models;

use App\Models\Concerns\BelongsToAgency;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MlPublication extends Model
{
    use BelongsToAgency;

    public const STATUS_ACTIVE = 'active';
    public const STATUS_PAUSED = 'paused';
    public const STATUS_CLOSED = 'closed';
    public const STATUS_UNDER_REVIEW = 'under_review';

    protected $fillable = [
        'agency_id', 'property_id', 'ml_item_id', 'ml_permalink',
        'ml_status', 'ml_category_id', 'listing_type_id',
        'payload_snapshot', 'last_synced_at', 'published_at', 'last_error',
    ];

    protected $casts = [
        'payload_snapshot' => 'array',
        'last_synced_at' => 'datetime',
        'published_at' => 'datetime',
    ];

    public function property(): BelongsTo
    {
        return $this->belongsTo(Property::class);
    }
}
