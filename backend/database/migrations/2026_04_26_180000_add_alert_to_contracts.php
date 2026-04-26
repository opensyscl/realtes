<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('contracts', function (Blueprint $table) {
            // Alertas de vencimiento + renovación
            $table->integer('alert_days_before')->default(30);
            $table->boolean('auto_renew')->default(false);
        });
    }

    public function down(): void
    {
        Schema::table('contracts', function (Blueprint $table) {
            $table->dropColumn(['alert_days_before', 'auto_renew']);
        });
    }
};
