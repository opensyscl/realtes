<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('agencies', function (Blueprint $table) {
            // ISO 4217 (3 letras): CLP, EUR, USD, ARS, MXN, COP, etc.
            $table->string('currency', 3)->default('CLP');
            $table->string('locale', 10)->default('es-CL');
        });
    }

    public function down(): void
    {
        Schema::table('agencies', function (Blueprint $table) {
            $table->dropColumn(['currency', 'locale']);
        });
    }
};
