<?php

namespace App\Models;

use App\Models\Concerns\BelongsToAgency;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Lead extends Model
{
    use HasFactory, SoftDeletes, BelongsToAgency;

    public const STATUS_OPEN = 'open';
    public const STATUS_WON = 'won';
    public const STATUS_LOST = 'lost';

    protected $fillable = [
        'agency_id', 'pipeline_id', 'stage_id', 'person_id', 'property_id',
        'assigned_user_id', 'converted_contract_id',
        'code', 'title', 'contact_name', 'contact_email', 'contact_phone',
        'source', 'value', 'probability_pct', 'requirements', 'notes',
        'expected_close_date', 'last_activity_at', 'status', 'lost_reason', 'position',
    ];

    protected $casts = [
        'requirements' => 'array',
        'value' => 'decimal:2',
        'last_activity_at' => 'datetime',
        'expected_close_date' => 'date',
    ];

    public function pipeline(): BelongsTo
    {
        return $this->belongsTo(Pipeline::class);
    }

    public function stage(): BelongsTo
    {
        return $this->belongsTo(Stage::class);
    }

    public function person(): BelongsTo
    {
        return $this->belongsTo(Person::class);
    }

    public function property(): BelongsTo
    {
        return $this->belongsTo(Property::class);
    }

    public function assignedTo(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_user_id');
    }

    public function activities(): HasMany
    {
        return $this->hasMany(LeadActivity::class)->orderByDesc('occurred_at');
    }

    public function convertedContract(): BelongsTo
    {
        return $this->belongsTo(Contract::class, 'converted_contract_id');
    }
}
