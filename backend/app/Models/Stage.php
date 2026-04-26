<?php

namespace App\Models;

use App\Models\Concerns\BelongsToAgency;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Stage extends Model
{
    use HasFactory, BelongsToAgency;

    protected $fillable = [
        'agency_id', 'pipeline_id', 'name', 'color',
        'position', 'probability_pct', 'is_won', 'is_lost',
    ];

    protected $casts = [
        'is_won' => 'boolean',
        'is_lost' => 'boolean',
    ];

    public function pipeline(): BelongsTo
    {
        return $this->belongsTo(Pipeline::class);
    }

    public function leads(): HasMany
    {
        return $this->hasMany(Lead::class)->orderBy('position');
    }
}
