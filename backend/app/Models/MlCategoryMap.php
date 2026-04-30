<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MlCategoryMap extends Model
{
    protected $table = 'ml_category_map';

    protected $fillable = [
        'agency_id', 'property_type', 'listing_type',
        'category_id', 'listing_type_id', 'label',
    ];

    /**
     * Resolves the ML category for an (agency, type, listing_type) combo.
     * Agency-specific override wins over the global default (agency_id NULL).
     * Intentionally does NOT use BelongsToAgency — we need access to the global rows.
     */
    public static function resolve(?int $agencyId, string $propertyType, string $listingType): ?self
    {
        $rows = static::where('property_type', $propertyType)
            ->where('listing_type', $listingType)
            ->where(function ($q) use ($agencyId) {
                $q->whereNull('agency_id');
                if ($agencyId) {
                    $q->orWhere('agency_id', $agencyId);
                }
            })
            ->get();

        return $rows->firstWhere('agency_id', $agencyId)
            ?? $rows->firstWhere('agency_id', null);
    }
}
