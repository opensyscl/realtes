<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Migra los valores antiguos de `properties.status` a los nuevos:
     *   - 'ocupada'        → 'arrendada'
     *   - 'fuera_mercado'  → 'disponible' (con is_published=false)
     * Y añade 'reservada' / 'vendida' como valores válidos (gestionado en validación).
     */
    public function up(): void
    {
        DB::table('properties')->where('status', 'ocupada')->update(['status' => 'arrendada']);
        DB::table('properties')
            ->where('status', 'fuera_mercado')
            ->update(['status' => 'disponible', 'is_published' => false]);
    }

    public function down(): void
    {
        DB::table('properties')->where('status', 'arrendada')->update(['status' => 'ocupada']);
    }
};
