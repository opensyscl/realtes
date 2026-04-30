<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * ML devuelve un scope con la lista completa de URNs autorizadas
 * (~600 chars). El varchar(191) original truncaba.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('ml_tokens', function (Blueprint $table) {
            $table->text('scope')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('ml_tokens', function (Blueprint $table) {
            $table->string('scope', 191)->nullable()->change();
        });
    }
};
