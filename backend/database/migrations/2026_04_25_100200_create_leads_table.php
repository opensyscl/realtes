<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('leads', function (Blueprint $table) {
            $table->id();
            $table->foreignId('agency_id')->constrained()->cascadeOnDelete();
            $table->foreignId('pipeline_id')->constrained()->cascadeOnDelete();
            $table->foreignId('stage_id')->constrained()->cascadeOnDelete();
            $table->foreignId('person_id')->nullable()->constrained('persons')->nullOnDelete();
            $table->foreignId('property_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('assigned_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('converted_contract_id')->nullable()->constrained('contracts')->nullOnDelete();

            $table->string('code')->index();
            $table->string('title');
            $table->string('contact_name')->nullable();
            $table->string('contact_email')->nullable();
            $table->string('contact_phone')->nullable();
            $table->string('source')->default('web'); // web, referral, llamada, instagram, idealista, walk_in
            $table->decimal('value', 10, 2)->default(0);
            $table->unsignedSmallInteger('probability_pct')->default(20);
            $table->json('requirements')->nullable(); // bedrooms_min, area_min, max_price, zones[], type[]
            $table->text('notes')->nullable();
            $table->date('expected_close_date')->nullable();
            $table->timestamp('last_activity_at')->nullable();
            $table->string('status')->default('open'); // open, won, lost
            $table->string('lost_reason')->nullable();
            $table->unsignedInteger('position')->default(0); // posición dentro de la columna

            $table->timestamps();
            $table->softDeletes();

            $table->unique(['agency_id', 'code']);
            $table->index(['pipeline_id', 'stage_id', 'position']);
            $table->index(['agency_id', 'status']);
        });

        Schema::create('lead_activities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('agency_id')->constrained()->cascadeOnDelete();
            $table->foreignId('lead_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('type'); // note, call, email, meeting, stage_change, visit_scheduled, won, lost
            $table->string('title')->nullable();
            $table->text('body')->nullable();
            $table->json('payload')->nullable(); // ej: { from_stage_id, to_stage_id }
            $table->timestamp('occurred_at')->useCurrent();
            $table->timestamps();

            $table->index(['lead_id', 'occurred_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lead_activities');
        Schema::dropIfExists('leads');
    }
};
