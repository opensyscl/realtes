<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('maintenance_tickets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('agency_id')->constrained()->cascadeOnDelete();
            $table->string('code')->index();
            $table->foreignId('property_id')->constrained()->cascadeOnDelete();
            $table->foreignId('contract_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('reported_by')->nullable()->constrained('persons')->nullOnDelete();
            $table->foreignId('assigned_user_id')->nullable()->constrained('users')->nullOnDelete();

            $table->string('title');
            $table->text('description')->nullable();
            $table->string('category')->default('otros'); // fontaneria, electricidad, calefaccion, electrodomesticos, pintura, cerrajeria, jardineria, ascensor, otros
            $table->string('priority')->default('media'); // baja, media, alta, urgente
            $table->string('status')->default('abierto'); // abierto, en_progreso, esperando_proveedor, resuelto, cerrado, cancelado

            $table->decimal('estimated_cost', 10, 2)->nullable();
            $table->decimal('actual_cost', 10, 2)->nullable();
            $table->string('vendor')->nullable(); // proveedor externo
            $table->text('vendor_notes')->nullable();

            $table->timestamp('opened_at')->useCurrent();
            $table->timestamp('resolved_at')->nullable();
            $table->date('scheduled_for')->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->unique(['agency_id', 'code']);
            $table->index(['agency_id', 'status']);
            $table->index(['property_id', 'status']);
        });

        Schema::create('maintenance_comments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('agency_id')->constrained()->cascadeOnDelete();
            $table->foreignId('ticket_id')->constrained('maintenance_tickets')->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('type')->default('comment'); // comment, status_change, assignment, cost_update
            $table->text('body');
            $table->json('payload')->nullable();
            $table->timestamps();

            $table->index(['ticket_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('maintenance_comments');
        Schema::dropIfExists('maintenance_tickets');
    }
};
