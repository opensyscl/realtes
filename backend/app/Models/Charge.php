<?php

namespace App\Models;

use App\Models\Concerns\BelongsToAgency;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Charge extends Model
{
    use HasFactory, SoftDeletes, BelongsToAgency;

    public const STATUS_PENDING = 'pendiente';
    public const STATUS_PARTIAL = 'parcial';
    public const STATUS_PAID = 'pagado';
    public const STATUS_OVERDUE = 'vencido';
    public const STATUS_VOID = 'anulado';

    protected $fillable = [
        'agency_id', 'contract_id', 'person_id', 'code',
        'concept', 'description', 'amount', 'paid_amount',
        'issued_at', 'due_date', 'paid_at', 'status',
        'recurring', 'late_fee', 'notes',
    ];

    protected $casts = [
        'issued_at' => 'date',
        'due_date' => 'date',
        'paid_at' => 'date',
        'amount' => 'decimal:2',
        'paid_amount' => 'decimal:2',
        'late_fee' => 'decimal:2',
        'recurring' => 'boolean',
    ];

    public function contract(): BelongsTo
    {
        return $this->belongsTo(Contract::class);
    }

    public function person(): BelongsTo
    {
        return $this->belongsTo(Person::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }
}
