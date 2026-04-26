<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('charges', function (Blueprint $table) {
            $table->id();
            $table->foreignId('agency_id')->constrained()->cascadeOnDelete();
            $table->foreignId('contract_id')->nullable()->constrained()->cascadeOnDelete();
            $table->foreignId('person_id')->constrained('persons')->restrictOnDelete();
            $table->string('code')->index();
            $table->string('concept'); // renta, comunidad, suministro, multa, mantenimiento
            $table->string('description')->nullable();
            $table->decimal('amount', 10, 2);
            $table->decimal('paid_amount', 10, 2)->default(0);
            $table->date('issued_at');
            $table->date('due_date');
            $table->date('paid_at')->nullable();
            $table->string('status')->default('pendiente'); // pendiente, parcial, pagado, vencido, anulado
            $table->boolean('recurring')->default(false);
            $table->decimal('late_fee', 8, 2)->default(0);
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['agency_id', 'code']);
            $table->index(['agency_id', 'status', 'due_date']);
            $table->index(['contract_id', 'due_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('charges');
    }
};
