<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('properties', function (Blueprint $table) {
            $table->string('condition', 20)->nullable()->after('built_sqm');
            $table->unsignedSmallInteger('suites_count')->nullable()->after('condition');
            $table->unsignedSmallInteger('service_rooms')->nullable()->after('suites_count');
            $table->unsignedSmallInteger('living_rooms')->nullable()->after('service_rooms');
            $table->unsignedSmallInteger('service_bathrooms')->nullable()->after('living_rooms');
            $table->string('floor_type', 30)->nullable()->after('service_bathrooms');
            $table->string('gas_type', 20)->nullable()->after('floor_type');
            $table->boolean('has_termopanel')->nullable()->after('gas_type');
            $table->string('hot_water_type', 20)->nullable()->after('has_termopanel');
            $table->string('heating_type', 30)->nullable()->after('hot_water_type');
            $table->string('kitchen_type', 20)->nullable()->after('heating_type');
            $table->string('window_type', 20)->nullable()->after('kitchen_type');
        });
    }

    public function down(): void
    {
        Schema::table('properties', function (Blueprint $table) {
            $table->dropColumn([
                'condition',
                'suites_count',
                'service_rooms',
                'living_rooms',
                'service_bathrooms',
                'floor_type',
                'gas_type',
                'has_termopanel',
                'hot_water_type',
                'heating_type',
                'kitchen_type',
                'window_type',
            ]);
        });
    }
};
