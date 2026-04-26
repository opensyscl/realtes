<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('properties', function (Blueprint $table) {
            $table->unsignedSmallInteger('parking_spaces')->nullable()->after('area_sqm');
            $table->unsignedSmallInteger('year_built')->nullable()->after('parking_spaces');
            $table->string('orientation', 20)->nullable()->after('year_built');
            $table->unsignedSmallInteger('floors_count')->nullable()->after('orientation');
            $table->unsignedSmallInteger('units_per_floor')->nullable()->after('floors_count');
            $table->unsignedInteger('terrace_sqm')->nullable()->after('units_per_floor');
            $table->unsignedInteger('built_sqm')->nullable()->after('terrace_sqm');
        });
    }

    public function down(): void
    {
        Schema::table('properties', function (Blueprint $table) {
            $table->dropColumn([
                'parking_spaces',
                'year_built',
                'orientation',
                'floors_count',
                'units_per_floor',
                'terrace_sqm',
                'built_sqm',
            ]);
        });
    }
};
