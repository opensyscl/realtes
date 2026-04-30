<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('plans', function (Blueprint $table) {
            // CLP por propiedad extra fuera del límite incluido. 0 = sin overage.
            $table->decimal('overage_per_property', 8, 2)->default(0)->after('price_yearly');
            // CLP por user extra. 0 = sin overage.
            $table->decimal('overage_per_user', 8, 2)->default(0)->after('overage_per_property');
        });
    }

    public function down(): void
    {
        Schema::table('plans', function (Blueprint $table) {
            $table->dropColumn(['overage_per_property', 'overage_per_user']);
        });
    }
};
