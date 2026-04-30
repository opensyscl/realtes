<?php

namespace App\Models;

use App\Models\Concerns\BelongsToAgency;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class Property extends Model implements HasMedia
{
    use HasFactory, SoftDeletes, BelongsToAgency, InteractsWithMedia;

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('photos');
        $this->addMediaCollection('documents');
    }

    public function registerMediaConversions(?Media $media = null): void
    {
        // No conversions for now (no GD/Imagick optimizations needed)
    }

    public const STATUS_AVAILABLE = 'disponible';
    public const STATUS_RENTED = 'arrendada';
    public const STATUS_SOLD = 'vendida';
    public const STATUS_RESERVED = 'reservada';
    public const STATUS_MAINTENANCE = 'mantenimiento';

    public const STATUSES = [
        self::STATUS_AVAILABLE,
        self::STATUS_RENTED,
        self::STATUS_SOLD,
        self::STATUS_RESERVED,
        self::STATUS_MAINTENANCE,
    ];

    protected $fillable = [
        'agency_id', 'building_id', 'code', 'title', 'type', 'status',
        'listing_type', 'is_published', 'published_at',
        'is_shared', 'share_pct', 'shared_at',
        'bedrooms', 'bathrooms', 'area_sqm', 'floor', 'door',
        'parking_spaces', 'year_built', 'orientation',
        'floors_count', 'units_per_floor', 'terrace_sqm', 'built_sqm',
        // Interior
        'condition', 'suites_count', 'service_rooms', 'living_rooms',
        'service_bathrooms', 'floor_type', 'gas_type', 'has_termopanel',
        'hot_water_type', 'heating_type', 'kitchen_type', 'window_type',
        // Exterior
        'elevators_count', 'covered_parking_spaces', 'uncovered_parking_spaces',
        // Deudas y adquisición
        'acquisition_year', 'acquisition_method', 'bank_debt',
        'debt_institution', 'requires_guarantor',
        // Otros
        'rooms_count', 'parking_sqm', 'storage_count',
        'apartment_subtype', 'max_occupants',
        'address', 'postal_code', 'city', 'province', 'country',
        'price_rent', 'price_sale', 'community_fee', 'ibi_annual',
        'description', 'features', 'tags', 'cover_image_url',
        'tour_url', 'video_url',
        'view_count', 'last_viewed_at',
        // Captación + identificación fiscal + asignaciones internas
        'currency', 'captacion_date', 'captacion_source',
        'is_exclusive', 'commission_pct', 'rol',
        'owner_person_id', 'agent_user_id', 'client_person_id',
        'private_note', 'inventory_notes', 'reception_notes',
        'booking_enabled', 'booking_provider', 'booking_url',
    ];

    protected $casts = [
        'features' => 'array',
        'tags' => 'array',
        'bedrooms' => 'integer',
        'bathrooms' => 'decimal:1',
        'area_sqm' => 'integer',
        'parking_spaces' => 'integer',
        'year_built' => 'integer',
        'floors_count' => 'integer',
        'units_per_floor' => 'integer',
        'terrace_sqm' => 'integer',
        'built_sqm' => 'integer',
        'suites_count' => 'integer',
        'service_rooms' => 'integer',
        'living_rooms' => 'integer',
        'service_bathrooms' => 'integer',
        'has_termopanel' => 'boolean',
        'elevators_count' => 'integer',
        'covered_parking_spaces' => 'integer',
        'uncovered_parking_spaces' => 'integer',
        'acquisition_year' => 'integer',
        'bank_debt' => 'decimal:2',
        'requires_guarantor' => 'boolean',
        'rooms_count' => 'integer',
        'parking_sqm' => 'integer',
        'storage_count' => 'integer',
        'max_occupants' => 'integer',
        'price_rent' => 'decimal:2',
        'price_sale' => 'decimal:2',
        'community_fee' => 'decimal:2',
        'ibi_annual' => 'decimal:2',
        'is_published' => 'boolean',
        'published_at' => 'datetime',
        'is_shared' => 'boolean',
        'share_pct' => 'decimal:2',
        'shared_at' => 'datetime',
        'view_count' => 'integer',
        'last_viewed_at' => 'datetime',
        'captacion_date' => 'date',
        'is_exclusive' => 'boolean',
        'commission_pct' => 'decimal:2',
        'booking_enabled' => 'boolean',
    ];

    public function owner(): BelongsTo
    {
        return $this->belongsTo(Person::class, 'owner_person_id');
    }

    public function agent(): BelongsTo
    {
        return $this->belongsTo(User::class, 'agent_user_id');
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(Person::class, 'client_person_id');
    }

    public function leads(): HasMany
    {
        return $this->hasMany(Lead::class);
    }

    public function building(): BelongsTo
    {
        return $this->belongsTo(Building::class);
    }

    public function contracts(): HasMany
    {
        return $this->hasMany(Contract::class);
    }

    public function activeContract()
    {
        return $this->hasOne(Contract::class)->where('status', 'vigente');
    }

    public function mlPublication(): HasOne
    {
        return $this->hasOne(MlPublication::class);
    }
}
