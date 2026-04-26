<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('properties', function (Blueprint $table) {
            $table->id();
            $table->foreignId('agency_id')->constrained()->cascadeOnDelete();
            $table->foreignId('building_id')->nullable()->constrained()->nullOnDelete();
            $table->string('code')->index();
            $table->string('title');
            $table->string('type'); // apartamento, casa, oficina, local, parking, trastero, chalet
            $table->string('status')->default('disponible'); // disponible, ocupada, mantenimiento, fuera_mercado
            $table->string('listing_type')->default('alquiler'); // alquiler, venta, ambos

            $table->unsignedSmallInteger('bedrooms')->default(0);
            $table->decimal('bathrooms', 3, 1)->default(0);
            $table->unsignedInteger('area_sqm')->nullable();
            $table->string('floor')->nullable();
            $table->string('door')->nullable();

            $table->string('address');
            $table->string('postal_code', 10)->nullable();
            $table->string('city')->default('Valencia');
            $table->string('province')->default('Valencia');
            $table->string('country', 2)->default('ES');

            $table->decimal('price_rent', 10, 2)->nullable();
            $table->decimal('price_sale', 12, 2)->nullable();
            $table->decimal('community_fee', 8, 2)->nullable();
            $table->decimal('ibi_annual', 8, 2)->nullable();

            $table->text('description')->nullable();
            $table->json('features')->nullable();
            $table->json('tags')->nullable();
            $table->string('cover_image_url')->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->unique(['agency_id', 'code']);
            $table->index(['agency_id', 'status']);
            $table->index(['agency_id', 'listing_type']);
            $table->index('type');
        });

        DB::statement('ALTER TABLE properties ADD COLUMN location geometry(Point, 4326) NULL');
        DB::statement('CREATE INDEX properties_location_gix ON properties USING GIST (location)');
    }

    public function down(): void
    {
        Schema::dropIfExists('properties');
    }
};
