<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('persons', function (Blueprint $table) {
            $table->id();
            $table->foreignId('agency_id')->constrained()->cascadeOnDelete();
            $table->string('type')->default('tenant'); // owner, tenant, both, prospect
            $table->string('first_name');
            $table->string('last_name')->nullable();
            $table->string('nif')->nullable(); // DNI/NIE/CIF
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->string('phone_alt')->nullable();
            $table->string('address')->nullable();
            $table->string('city')->nullable();
            $table->string('postal_code', 10)->nullable();
            $table->string('country', 2)->default('ES');
            $table->string('iban_last4', 4)->nullable();
            $table->string('iban_encrypted')->nullable();
            $table->date('birthday')->nullable();
            $table->text('notes')->nullable();
            $table->json('tags')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['agency_id', 'nif']);
            $table->index(['agency_id', 'type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('persons');
    }
};
