<?php

namespace App\Models;

use App\Models\Concerns\BelongsToAgency;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MlToken extends Model
{
    use BelongsToAgency;

    protected $fillable = [
        'agency_id', 'ml_user_id',
        'access_token', 'refresh_token', 'token_type', 'scope',
        'expires_at', 'connected_by_user_id', 'connected_at',
        'last_refresh_at', 'last_error',
    ];

    protected $casts = [
        'access_token' => 'encrypted',
        'refresh_token' => 'encrypted',
        'expires_at' => 'datetime',
        'connected_at' => 'datetime',
        'last_refresh_at' => 'datetime',
    ];

    public function connectedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'connected_by_user_id');
    }

    public function isExpired(int $thresholdSeconds = 300): bool
    {
        if (! $this->expires_at) {
            return true;
        }
        return $this->expires_at->subSeconds($thresholdSeconds)->isPast();
    }
}
