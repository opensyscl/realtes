<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Hub de Canales — tabla `channel_publications`.
 *
 * Estado de publicación de una propiedad en un canal concreto. Generaliza
 * `ml_publications`: antes una propiedad tenía una sola publicación (ML);
 * ahora tiene una fila por cada canal donde está publicada.
 *
 * `status` es el ciclo de vida genérico del Hub:
 *   draft | queued | syncing | published | paused | error | closed
 * `external_status` guarda el estado crudo que devuelve el portal (ej. ML:
 * active / under_review / paused), sin perder la traducción al ciclo genérico.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('channel_publications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('agency_id')->constrained()->cascadeOnDelete();
            $table->foreignId('channel_id')->constrained()->cascadeOnDelete();
            $table->foreignId('property_id')->constrained()->cascadeOnDelete();
            $table->string('external_id', 64)->nullable()->index();   // ml_item_id, ref del portal, etc.
            $table->string('external_url', 500)->nullable();
            $table->string('status', 16)->default('draft');
            $table->string('external_status', 40)->nullable();
            $table->string('category_external_id', 64)->nullable();
            $table->jsonb('payload_snapshot')->nullable();
            $table->jsonb('meta')->nullable();                        // datos propios del canal (ej. ML listing_type_id)
            $table->timestampTz('last_synced_at')->nullable();
            $table->timestampTz('published_at')->nullable();
            $table->text('last_error')->nullable();
            $table->timestampsTz();

            $table->unique(['property_id', 'channel_id']);
            $table->index(['agency_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('channel_publications');
    }
};
