<?php

namespace App\Models;

use App\Models\Concerns\BelongsToAgency;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

class PropertyInspection extends Model implements HasMedia
{
    use HasFactory, SoftDeletes, BelongsToAgency, InteractsWithMedia;

    protected $fillable = [
        'agency_id',
        'property_id',
        'contract_id',
        'created_by_user_id',
        'type',
        'title',
        'description',
        'inspection_date',
        'inspector_name',
        'condition',
        'signed_by_tenant',
        'tenant_signed_at',
        'signed_by_landlord',
        'landlord_signed_at',
    ];

    protected $casts = [
        'inspection_date' => 'date',
        'signed_by_tenant' => 'boolean',
        'signed_by_landlord' => 'boolean',
        'tenant_signed_at' => 'datetime',
        'landlord_signed_at' => 'datetime',
    ];

    public function registerMediaCollections(): void
    {
        // Galería de fotos del estado del inmueble
        $this->addMediaCollection('photos');
    }

    public function property(): BelongsTo
    {
        return $this->belongsTo(Property::class);
    }

    public function contract(): BelongsTo
    {
        return $this->belongsTo(Contract::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by_user_id');
    }
}
