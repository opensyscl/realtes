<?php

namespace App\Models;

use App\Models\Concerns\BelongsToAgency;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PropertyEvent extends Model
{
    use HasFactory, BelongsToAgency;

    protected $fillable = [
        'agency_id', 'property_id', 'user_id',
        'type', 'from_value', 'to_value', 'snapshot', 'occurred_at',
    ];

    protected $casts = [
        'snapshot' => 'array',
        'occurred_at' => 'datetime',
    ];

    public function property(): BelongsTo
    {
        return $this->belongsTo(Property::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
