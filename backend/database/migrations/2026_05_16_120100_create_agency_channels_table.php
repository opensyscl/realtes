<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Hub de Canales — tabla `agency_channels`.
 *
 * Una conexión por corredora × canal. Generaliza `ml_tokens`: en vez de una
 * tabla por integración, cada canal guarda lo suyo en los jsonb:
 *  - `credentials` (encriptado): tokens OAuth, API keys, secretos del portal.
 *  - `settings`: preferencias no sensibles (ej. ML default_listing_type).
 *
 * El modelo de negocio es el universal de la industria: cada corredora tiene su
 * cuenta paga en cada portal; el SaaS guarda sus credenciales y delega.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('agency_channels', function (Blueprint $table) {
            $table->id();
            $table->foreignId('agency_id')->constrained()->cascadeOnDelete();
            $table->foreignId('channel_id')->constrained()->cascadeOnDelete();
            $table->string('status', 16)->default('disconnected'); // disconnected | connected | error
            $table->text('credentials')->nullable();               // cast encrypted:array
            $table->jsonb('settings')->nullable();
            $table->string('external_account_id', 64)->nullable(); // ej. ml_user_id
            $table->foreignId('connected_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestampTz('connected_at')->nullable();
            $table->timestampTz('last_synced_at')->nullable();
            $table->text('last_error')->nullable();
            $table->timestampsTz();

            $table->unique(['agency_id', 'channel_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('agency_channels');
    }
};
