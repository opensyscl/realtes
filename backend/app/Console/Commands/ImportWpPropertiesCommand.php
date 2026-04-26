<?php

namespace App\Console\Commands;

use App\Models\Property;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

/**
 * Importa propiedades exportadas desde WordPress (plugin "Real Estate") a
 * nuestra tabla `properties`.
 *
 * Uso:
 *   php artisan import:wp-properties --agency=1
 *
 * Requiere los archivos:
 *   storage/app/wp-properties.jsonl    — un JSON por línea con wp_id, title, meta...
 *   storage/app/wp-attachments.jsonl   — mapa attachment_id → URL
 */
class ImportWpPropertiesCommand extends Command
{
    protected $signature = 'import:wp-properties {--agency=1 : ID de la agencia destino} {--dry-run : Sólo muestra qué importaría} {--clean : Borra todas las propiedades no-WP de la agencia antes de importar} {--with-gallery : Descarga e importa las imágenes de galería desde WP}';
    protected $description = 'Importa propiedades de WordPress (Real Estate plugin) a la tabla properties.';

    /**
     * Mapa de meta_key del plugin Real Estate → key en nuestro array `features`.
     * Si el meta_value es truthy ("1", "yes", etc.), se añade al array.
     */
    private array $featureFlagMap = [
        'real_estate_property_air_conditioning' => 'aire_acondicionado',
        'real_estate_property_furnished' => 'amueblado',
        'real_estate_property_balcony' => 'balcon',
        'real_estate_property_terrace' => 'terraza',
        'real_estate_property_balcony_terrace' => 'balcon_terraza',
        'real_estate_property_natural_gas' => 'gas_natural',
        'real_estate_property_regularized' => 'regularizada',
        'real_estate_property_guest_bathroom' => 'bano_visita',
        'real_estate_property_living_dining_together' => 'living_comedor_juntos',
        'real_estate_property_living_separate' => 'living_separado',
        'real_estate_property_dining_separate' => 'comedor_separado',
        'real_estate_property_daily_dining' => 'comedor_diario',
        'real_estate_property_laundry' => 'lavanderia',
        'real_estate_property_garden' => 'jardin',
        'real_estate_property_multipurpose_room' => 'sala_multiple',
        'real_estate_property_visitor_parking' => 'estacionamiento_visita',
        'real_estate_property_gym' => 'gimnasio',
        'real_estate_property_walk_in_closet' => 'walk_in_closet',
        'real_estate_property_loggia' => 'logia',
        'real_estate_property_bathroom_extractor' => 'bano_extractor',
        'real_estate_property_window_protection' => 'proteccion_ventanas',
        'real_estate_property_built_in_alarm' => 'alarma_incorporada',
        'real_estate_property_washer_connection' => 'conexion_lavadora',
        'real_estate_property_closet' => 'closet',
        'real_estate_property_study' => 'estudio',
        'real_estate_property_refrigerator' => 'refrigerador',
        'real_estate_property_fireplace' => 'chimenea',
        'real_estate_property_cistern' => 'cisterna',
        'real_estate_property_boiler' => 'caldera',
        'real_estate_property_breakfast_nook' => 'desayunador',
        'real_estate_property_cable_tv' => 'tv_cable',
        'real_estate_property_satellite_tv' => 'tv_satelital',
        'real_estate_property_solar_energy' => 'energia_solar',
        'real_estate_property_electric_generator' => 'generador_electrico',
        'real_estate_property_in_condominium' => 'en_condominio',
        'real_estate_property_gated_community' => 'condominio_cerrado',
        'real_estate_property_has_sign' => 'tiene_letrero',
        'real_estate_property_keys_in_office' => 'llaves_oficina',
        'real_estate_property_concierge' => 'conserjeria',
        'real_estate_property_common_green_areas' => 'areas_verdes_comunes',
        'real_estate_property_building_sauna' => 'sauna',
        'real_estate_property_cinema_area' => 'area_cine',
        'real_estate_property_elevator' => 'ascensor',
        'real_estate_property_tennis_court' => 'cancha_tenis',
        'real_estate_property_soccer_field' => 'cancha_futbol',
        'real_estate_property_basketball_court' => 'cancha_basquetbol',
        'real_estate_property_multisport_court' => 'cancha_polideportiva',
        'real_estate_property_internet_access' => 'acceso_internet',
        'real_estate_property_paddle_court' => 'cancha_paddle',
        'real_estate_property_wheelchair_ramp' => 'rampa_accesibilidad',
        'real_estate_property_business_center' => 'business_center',
        'real_estate_property_commercial_use' => 'uso_comercial',
        'real_estate_property_jacuzzi' => 'jacuzzi',
        'real_estate_property_bbq_grill' => 'quincho',
        'real_estate_property_pool' => 'piscina',
        'real_estate_property_security_24_7' => 'seguridad_24_7',
        'real_estate_property_security_camera' => 'camara_seguridad',
        'real_estate_property_running_water' => 'agua_corriente',
        'real_estate_property_rooftop_garden' => 'jardin_azotea',
        'real_estate_property_game_room' => 'sala_juegos',
        'real_estate_property_bike_rack' => 'bicicletero',
        'real_estate_property_automatic_gate' => 'porton_automatico',
    ];

    public function handle(): int
    {
        $agencyId = (int) $this->option('agency');
        $dryRun = (bool) $this->option('dry-run');
        $clean = (bool) $this->option('clean');
        $withGallery = (bool) $this->option('with-gallery');

        $jsonlPath = storage_path('app/wp-properties.jsonl');
        $imagesPath = storage_path('app/wp-attachments.jsonl');

        if (! file_exists($jsonlPath)) {
            $this->error("No existe $jsonlPath");
            return self::FAILURE;
        }

        // Mapa attachment_id → URL
        $attachments = [];
        if (file_exists($imagesPath)) {
            foreach (file($imagesPath) as $line) {
                $line = trim($line);
                if (! $line) continue;
                $obj = json_decode(stripcslashes($line), true);
                if ($obj && isset($obj['id'])) {
                    $attachments[(int) $obj['id']] = $obj['url'];
                }
            }
        }
        $this->info('Attachments cargados: '.count($attachments));

        // Cleanup: borra todas las propiedades de la agencia que NO sean WP-*
        if ($clean && ! $dryRun) {
            $deleted = \App\Models\Property::withoutGlobalScopes()
                ->where('agency_id', $agencyId)
                ->where(function ($q) {
                    $q->where('code', 'not like', 'WP-%')->orWhereNull('code');
                })
                ->forceDelete();
            $this->warn("Borradas $deleted propiedades no-WP de la agencia $agencyId");
        }

        $created = 0;
        $updated = 0;
        $skipped = 0;
        $imagesAdded = 0;

        foreach (file($jsonlPath) as $line) {
            $line = trim($line);
            if (! $line) continue;

            // mysql -B -N escapa con backslash. stripcslashes() los devuelve a
            // su forma original para que json_decode pueda parsear.
            $line = stripcslashes($line);

            $row = json_decode($line, true);
            if (! $row) {
                $this->warn('JSON inválido: '.substr($line, 0, 80));
                $skipped++;
                continue;
            }

            $meta = $row['meta'] ?? [];

            // Mapeo a columnas
            $data = [
                'agency_id' => $agencyId,
                'code' => 'WP-'.$row['wp_id'],
                'title' => trim($row['title'] ?? 'Sin título'),
                'description' => $this->cleanHtml($row['description'] ?? ''),
                'type' => $this->mapType($meta['real_estate_property_type'] ?? null),
                'listing_type' => $this->mapListingType($meta['real_estate_property_operation'] ?? 'arriendo'),
                'status' => $this->mapStatus($meta['property_status'] ?? 'disponible'),
                'is_published' => true,
                'published_at' => $row['created_at'] ?? now(),

                // Características
                'bedrooms' => $this->toInt($meta['real_estate_property_bedrooms'] ?? 0),
                'bathrooms' => $this->toFloat($meta['real_estate_property_bathrooms'] ?? 0),
                'area_sqm' => $this->extractNumber($meta['real_estate_property_size'] ?? null),
                'community_fee' => $this->toFloat($meta['real_estate_property_common_expenses'] ?? null),
                'ibi_annual' => $this->toFloat($meta['real_estate_property_contributions'] ?? null),
                'parking_spaces' => $this->toInt($meta['real_estate_property_garage'] ?? null),
                'year_built' => $this->toInt($meta['real_estate_property_construction_year'] ?? $meta['real_estate_property_year'] ?? null),
                'orientation' => $this->mapOrientation($meta['real_estate_property_orientation'] ?? null),
                'floors_count' => $this->toInt($meta['real_estate_property_floors_count'] ?? null),
                'units_per_floor' => $this->toInt($meta['real_estate_property_apartments_per_floor'] ?? null),
                'terrace_sqm' => $this->extractNumber($meta['real_estate_property_terrace'] ?? null),
                'built_sqm' => $this->extractNumber($meta['real_estate_property_size'] ?? null),

                // Interior
                'condition' => $this->mapCondition($meta['real_estate_property_condition'] ?? null),
                'suites_count' => $this->toInt($meta['real_estate_property_suites'] ?? null),
                'service_rooms' => $this->toInt($meta['real_estate_property_service_rooms'] ?? null),
                'living_rooms' => $this->toInt($meta['real_estate_property_living_rooms'] ?? null),
                'service_bathrooms' => $this->toInt($meta['real_estate_property_service_bathrooms'] ?? null),
                'floor_type' => $this->mapEnum($meta['real_estate_property_floor_type'] ?? null, [
                    'piso_flotante','ceramica','madera','porcelanato',
                    'alfombra','vinilico','marmol','otro',
                ]),
                'gas_type' => $this->mapEnum($meta['real_estate_property_gas_type'] ?? null, ['caneria','balon','otros']),
                'has_termopanel' => $this->toBool($meta['real_estate_property_termopanel'] ?? null),
                'hot_water_type' => $this->mapEnum($meta['real_estate_property_hot_water_type'] ?? null, ['electrico','gas','solar','otro']),
                'heating_type' => $this->mapEnum($meta['real_estate_property_heating_type'] ?? null, ['central','electrica','losa_radiante','gas','no_tiene','otro']),
                'kitchen_type' => $this->mapEnum($meta['real_estate_property_kitchen_type'] ?? null, ['americana','cerrada','isla','otro']),
                'window_type' => $this->mapEnum($meta['real_estate_property_window_type'] ?? null, ['termopanel','aluminio','pvc','madera','otro']),

                // Exterior
                'elevators_count' => $this->toInt($meta['real_estate_property_elevators'] ?? null),
                'covered_parking_spaces' => $this->toInt($meta['real_estate_property_covered_parking'] ?? null),
                'uncovered_parking_spaces' => $this->toInt($meta['real_estate_property_uncovered_parking'] ?? null),

                // Deudas y adquisición
                'acquisition_year' => $this->toInt($meta['real_estate_property_acquisition_year'] ?? null),
                'acquisition_method' => $this->mapEnum($meta['real_estate_property_acquisition_form'] ?? null, ['compra','herencia','donacion','permuta','remate','otro']),
                'bank_debt' => $this->toFloat($meta['real_estate_property_bank_debt'] ?? null),
                'debt_institution' => $this->trim($meta['real_estate_property_debt_institution'] ?? null),
                'requires_guarantor' => $this->toBool($meta['real_estate_property_requires_guarantor'] ?? null),

                // Otros
                'apartment_subtype' => $this->mapEnum($meta['real_estate_property_apartment_type'] ?? null, ['tradicional','loft','duplex','triplex','penthouse','studio','otro']),
                'rooms_count' => $this->toInt($meta['real_estate_property_rooms'] ?? null),
                'max_occupants' => $this->toInt($meta['real_estate_property_max_inhabitants'] ?? null),
                'storage_count' => $this->toInt($meta['real_estate_property_storage_rooms'] ?? null),

                // Dirección
                'address' => $this->trim($meta['real_estate_property_address'] ?? '—') ?: '—',
                'postal_code' => $this->trim($meta['real_estate_property_zip'] ?? null),
                'country' => 'CL',
                'city' => $this->extractCityFromAddress($meta['real_estate_property_address'] ?? null),
                'province' => $this->extractCityFromAddress($meta['real_estate_property_address'] ?? null),
                'floor' => $this->truncate($this->trim($meta['real_estate_property_floor_number'] ?? null), 10),

                // Precios
                'price_rent' => $this->priceFor($meta, 'arriendo'),
                'price_sale' => $this->priceFor($meta, 'venta'),

                // Media URLs
                'video_url' => $this->trim($meta['real_estate_property_video_url'] ?? null),
                'tour_url' => $this->trim($meta['real_estate_property_virtual_tour'] ?? null),

                // Notas
                'private_note' => $this->trim($meta['real_estate_private_note'] ?? null),
                'inventory_notes' => $this->trim($meta['real_estate_property_internal_observations'] ?? null),

                // Features
                'features' => $this->extractFeatures($meta),
                'tags' => [],

                // Cover image
                'cover_image_url' => $this->resolveThumbnail($row['thumbnail_id'] ?? null, $attachments),
            ];

            // Lat/lng vienen en serializado PHP "a:2:{...}"
            $loc = $this->extractLatLng($meta['real_estate_property_location'] ?? null);

            if ($dryRun) {
                $this->line('— DRY RUN — '.$data['code'].' "'.$data['title'].'"  beds='.$data['bedrooms'].' price_sale='.$data['price_sale'].' price_rent='.$data['price_rent'].' features='.count($data['features']).' lat='.($loc['lat'] ?? '—'));
                continue;
            }

            $exists = Property::withoutGlobalScopes()->where('code', $data['code'])->exists();
            $property = Property::withoutGlobalScopes()->updateOrCreate(
                ['code' => $data['code']],
                $data,
            );

            // Set location separately (PostGIS POINT)
            if ($loc) {
                DB::statement(
                    "UPDATE properties SET location = ST_SetSRID(ST_MakePoint(?, ?), 4326) WHERE id = ?",
                    [$loc['lng'], $loc['lat'], $property->id],
                );
            }

            if ($exists) {
                $updated++;
                $this->line(' • Updated: '.$data['code'].' — '.$data['title']);
            } else {
                $created++;
                $this->info('+ Created: '.$data['code'].' — '.$data['title']);
            }

            // Galería: lee del filesystem local (storage/app/wp-uploads) y sube a R2
            if ($withGallery) {
                // Cover: si la URL apunta a cms.valenciapro.cl, copiamos el archivo a R2 y reemplazamos
                $coverUrl = $data['cover_image_url'];
                if ($coverUrl && str_contains($coverUrl, 'cms.valenciapro.cl')) {
                    $coverRel = preg_replace('#^https?://[^/]+/wp-content/uploads/#', '', $coverUrl);
                    $coverLocal = storage_path('app/wp-uploads/'.$coverRel);
                    if (is_file($coverLocal)) {
                        try {
                            $disk = \Illuminate\Support\Facades\Storage::disk(config('media-library.disk_name', 'public'));
                            $key = "agencies/$agencyId/properties/{$property->id}/cover/".basename($coverLocal);
                            $disk->put($key, file_get_contents($coverLocal), 'public');
                            $newCoverUrl = $disk->url($key);
                            $property->update(['cover_image_url' => $newCoverUrl]);
                            $this->line("    🖼 cover → R2");
                        } catch (\Throwable $e) {
                            $this->warn("    ⚠ Cover R2 falló: ".$e->getMessage());
                        }
                    }
                }

                $imagesField = $meta['real_estate_property_images'] ?? '';
                $ids = array_filter(array_map('intval', explode('|', $imagesField)));
                if ($ids) {
                    // Limpia las fotos previas para no duplicar al re-importar
                    $property->clearMediaCollection('photos');
                    foreach ($ids as $attId) {
                        $url = $attachments[$attId] ?? null;
                        if (! $url) continue;
                        // Convierte URL "https://cms.valenciapro.cl/wp-content/uploads/2026/01/IMG.jpg"
                        // a path local: storage/app/wp-uploads/2026/01/IMG.jpg
                        $relPath = preg_replace('#^https?://[^/]+/wp-content/uploads/#', '', $url);
                        $localPath = storage_path('app/wp-uploads/'.$relPath);
                        if (! is_file($localPath)) {
                            $this->warn("    ⚠ Falta archivo local: $relPath");
                            continue;
                        }
                        try {
                            $property
                                ->addMedia($localPath)
                                ->preservingOriginal()
                                ->toMediaCollection('photos');
                            $imagesAdded++;
                        } catch (\Throwable $e) {
                            $this->warn("    ⚠ No se pudo importar $relPath: ".$e->getMessage());
                        }
                    }
                    $this->line("    📷 ".count($ids)." imágenes procesadas");
                }
            }
        }

        $this->newLine();
        $this->info("Importación completa: $created creadas, $updated actualizadas, $skipped omitidas".($withGallery ? ", $imagesAdded imágenes" : "").".");

        return self::SUCCESS;
    }

    // -------- helpers --------

    private function toInt($v): ?int
    {
        if ($v === null || $v === '' || $v === '0') return $v === '0' ? 0 : null;
        $n = (int) $v;
        return $n > 0 ? $n : null;
    }

    private function toFloat($v): ?float
    {
        if ($v === null || $v === '') return null;
        $n = (float) preg_replace('/[^0-9.\-]/', '', (string) $v);
        return $n > 0 ? $n : null;
    }

    private function toBool($v): ?bool
    {
        if ($v === null || $v === '') return null;
        $s = strtolower((string) $v);
        if (in_array($s, ['1', 'yes', 'si', 'sí', 'true', 'on'], true)) return true;
        if (in_array($s, ['0', 'no', 'false', 'off'], true)) return false;
        return null;
    }

    private function trim($v): ?string
    {
        $s = trim((string) ($v ?? ''));
        return $s === '' ? null : $s;
    }

    private function extractNumber(?string $v): ?int
    {
        if (! $v) return null;
        if (preg_match('/(\d+)/', $v, $m)) return (int) $m[1];
        return null;
    }

    private function normSlug(?string $v): ?string
    {
        $s = $this->trim($v);
        if (! $s) return null;
        return strtolower(preg_replace('/[\s\-]+/', '_', $s));
    }

    private function truncate(?string $s, int $max): ?string
    {
        if ($s === null) return null;
        return mb_substr($s, 0, $max);
    }

    /** Devuelve el valor sólo si está en el conjunto permitido (después de normalizar). */
    private function mapEnum(?string $v, array $allowed): ?string
    {
        $s = $this->normSlug($v);
        if (! $s) return null;
        return in_array($s, $allowed, true) ? $s : null;
    }

    private function cleanHtml(string $html): string
    {
        $clean = strip_tags($html);
        $clean = html_entity_decode($clean, ENT_QUOTES | ENT_HTML5, 'UTF-8');
        return trim(preg_replace('/\s+/', ' ', $clean));
    }

    private function mapType(?string $v): string
    {
        $s = strtolower($this->trim($v) ?? '');
        return match (true) {
            str_contains($s, 'casa') => 'casa',
            str_contains($s, 'apto') || str_contains($s, 'departamento') || str_contains($s, 'apartament') => 'apartamento',
            str_contains($s, 'oficina') => 'oficina',
            str_contains($s, 'local') => 'local',
            str_contains($s, 'parking') || str_contains($s, 'estacionamiento') => 'parking',
            str_contains($s, 'bodega') || str_contains($s, 'trastero') => 'trastero',
            str_contains($s, 'chalet') => 'chalet',
            default => 'apartamento',
        };
    }

    private function mapListingType(?string $v): string
    {
        $s = strtolower($this->trim($v) ?? '');
        if (str_contains($s, 'venta')) return 'venta';
        if (str_contains($s, 'arriend') || str_contains($s, 'alquil') || str_contains($s, 'rent')) return 'alquiler';
        if (str_contains($s, 'ambos')) return 'ambos';
        return 'alquiler';
    }

    private function mapStatus(?string $v): string
    {
        $s = strtolower($this->trim($v) ?? 'disponible');
        return match ($s) {
            'arrendada', 'rented' => 'arrendada',
            'vendida', 'sold' => 'vendida',
            'reservada', 'reserved' => 'reservada',
            'mantenimiento', 'maintenance' => 'mantenimiento',
            default => 'disponible',
        };
    }

    private function mapOrientation(?string $v): ?string
    {
        $s = $this->normSlug($v);
        if (! $s) return null;
        if (in_array($s, [
            'norte','sur','oriente','poniente',
            'nororiente','norponiente','suroriente','surponiente',
        ], true)) return $s;
        return null;
    }

    private function mapCondition(?string $v): ?string
    {
        $s = $this->normSlug($v);
        if (! $s) return null;
        return match (true) {
            str_contains($s, 'excelente') => 'excelente',
            str_contains($s, 'bueno') => 'bueno',
            str_contains($s, 'regular') => 'regular',
            str_contains($s, 'reformar') || str_contains($s, 'remodel') => 'a_reformar',
            default => null,
        };
    }

    private function priceFor(array $meta, string $for): ?float
    {
        $op = $this->mapListingType($meta['real_estate_property_operation'] ?? null);
        $price = $this->toFloat($meta['real_estate_property_price_short'] ?? null);
        if (! $price) return null;
        // price_unit: 1=UF, 2=CLP (asumido). Para mantener números: usamos el valor crudo.
        if ($for === 'venta' && $op === 'venta') return $price;
        if ($for === 'arriendo' && $op === 'alquiler') return $price;
        if ($for === 'venta' && $op === 'ambos') return $price;
        return null;
    }

    private function extractFeatures(array $meta): array
    {
        $features = [];
        foreach ($this->featureFlagMap as $metaKey => $featureKey) {
            $val = $meta[$metaKey] ?? null;
            if ($this->toBool($val) === true) {
                $features[] = $featureKey;
            }
        }
        return array_values(array_unique($features));
    }

    private function extractLatLng(?string $serialized): ?array
    {
        if (! $serialized) return null;
        // PHP serialized "a:2:{s:8:"location";s:23:"-33.4985562,-70.5625555";...}"
        try {
            $arr = @unserialize($serialized);
            if (is_array($arr) && isset($arr['location'])) {
                $parts = explode(',', $arr['location']);
                if (count($parts) === 2) {
                    $lat = (float) trim($parts[0]);
                    $lng = (float) trim($parts[1]);
                    if ($lat !== 0.0 && $lng !== 0.0) {
                        return ['lat' => $lat, 'lng' => $lng];
                    }
                }
            }
        } catch (\Throwable) {}
        return null;
    }

    private function extractCityFromAddress(?string $address): string
    {
        $s = $this->trim($address);
        if (! $s) return '—';
        $parts = array_map('trim', explode(',', $s));
        return end($parts) ?: '—';
    }

    private function resolveThumbnail($thumbnailId, array $attachments): ?string
    {
        if (! $thumbnailId) return null;
        $id = (int) $thumbnailId;
        return $attachments[$id] ?? null;
    }
}
