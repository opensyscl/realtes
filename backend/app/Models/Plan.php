<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Plan extends Model
{
    use HasFactory;

    protected $fillable = [
        'code', 'name', 'tagline',
        'price_monthly', 'price_yearly',
        'limits', 'features',
        'is_recommended', 'position', 'active',
    ];

    protected $casts = [
        'limits' => 'array',
        'features' => 'array',
        'is_recommended' => 'boolean',
        'active' => 'boolean',
        'price_monthly' => 'decimal:2',
        'price_yearly' => 'decimal:2',
    ];

    public function limit(string $key, $default = null)
    {
        return $this->limits[$key] ?? $default;
    }

    public function hasFeature(string $code): bool
    {
        foreach ($this->features ?? [] as $f) {
            if (($f['code'] ?? null) === $code) {
                return (bool) ($f['included'] ?? false);
            }
        }
        return false;
    }
}
