<?php

namespace App\Models;

use App\Models\Concerns\BelongsToAgency;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class CommissionSplit extends Model
{
    use HasFactory, SoftDeletes, BelongsToAgency;

    public const ROLE_LISTING = 'captador';
    public const ROLE_SELLING = 'vendedor';
    public const ROLE_BROKER = 'broker';
    public const ROLE_OTHER = 'otros';

    public const STATUS_PENDING = 'pending';
    public const STATUS_PAID = 'paid';
    public const STATUS_CANCELLED = 'cancelled';

    protected $fillable = [
        'agency_id', 'contract_id', 'user_id',
        'role', 'pct', 'amount', 'status',
        'paid_at', 'payment_reference', 'notes',
    ];

    protected $casts = [
        'pct' => 'decimal:2',
        'amount' => 'decimal:2',
        'paid_at' => 'date',
    ];

    public function contract(): BelongsTo
    {
        return $this->belongsTo(Contract::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Comisión total del contrato = monthly_rent * 12 meses * commission_pct / 100.
     * Convención de mercado: la inmobiliaria cobra 1 mensualidad o un % del primer año.
     * Aquí asumimos que `commission_pct` es el % anual sobre la renta total del año 1.
     */
    public static function calculateTotalForContract(Contract $contract): float
    {
        $base = (float) $contract->monthly_rent * 12;

        return round($base * (float) $contract->commission_pct / 100, 2);
    }
}
