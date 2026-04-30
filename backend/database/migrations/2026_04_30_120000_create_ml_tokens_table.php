<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ml_tokens', function (Blueprint $table) {
            $table->id();
            $table->foreignId('agency_id')->unique()->constrained()->cascadeOnDelete();
            $table->bigInteger('ml_user_id')->nullable();
            $table->text('access_token');
            $table->text('refresh_token');
            $table->string('token_type', 32)->default('bearer');
            $table->string('scope', 191)->nullable();
            $table->timestampTz('expires_at')->nullable();
            $table->foreignId('connected_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestampTz('connected_at')->nullable();
            $table->timestampTz('last_refresh_at')->nullable();
            $table->text('last_error')->nullable();
            $table->timestampsTz();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ml_tokens');
    }
};
