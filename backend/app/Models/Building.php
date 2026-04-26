<?php

namespace App\Models;

use App\Models\Concerns\BelongsToAgency;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Building extends Model
{
    use HasFactory, SoftDeletes, BelongsToAgency;

    protected $fillable = [
        'agency_id', 'name', 'address', 'city', 'postal_code',
        'province', 'country', 'year_built', 'total_units',
        'amenities', 'notes',
    ];

    protected $casts = [
        'amenities' => 'array',
        'year_built' => 'integer',
        'total_units' => 'integer',
    ];

    public function properties(): HasMany
    {
        return $this->hasMany(Property::class);
    }
}
