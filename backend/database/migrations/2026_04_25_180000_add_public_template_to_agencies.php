<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('agencies', function (Blueprint $table) {
            $table->string('public_template_preset', 40)->default('modern_loft');
            $table->jsonb('public_template_config')->nullable();
            $table->string('public_primary_color', 9)->default('#f85757');
            $table->string('public_font', 24)->default('sans');
        });
    }

    public function down(): void
    {
        Schema::table('agencies', function (Blueprint $table) {
            $table->dropColumn([
                'public_template_preset',
                'public_template_config',
                'public_primary_color',
                'public_font',
            ]);
        });
    }
};
