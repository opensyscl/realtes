<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Hub de Canales — tabla `channels`.
 *
 * Catálogo global (no por tenant) de portales/canales de publicación. Las filas
 * semilla se insertan acá mismo porque son datos de referencia deterministas y
 * la migración de backfill posterior depende de que existan.
 *
 * `kind`:
 *  - api        → integración por API directa (Mercado Libre, TocToc, Yapo)
 *  - aggregator → un solo feed redistribuye a varios portales (Proppit)
 *  - feed       → feed XML/JSON que el portal consume (pull)
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('channels', function (Blueprint $table) {
            $table->id();
            $table->string('slug', 48)->unique();
            $table->string('name', 96);
            $table->string('kind', 16)->default('api');
            $table->text('description')->nullable();
            $table->boolean('supports_oauth')->default(false);
            $table->boolean('is_active')->default(false);
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->jsonb('meta')->nullable();
            $table->timestampsTz();
        });

        $now = now();
        DB::table('channels')->insert([
            [
                'slug' => 'mercadolibre',
                'name' => 'Mercado Libre',
                'kind' => 'api',
                'description' => 'Publica en Mercado Libre y, vía el atributo CMG_SITE, también en Portal Inmobiliario.',
                'supports_oauth' => true,
                'is_active' => true,
                'sort_order' => 1,
                'meta' => json_encode(['also_targets' => ['portal_inmobiliario']]),
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'slug' => 'proppit',
                'name' => 'Proppit',
                'kind' => 'aggregator',
                'description' => 'Un feed XML distribuye a Trovit, Mitula, iCasas, Nestoria, OLX y Properati.',
                'supports_oauth' => false,
                'is_active' => false,
                'sort_order' => 2,
                'meta' => json_encode(['distributes_to' => ['trovit', 'mitula', 'icasas', 'nestoria', 'olx', 'properati']]),
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'slug' => 'toctoc',
                'name' => 'TocToc',
                'kind' => 'api',
                'description' => 'Portal inmobiliario chileno. Integración por API REST + feed (requiere acuerdo comercial).',
                'supports_oauth' => false,
                'is_active' => false,
                'sort_order' => 3,
                'meta' => null,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'slug' => 'yapo',
                'name' => 'Yapo',
                'kind' => 'api',
                'description' => 'Clasificados masivos de Chile. API REST con key asignada por Yapo.',
                'supports_oauth' => false,
                'is_active' => false,
                'sort_order' => 4,
                'meta' => null,
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('channels');
    }
};
