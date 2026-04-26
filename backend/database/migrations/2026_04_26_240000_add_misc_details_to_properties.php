<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('properties', function (Blueprint $table) {
            $table->unsignedSmallInteger('rooms_count')->nullable()->after('requires_guarantor');
            $table->unsignedInteger('parking_sqm')->nullable()->after('rooms_count');
            $table->unsignedSmallInteger('storage_count')->nullable()->after('parking_sqm');
            $table->string('apartment_subtype', 30)->nullable()->after('storage_count');
            $table->unsignedSmallInteger('max_occupants')->nullable()->after('apartment_subtype');
        });
    }

    public function down(): void
    {
        Schema::table('properties', function (Blueprint $table) {
            $table->dropColumn([
                'rooms_count',
                'parking_sqm',
                'storage_count',
                'apartment_subtype',
                'max_occupants',
            ]);
        });
    }
};
