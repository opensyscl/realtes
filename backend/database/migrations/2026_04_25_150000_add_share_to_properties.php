<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('properties', function (Blueprint $table) {
            $table->boolean('is_shared')->default(false)->after('is_published');
            $table->decimal('share_pct', 5, 2)->default(50.00)->after('is_shared');
            $table->timestamp('shared_at')->nullable()->after('share_pct');
            $table->index(['is_shared', 'status']);
        });
    }

    public function down(): void
    {
        Schema::table('properties', function (Blueprint $table) {
            $table->dropIndex(['is_shared', 'status']);
            $table->dropColumn(['is_shared', 'share_pct', 'shared_at']);
        });
    }
};
