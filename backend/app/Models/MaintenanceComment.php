<?php

namespace App\Models;

use App\Models\Concerns\BelongsToAgency;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MaintenanceComment extends Model
{
    use HasFactory, BelongsToAgency;

    protected $fillable = [
        'agency_id', 'ticket_id', 'user_id',
        'type', 'body', 'payload',
    ];

    protected $casts = [
        'payload' => 'array',
    ];

    public function ticket(): BelongsTo
    {
        return $this->belongsTo(MaintenanceTicket::class, 'ticket_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
