<?php

namespace App\Models;

use App\Models\Concerns\BelongsToAgency;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class MaintenanceTicket extends Model
{
    use HasFactory, SoftDeletes, BelongsToAgency;

    public const STATUS_OPEN = 'abierto';
    public const STATUS_IN_PROGRESS = 'en_progreso';
    public const STATUS_WAITING = 'esperando_proveedor';
    public const STATUS_RESOLVED = 'resuelto';
    public const STATUS_CLOSED = 'cerrado';
    public const STATUS_CANCELLED = 'cancelado';

    protected $fillable = [
        'agency_id', 'code', 'property_id', 'contract_id',
        'reported_by', 'assigned_user_id',
        'title', 'description', 'category', 'priority', 'status',
        'estimated_cost', 'actual_cost', 'vendor', 'vendor_notes',
        'opened_at', 'resolved_at', 'scheduled_for',
    ];

    protected $casts = [
        'opened_at' => 'datetime',
        'resolved_at' => 'datetime',
        'scheduled_for' => 'date',
        'estimated_cost' => 'decimal:2',
        'actual_cost' => 'decimal:2',
    ];

    public function property(): BelongsTo
    {
        return $this->belongsTo(Property::class);
    }

    public function contract(): BelongsTo
    {
        return $this->belongsTo(Contract::class);
    }

    public function reporter(): BelongsTo
    {
        return $this->belongsTo(Person::class, 'reported_by');
    }

    public function assignedTo(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_user_id');
    }

    public function comments(): HasMany
    {
        return $this->hasMany(MaintenanceComment::class, 'ticket_id')->latest();
    }
}
