<?php

namespace App\Models;

use App\Models\Concerns\BelongsToAgency;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Conexión de una corredora con un canal del Hub. Generaliza `ml_tokens`.
 *
 * `credentials` (jsonb encriptado) guarda los secretos que cada canal necesita
 * — tokens OAuth, API keys —; `settings` guarda preferencias no sensibles.
 */
class AgencyChannel extends Model
{
    use BelongsToAgency;

    public const STATUS_DISCONNECTED = 'disconnected';
    public const STATUS_CONNECTED = 'connected';
    public const STATUS_ERROR = 'error';

    protected $fillable = [
        'agency_id', 'channel_id', 'status', 'credentials', 'settings',
        'external_account_id', 'connected_by_user_id',
        'connected_at', 'last_synced_at', 'last_error',
    ];

    protected $casts = [
        'credentials' => 'encrypted:array',
        'settings' => 'array',
        'connected_at' => 'datetime',
        'last_synced_at' => 'datetime',
    ];

    protected $hidden = ['credentials'];

    public function channel(): BelongsTo
    {
        return $this->belongsTo(Channel::class);
    }

    public function connectedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'connected_by_user_id');
    }

    public function isConnected(): bool
    {
        return $this->status === self::STATUS_CONNECTED;
    }
}
