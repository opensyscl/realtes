<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('alliances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('agency_id')->constrained()->cascadeOnDelete();

            // Empresa
            $table->string('name', 160);
            $table->string('logo_url', 500)->nullable();
            $table->string('description', 500)->nullable();

            // Beneficio
            $table->string('benefit_title', 160)->nullable();
            $table->string('benefit_image_url', 500)->nullable();
            $table->text('benefit_detail')->nullable();

            // Contacto
            $table->string('phone', 30)->nullable();
            $table->string('whatsapp', 30)->nullable();
            $table->string('instagram', 80)->nullable();
            $table->string('website_url', 500)->nullable();

            // Estado / orden
            $table->boolean('is_published')->default(true);
            $table->unsignedSmallInteger('sort_order')->default(0);

            $table->timestamps();
            $table->softDeletes();

            $table->index(['agency_id', 'is_published', 'sort_order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('alliances');
    }
};
