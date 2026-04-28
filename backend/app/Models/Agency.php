<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Agency extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name', 'slug', 'email', 'phone', 'address', 'city', 'country',
        'logo_url', 'plan', 'trial_ends_at', 'active',
        'current_plan_code', 'subscription_status',
        'subscription_started_at', 'current_period_end',
        'cancelled_at', 'billing_cycle',
        'onboarding_completed_at',
        'public_template_preset', 'public_template_config',
        'public_primary_color', 'public_font',
        'currency', 'locale',
        'watermark_image_url', 'watermark_settings',
        'qr_logo_url', 'qr_color_main', 'qr_color_bg',
    ];

    protected $casts = [
        'active' => 'boolean',
        'trial_ends_at' => 'datetime',
        'subscription_started_at' => 'datetime',
        'current_period_end' => 'datetime',
        'cancelled_at' => 'datetime',
        'onboarding_completed_at' => 'datetime',
        'public_template_config' => 'array',
        'watermark_settings' => 'array',
    ];

    public const WATERMARK_DEFAULT_SETTINGS = [
        'enabled' => false,
        'apply_to_cover' => true,
        'apply_to_gallery' => true,
        'apply_to_floors' => false,
        'manual_apply_enabled' => true,
        'alignment' => 'bottom_right', // top_left, top, top_right, left, center, right, bottom_left, bottom, bottom_right
        'offset_x' => 0,
        'offset_y' => 0,
        'offset_unit' => 'px', // px | percent
        'type' => 'image', // image | text
        'text' => '',
        'text_color' => '#ffffff',
        'size_mode' => 'scaled', // original | custom | scaled
        'size_value' => 30, // 0-100
        'opacity' => 70, // 0-100
        'quality' => 90, // 0-100
        'format' => 'baseline', // baseline | progressive
    ];

    public function watermarkSettings(): array
    {
        return array_merge(self::WATERMARK_DEFAULT_SETTINGS, $this->watermark_settings ?? []);
    }

    public const TEMPLATE_PRESETS = ['modern_loft', 'minimal_pro', 'classic'];

    public const TEMPLATE_DEFAULT_CONFIG = [
        'hero_style' => 'fullbleed',          // fullbleed | sidebar
        'gallery_style' => 'grid',            // grid | slider | masonry
        'show_features' => true,
        'show_amenities_grid' => true,
        'show_map' => false,
        'show_agent' => true,
        'show_mortgage_calc' => false,
        'show_similar' => true,
        'show_tour' => true,
    ];

    public function publicTemplateConfig(): array
    {
        return array_merge(self::TEMPLATE_DEFAULT_CONFIG, $this->public_template_config ?? []);
    }

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public function properties(): HasMany
    {
        return $this->hasMany(Property::class);
    }

    public function persons(): HasMany
    {
        return $this->hasMany(Person::class);
    }

    public function contracts(): HasMany
    {
        return $this->hasMany(Contract::class);
    }

    public function getRouteKeyName(): string
    {
        return 'slug';
    }
}
