<?php

namespace App\Models\Concerns;

use App\Models\Agency;
use App\Models\Scopes\AgencyScope;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

trait BelongsToAgency
{
    public static function bootBelongsToAgency(): void
    {
        static::addGlobalScope(new AgencyScope());

        static::creating(function ($model) {
            if (! $model->agency_id && auth()->check() && auth()->user()->agency_id) {
                $model->agency_id = auth()->user()->agency_id;
            }
        });
    }

    public function agency(): BelongsTo
    {
        return $this->belongsTo(Agency::class);
    }
}
