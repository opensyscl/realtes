<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('properties', function (Blueprint $table) {
            $table->unsignedSmallInteger('acquisition_year')->nullable()->after('uncovered_parking_spaces');
            $table->string('acquisition_method', 30)->nullable()->after('acquisition_year');
            $table->decimal('bank_debt', 14, 2)->nullable()->after('acquisition_method');
            $table->string('debt_institution', 120)->nullable()->after('bank_debt');
            $table->boolean('requires_guarantor')->nullable()->after('debt_institution');
        });
    }

    public function down(): void
    {
        Schema::table('properties', function (Blueprint $table) {
            $table->dropColumn([
                'acquisition_year',
                'acquisition_method',
                'bank_debt',
                'debt_institution',
                'requires_guarantor',
            ]);
        });
    }
};
