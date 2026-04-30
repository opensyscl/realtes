<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ml_publications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('agency_id')->constrained()->cascadeOnDelete();
            $table->foreignId('property_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('ml_item_id', 32)->index();
            $table->string('ml_permalink', 500)->nullable();
            $table->string('ml_status', 32)->default('active');
            $table->string('ml_category_id', 32);
            $table->string('listing_type_id', 32)->default('gold_special');
            $table->jsonb('payload_snapshot')->nullable();
            $table->timestampTz('last_synced_at')->nullable();
            $table->timestampTz('published_at')->nullable();
            $table->text('last_error')->nullable();
            $table->timestampsTz();

            $table->index(['agency_id', 'ml_status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ml_publications');
    }
};
