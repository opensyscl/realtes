<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('properties', function (Blueprint $table) {
            // Cliente asignado a la propiedad (interesado, reservado, futuro arrendatario).
            // Diferente del `tenant_id` del contrato vigente (que se auto-llena al firmar).
            $table->foreignId('client_person_id')->nullable()->constrained('persons')->nullOnDelete();
            $table->index('client_person_id');
        });
    }

    public function down(): void
    {
        Schema::table('properties', function (Blueprint $table) {
            $table->dropConstrainedForeignId('client_person_id');
        });
    }
};
