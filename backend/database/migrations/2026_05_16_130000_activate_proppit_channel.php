<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Activa el canal Proppit ahora que tiene driver (ProppitDriver) y feed XML.
 * `is_active = true` lo habilita en la card "Publicar en canales" del frontend.
 */
return new class extends Migration
{
    public function up(): void
    {
        DB::table('channels')->where('slug', 'proppit')->update(['is_active' => true]);
    }

    public function down(): void
    {
        DB::table('channels')->where('slug', 'proppit')->update(['is_active' => false]);
    }
};
