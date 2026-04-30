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
        'overage_per_property', 'overage_per_user',
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
        'overage_per_property' => 'decimal:2',
        'overage_per_user' => 'decimal:2',
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

    /**
     * Calcula el uso actual de una agency contra los límites de este plan.
     *
     * @return array{
     *   properties: array{used:int, limit:int, over:int, overage_amount:float},
     *   users: array{used:int, limit:int, over:int, overage_amount:float},
     *   leads: array{used:int, limit:int},
     *   total_overage: float,
     *   percent_used: int
     * }
     */
    public function checkUsage(Agency $agency): array
    {
        $propsUsed = $agency->properties()->count();
        $usersUsed = $agency->users()->where('active', true)->count();
        $leadsUsed = $agency->leads()->where('status', 'open')->count();

        $propLimit = (int) $this->limit('max_properties', 0);
        $userLimit = (int) $this->limit('max_users', 0);
        $leadLimit = (int) $this->limit('max_active_leads', 0);

        $propsOver = $propLimit > 0 ? max(0, $propsUsed - $propLimit) : 0;
        $usersOver = $userLimit > 0 ? max(0, $usersUsed - $userLimit) : 0;

        $propsOverageAmount = $propsOver * (float) $this->overage_per_property;
        $usersOverageAmount = $usersOver * (float) $this->overage_per_user;

        // % usado de propiedades (capeado al 100% para mostrar barra)
        $percentUsed = $propLimit > 0
            ? (int) min(100, round(($propsUsed / $propLimit) * 100))
            : 0;

        return [
            'properties' => [
                'used' => $propsUsed,
                'limit' => $propLimit,
                'over' => $propsOver,
                'overage_amount' => $propsOverageAmount,
            ],
            'users' => [
                'used' => $usersUsed,
                'limit' => $userLimit,
                'over' => $usersOver,
                'overage_amount' => $usersOverageAmount,
            ],
            'leads' => [
                'used' => $leadsUsed,
                'limit' => $leadLimit,
            ],
            'total_overage' => $propsOverageAmount + $usersOverageAmount,
            'percent_used' => $percentUsed,
        ];
    }
}
