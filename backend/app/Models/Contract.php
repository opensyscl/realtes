<?php

namespace App\Models;

use App\Models\Concerns\BelongsToAgency;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class Contract extends Model implements HasMedia
{
    use HasFactory, SoftDeletes, BelongsToAgency, InteractsWithMedia;

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('documents');
    }

    public function registerMediaConversions(?Media $media = null): void
    {
        // No conversions
    }

    public const STATUS_DRAFT = 'borrador';
    public const STATUS_ACTIVE = 'vigente';
    public const STATUS_EXPIRED = 'vencido';
    public const STATUS_FINISHED = 'finalizado';
    public const STATUS_RENEWED = 'renovado';
    public const STATUS_CANCELLED = 'cancelado';

    protected $fillable = [
        'agency_id', 'code', 'property_id', 'owner_id', 'tenant_id', 'agent_user_id',
        'type', 'status', 'start_date', 'end_date',
        'monthly_rent', 'deposit', 'commission_pct', 'ipc_adjustment',
        'payment_day', 'signed_at', 'contract_pdf_url', 'notes',
        'alert_days_before', 'auto_renew',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'signed_at' => 'date',
        'monthly_rent' => 'decimal:2',
        'deposit' => 'decimal:2',
        'commission_pct' => 'decimal:2',
        'ipc_adjustment' => 'boolean',
        'alert_days_before' => 'integer',
        'auto_renew' => 'boolean',
    ];

    public function property(): BelongsTo
    {
        return $this->belongsTo(Property::class);
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(Person::class, 'owner_id');
    }

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Person::class, 'tenant_id');
    }

    public function agent(): BelongsTo
    {
        return $this->belongsTo(User::class, 'agent_user_id');
    }

    public function charges(): HasMany
    {
        return $this->hasMany(Charge::class);
    }

    public function commissionSplits(): HasMany
    {
        return $this->hasMany(CommissionSplit::class);
    }
}
