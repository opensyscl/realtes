<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('plans', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique(); // starter, pro, business
            $table->string('name');
            $table->string('tagline')->nullable();
            $table->decimal('price_monthly', 8, 2)->default(0);
            $table->decimal('price_yearly', 9, 2)->default(0);
            $table->json('limits');         // {max_properties, max_users, max_leads, ...}
            $table->json('features');       // [{name, included: bool}]
            $table->boolean('is_recommended')->default(false);
            $table->unsignedSmallInteger('position')->default(0);
            $table->boolean('active')->default(true);
            $table->timestamps();
        });

        Schema::table('agencies', function (Blueprint $table) {
            $table->string('current_plan_code')->default('starter')->after('plan');
            $table->string('subscription_status')->default('trialing')->after('current_plan_code');
            // trialing, active, past_due, cancelled
            $table->timestamp('subscription_started_at')->nullable()->after('subscription_status');
            $table->timestamp('current_period_end')->nullable()->after('subscription_started_at');
            $table->timestamp('cancelled_at')->nullable()->after('current_period_end');
            $table->string('billing_cycle')->default('monthly')->after('cancelled_at'); // monthly, yearly
        });

        Schema::create('plan_changes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('agency_id')->constrained()->cascadeOnDelete();
            $table->string('from_plan')->nullable();
            $table->string('to_plan');
            $table->string('reason')->nullable(); // trial_ended, upgrade, downgrade, cancel
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('plan_changes');
        Schema::table('agencies', function (Blueprint $table) {
            $table->dropColumn([
                'current_plan_code', 'subscription_status',
                'subscription_started_at', 'current_period_end',
                'cancelled_at', 'billing_cycle',
            ]);
        });
        Schema::dropIfExists('plans');
    }
};
