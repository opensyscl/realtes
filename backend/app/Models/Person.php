<?php

namespace App\Models;

use App\Models\Concerns\BelongsToAgency;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Person extends Model
{
    use HasFactory, SoftDeletes, BelongsToAgency;

    protected $table = 'persons';

    public const TYPE_OWNER = 'owner';
    public const TYPE_TENANT = 'tenant';
    public const TYPE_BOTH = 'both';
    public const TYPE_PROSPECT = 'prospect';

    protected $fillable = [
        'agency_id', 'type', 'first_name', 'last_name', 'nif',
        'email', 'phone', 'phone_alt',
        'address', 'city', 'postal_code', 'country',
        'iban_last4', 'iban_encrypted', 'birthday', 'notes', 'tags',
    ];

    protected $casts = [
        'tags' => 'array',
        'birthday' => 'date',
    ];

    public function getFullNameAttribute(): string
    {
        return trim("{$this->first_name} {$this->last_name}");
    }

    public function ownedContracts(): HasMany
    {
        return $this->hasMany(Contract::class, 'owner_id');
    }

    public function rentedContracts(): HasMany
    {
        return $this->hasMany(Contract::class, 'tenant_id');
    }
}
