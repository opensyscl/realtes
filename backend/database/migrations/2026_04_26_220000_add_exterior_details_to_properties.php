<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('properties', function (Blueprint $table) {
            $table->unsignedSmallInteger('elevators_count')->nullable()->after('window_type');
            $table->unsignedSmallInteger('covered_parking_spaces')->nullable()->after('elevators_count');
            $table->unsignedSmallInteger('uncovered_parking_spaces')->nullable()->after('covered_parking_spaces');
        });
    }

    public function down(): void
    {
        Schema::table('properties', function (Blueprint $table) {
            $table->dropColumn([
                'elevators_count',
                'covered_parking_spaces',
                'uncovered_parking_spaces',
            ]);
        });
    }
};
