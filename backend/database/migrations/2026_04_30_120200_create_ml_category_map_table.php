<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ml_category_map', function (Blueprint $table) {
            $table->id();
            $table->foreignId('agency_id')->nullable()->constrained()->cascadeOnDelete();
            $table->string('property_type', 50);
            $table->string('listing_type', 30);
            $table->string('category_id', 32);
            $table->string('listing_type_id', 32)->default('gold_special');
            $table->string('label')->nullable();
            $table->timestampsTz();

            $table->unique(['agency_id', 'property_type', 'listing_type'], 'ml_category_map_unique');
        });

        $now = now();
        DB::table('ml_category_map')->insert([
            ['agency_id' => null, 'property_type' => 'apartamento', 'listing_type' => 'venta',    'category_id' => 'MLC1459', 'listing_type_id' => 'gold_special', 'label' => 'Departamentos en venta',    'created_at' => $now, 'updated_at' => $now],
            ['agency_id' => null, 'property_type' => 'casa',         'listing_type' => 'venta',    'category_id' => 'MLC1574', 'listing_type_id' => 'gold_special', 'label' => 'Casas en venta',            'created_at' => $now, 'updated_at' => $now],
            ['agency_id' => null, 'property_type' => 'apartamento', 'listing_type' => 'arriendo', 'category_id' => 'MLC1500', 'listing_type_id' => 'gold_special', 'label' => 'Departamentos en arriendo', 'created_at' => $now, 'updated_at' => $now],
            ['agency_id' => null, 'property_type' => 'casa',         'listing_type' => 'arriendo', 'category_id' => 'MLC1500', 'listing_type_id' => 'gold_special', 'label' => 'Casas en arriendo',         'created_at' => $now, 'updated_at' => $now],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('ml_category_map');
    }
};
