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
        // Categorías hoja del árbol Inmuebles MLC (las padre como MLC1459/1472 no permiten
        // listing_allowed). Cada listing_type incluye 'arriendo' (Chile) y 'alquiler' (España)
        // para soportar ambos vocabularios en el mismo schema.
        $rows = [
            // Departamentos
            ['apartamento', 'venta',    'MLC157522', 'Departamentos en venta'],
            ['apartamento', 'arriendo', 'MLC183186', 'Departamentos en arriendo'],
            ['apartamento', 'alquiler', 'MLC183186', 'Departamentos en alquiler'],
            // Casas
            ['casa',         'venta',    'MLC157520', 'Casas en venta'],
            ['casa',         'arriendo', 'MLC183184', 'Casas en arriendo'],
            ['casa',         'alquiler', 'MLC183184', 'Casas en alquiler'],
        ];
        DB::table('ml_category_map')->insert(array_map(fn ($r) => [
            'agency_id' => null,
            'property_type' => $r[0],
            'listing_type' => $r[1],
            'category_id' => $r[2],
            'listing_type_id' => 'gold_special',
            'label' => $r[3],
            'created_at' => $now,
            'updated_at' => $now,
        ], $rows));
    }

    public function down(): void
    {
        Schema::dropIfExists('ml_category_map');
    }
};
