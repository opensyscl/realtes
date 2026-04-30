<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Per-agency settings de publicación en ML:
 *  - default_listing_type: 'auto' (mejor gratis) | 'free' | 'silver' | 'gold' | 'gold_premium'
 *  - confirm_before_charge: si TRUE, exige confirmación cuando publicar implica fee > 0
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('ml_tokens', function (Blueprint $table) {
            $table->string('default_listing_type', 32)->default('auto')->after('scope');
            $table->boolean('confirm_before_charge')->default(true)->after('default_listing_type');
        });
    }

    public function down(): void
    {
        Schema::table('ml_tokens', function (Blueprint $table) {
            $table->dropColumn(['default_listing_type', 'confirm_before_charge']);
        });
    }
};
