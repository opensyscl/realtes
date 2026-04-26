<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('agencies', function (Blueprint $table) {
            $table->string('qr_logo_url', 500)->nullable();
            $table->string('qr_color_main', 7)->nullable();
            $table->string('qr_color_bg', 7)->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('agencies', function (Blueprint $table) {
            $table->dropColumn(['qr_logo_url', 'qr_color_main', 'qr_color_bg']);
        });
    }
};
