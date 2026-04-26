<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // PostGIS habilitado en la imagen postgis/postgis, pero por seguridad:
        DB::statement('CREATE EXTENSION IF NOT EXISTS postgis');

        Schema::create('buildings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('agency_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('address');
            $table->string('city')->default('Valencia');
            $table->string('postal_code', 10)->nullable();
            $table->string('province')->default('Valencia');
            $table->string('country', 2)->default('ES');
            $table->unsignedSmallInteger('year_built')->nullable();
            $table->unsignedInteger('total_units')->default(0);
            $table->json('amenities')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('agency_id');
        });

        DB::statement('ALTER TABLE buildings ADD COLUMN location geometry(Point, 4326) NULL');
        DB::statement('CREATE INDEX buildings_location_gix ON buildings USING GIST (location)');
    }

    public function down(): void
    {
        Schema::dropIfExists('buildings');
    }
};
