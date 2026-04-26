<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('properties', function (Blueprint $table) {
            // Moneda por propiedad (override del default de la agencia)
            $table->string('currency', 3)->nullable();

            // Captación (cómo y cuándo se incorporó al porfolio)
            $table->date('captacion_date')->nullable();
            $table->string('captacion_source', 40)->nullable(); // particular, portal, referido, web, otro
            $table->boolean('is_exclusive')->default(false);
            $table->decimal('commission_pct', 5, 2)->nullable(); // % comisión sobre operación

            // Identificadores fiscales
            // "Rol" = ID tributario en Chile, "referencia catastral" en España.
            $table->string('rol', 60)->nullable();

            // Asignaciones internas
            $table->foreignId('owner_person_id')->nullable()->constrained('persons')->nullOnDelete();
            $table->foreignId('agent_user_id')->nullable()->constrained('users')->nullOnDelete();

            // Notas internas (no salen al escaparate público)
            $table->text('private_note')->nullable();
            $table->text('inventory_notes')->nullable();
            $table->text('reception_notes')->nullable();

            $table->index(['captacion_date']);
            $table->index(['agent_user_id']);
            $table->index(['owner_person_id']);
        });
    }

    public function down(): void
    {
        Schema::table('properties', function (Blueprint $table) {
            $table->dropConstrainedForeignId('owner_person_id');
            $table->dropConstrainedForeignId('agent_user_id');
            $table->dropColumn([
                'currency', 'captacion_date', 'captacion_source',
                'is_exclusive', 'commission_pct', 'rol',
                'private_note', 'inventory_notes', 'reception_notes',
            ]);
        });
    }
};
