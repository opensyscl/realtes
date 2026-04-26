<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('properties', function (Blueprint $table) {
            // Agendamiento de visitas (Cal.com / Google Calendar / link externo)
            $table->boolean('booking_enabled')->default(false);
            $table->string('booking_provider', 20)->default('calcom'); // calcom | google | other
            $table->string('booking_url', 500)->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('properties', function (Blueprint $table) {
            $table->dropColumn(['booking_enabled', 'booking_provider', 'booking_url']);
        });
    }
};
