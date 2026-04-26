<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('contracts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('agency_id')->constrained()->cascadeOnDelete();
            $table->string('code')->index();
            $table->foreignId('property_id')->constrained()->cascadeOnDelete();
            $table->foreignId('owner_id')->constrained('persons')->restrictOnDelete();
            $table->foreignId('tenant_id')->constrained('persons')->restrictOnDelete();
            $table->foreignId('agent_user_id')->nullable()->constrained('users')->nullOnDelete();

            $table->string('type')->default('alquiler_residencial');
            $table->string('status')->default('borrador'); // borrador, vigente, vencido, finalizado, renovado, cancelado

            $table->date('start_date');
            $table->date('end_date');
            $table->decimal('monthly_rent', 10, 2);
            $table->decimal('deposit', 10, 2)->default(0);
            $table->decimal('commission_pct', 5, 2)->default(0);
            $table->boolean('ipc_adjustment')->default(true);
            $table->unsignedSmallInteger('payment_day')->default(5); // día del mes para cargo

            $table->date('signed_at')->nullable();
            $table->string('contract_pdf_url')->nullable();
            $table->text('notes')->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->unique(['agency_id', 'code']);
            $table->index(['agency_id', 'status']);
            $table->index('end_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('contracts');
    }
};
