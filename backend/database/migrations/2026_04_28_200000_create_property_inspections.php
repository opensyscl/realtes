<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('property_inspections', function (Blueprint $table) {
            $table->id();
            $table->foreignId('agency_id')->constrained()->cascadeOnDelete();
            $table->foreignId('property_id')->constrained()->cascadeOnDelete();
            $table->foreignId('contract_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('created_by_user_id')->nullable()->constrained('users')->nullOnDelete();

            // Tipo de acta — afecta el icono y el badge en la UI
            $table->string('type', 32)->default('inspeccion');
            // entrega         → cuando entregamos al arrendatario (estado inicial)
            // inspeccion      → revisión periódica durante el arriendo
            // devolucion      → cuando el arrendatario devuelve el inmueble
            // reparacion      → daños / reparaciones
            // otro

            $table->string('title');
            $table->text('description')->nullable();
            $table->date('inspection_date');

            // Quién hizo la inspección (texto libre — no siempre es un user del sistema)
            $table->string('inspector_name')->nullable();

            // Estado del inmueble según el inspector — útil para reportes
            $table->string('condition', 20)->nullable();
            // excelente, bueno, regular, malo

            // Acuse del arrendatario / propietario — se llena cuando firman
            $table->boolean('signed_by_tenant')->default(false);
            $table->timestamp('tenant_signed_at')->nullable();
            $table->boolean('signed_by_landlord')->default(false);
            $table->timestamp('landlord_signed_at')->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->index(['property_id', 'inspection_date']);
            $table->index(['agency_id', 'type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('property_inspections');
    }
};
