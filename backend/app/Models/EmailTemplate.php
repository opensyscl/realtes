<?php

namespace App\Models;

use App\Models\Concerns\BelongsToAgency;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class EmailTemplate extends Model
{
    use HasFactory, SoftDeletes, BelongsToAgency;

    protected $fillable = [
        'agency_id', 'code', 'name', 'subject', 'body',
        'audience', 'is_active', 'is_system',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'is_system' => 'boolean',
    ];

    public function logs(): HasMany
    {
        return $this->hasMany(EmailLog::class, 'template_id');
    }
}
