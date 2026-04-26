<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('app_notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('agency_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->cascadeOnDelete();
            $table->string('type');                  // lead_created, charge_overdue, contract_signed, commission_pending, custom
            $table->string('title');
            $table->text('body')->nullable();
            $table->string('link')->nullable();      // ruta interna /leads/123 etc
            $table->json('payload')->nullable();
            $table->string('icon_tone')->default('neutral'); // neutral, info, positive, warning, negative
            $table->timestamp('read_at')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'read_at']);
            $table->index(['agency_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('app_notifications');
    }
};
