<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('property_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('agency_id')->constrained()->cascadeOnDelete();
            $table->foreignId('property_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();

            // Tipo de evento: status_change, client_assigned, client_removed,
            //                 lease_created, lease_updated, lease_ended,
            //                 owner_assigned, agent_assigned, ...
            $table->string('type', 40)->index();

            // Valores antes/después (texto)
            $table->string('from_value', 60)->nullable();
            $table->string('to_value', 60)->nullable();

            // Snapshot del contexto en ese momento — referencias a otros modelos
            // y datos textuales útiles para mostrar después.
            //   Ej: { tenant_id, tenant_name, contract_code, monthly_rent, ... }
            $table->jsonb('snapshot')->nullable();

            $table->timestamp('occurred_at')->useCurrent();
            $table->timestamps();

            $table->index(['property_id', 'occurred_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('property_events');
    }
};
