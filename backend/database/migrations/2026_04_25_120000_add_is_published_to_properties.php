<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('properties', function (Blueprint $table) {
            $table->boolean('is_published')->default(false)->after('listing_type');
            $table->timestamp('published_at')->nullable()->after('is_published');
            $table->index(['agency_id', 'is_published', 'status']);
        });

        // Publicar todas las disponibles por defecto para que el demo se vea con datos
        \DB::statement("UPDATE properties SET is_published = true, published_at = NOW() WHERE status = 'disponible'");
    }

    public function down(): void
    {
        Schema::table('properties', function (Blueprint $table) {
            $table->dropIndex(['agency_id', 'is_published', 'status']);
            $table->dropColumn(['is_published', 'published_at']);
        });
    }
};
