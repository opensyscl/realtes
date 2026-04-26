<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // PostgreSQL: drop NOT NULL para permitir crear contratos sin owner asignado
        // (el owner se puede añadir después al asignar dueño a la propiedad).
        DB::statement('ALTER TABLE contracts ALTER COLUMN owner_id DROP NOT NULL');
        // El depósito es opcional al crear un lease desde el wizard.
        DB::statement('ALTER TABLE contracts ALTER COLUMN deposit DROP NOT NULL');
    }

    public function down(): void
    {
        DB::statement('ALTER TABLE contracts ALTER COLUMN owner_id SET NOT NULL');
        DB::statement('ALTER TABLE contracts ALTER COLUMN deposit SET NOT NULL');
    }
};
