<?php

namespace App\Console\Commands;

use App\Models\Agency;
use App\Models\Building;
use App\Models\Property;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Symfony\Component\DomCrawler\Crawler;

class ImportLaportaCommand extends Command
{
    protected $signature = 'properties:import-laporta
        {--pages=3 : Número de páginas a scrapear}
        {--agency= : Slug de la agency destino (por defecto la primera)}
        {--replace : Borra propiedades existentes antes de importar}
        {--with-images : Descarga las imágenes a la media library local}';

    protected $description = 'Importa propiedades reales desde laporta.cl como dataset demo';

    public function handle(): int
    {
        $agency = $this->option('agency')
            ? Agency::where('slug', $this->option('agency'))->first()
            : Agency::first();

        if (! $agency) {
            $this->error('Agencia no encontrada');
            return self::FAILURE;
        }

        if ($this->option('replace')) {
            $this->warn("Borrando propiedades existentes de {$agency->name}...");
            Property::withoutGlobalScopes()->where('agency_id', $agency->id)->delete();
            Building::withoutGlobalScopes()->where('agency_id', $agency->id)->delete();
        }

        $pages = (int) $this->option('pages');
        $totalCreated = 0;

        for ($page = 1; $page <= $pages; $page++) {
            $this->info("→ Página {$page}/{$pages}");
            $totalCreated += $this->importPage($agency, $page);

            if ($page < $pages) {
                usleep(700_000); // 0.7s entre páginas
            }
        }

        $this->newLine();
        $this->info("✓ {$totalCreated} propiedades importadas a {$agency->name}.");
        return self::SUCCESS;
    }

    private function importPage(Agency $agency, int $page): int
    {
        $url = 'https://laporta.cl/recursos/publico.ashx';
        $params = [
            'acci' => 'listadoPropiedades',
            'oper' => 0, 'tpro' => 0, 'regi' => 0, 'comu' => 0,
            'orde' => 1, 'pagi' => $page, 'tlis' => 2,
            'divi' => 1, 'cache' => mt_rand(1000, 9999),
            'dorm' => 0, 'bath' => 0, 'esta' => 0, 'amob' => 0, 'pisc' => 0,
            'pred' => '', 'preh' => '',
        ];

        $response = Http::withHeaders([
            'User-Agent' => 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept' => '*/*',
            'Accept-Language' => 'es-CL,es;q=0.9,en;q=0.8',
            'Referer' => 'https://laporta.cl/Todos_los_tipos/Venta_y_Arriendo/Todas_las_comunas',
            'Origin' => 'https://laporta.cl',
            'X-Requested-With' => 'XMLHttpRequest',
        ])->timeout(20)->get($url, $params);

        if (! $response->successful()) {
            $this->error("  HTTP {$response->status()} en página {$page}");
            return 0;
        }

        $body = $response->json();
        $listingHtml = $body[0]['listing'] ?? null;
        if (! $listingHtml) {
            $this->error('  Sin listing en respuesta');
            return 0;
        }

        $crawler = new Crawler('<div>'.$listingHtml.'</div>');
        // Probamos selector permisivo: cada item viene como .item-grid__container > .listing
        $cards = $crawler->filter('.item-grid__container');
        if ($cards->count() === 0) {
            $cards = $crawler->filter('.listing');
        }
        $count = 0;

        $cards->each(function (Crawler $node) use ($agency, &$count) {
            $data = $this->parseCard($node);
            if (! $data) return;

            // Idempotente: usamos el código de Laporta como referencia única
            $existing = Property::withoutGlobalScopes()
                ->where('agency_id', $agency->id)
                ->where('code', $data['code'])
                ->first();
            if ($existing) {
                return;
            }

            $property = Property::create([
                'agency_id' => $agency->id,
                'code' => $data['code'],
                'title' => $data['title'],
                'type' => $data['type'],
                'status' => 'disponible',
                'listing_type' => $data['listing_type'],
                'is_published' => true,
                'published_at' => now(),
                'bedrooms' => $data['bedrooms'],
                'bathrooms' => $data['bathrooms'],
                'area_sqm' => $data['area_sqm'],
                'address' => $data['address'],
                'city' => $data['city'],
                'province' => $data['city'] ?: 'Chile',
                'country' => 'CL',
                'price_rent' => $data['price_rent'],
                'price_sale' => $data['price_sale'],
                'features' => ['publicacion_automatica'],
                'tags' => array_filter([$data['city'], $data['type']]),
                'cover_image_url' => $data['image'],
            ]);

            // Descargar imagen a media library si --with-images
            if ($this->option('with-images') && $data['image']) {
                try {
                    $property->addMediaFromUrl($data['image'])
                        ->preservingOriginal()
                        ->toMediaCollection('photos');
                } catch (\Throwable $e) {
                    $this->warn("    No pude descargar imagen para {$data['code']}: ".substr($e->getMessage(), 0, 80));
                }
            }

            $count++;
            $this->line("  + {$data['code']} · {$data['title']} · {$data['city']}");
        });

        return $count;
    }

    private function parseCard(Crawler $node): ?array
    {
        try {
            // Código en .listing__favorite "COD.: 5.917"
            $codText = $node->filter('.listing__favorite')->count()
                ? trim($node->filter('.listing__favorite')->text(''))
                : '';
            $code = preg_replace('/[^0-9]/', '', $codText);
            if (! $code) return null;

            $title = trim($node->filter('h3.listing__title a')->text(''));
            $address = $node->filter('.listing__location')->count()
                ? trim($node->filter('.listing__location')->text(''))
                : '';

            // Operación: clase price-arriendo o price-venta
            $priceNode = $node->filter('.listing__price')->first();
            $priceClass = $priceNode->count() ? $priceNode->attr('class') ?? '' : '';
            $listingType = str_contains($priceClass, 'price-venta') ? 'venta' : 'alquiler';

            $type = $this->detectType($title);

            $priceText = $priceNode->count() ? trim($priceNode->text('')) : '';
            [$priceRent, $priceSale] = $this->parsePrice($priceText, $listingType);

            // Stats
            $stats = $node->filter('.listing__stats .listing__figure');
            $bedrooms = $stats->count() > 0
                ? (int) preg_replace('/[^0-9]/', '', $stats->eq(0)->text('0'))
                : 0;
            $bedrooms = max(0, min(20, $bedrooms));

            $bathrooms = $stats->count() > 1
                ? (float) preg_replace('/[^0-9]/', '', $stats->eq(1)->text('0'))
                : 0;
            $bathrooms = max(0, min(10, $bathrooms));
            $areaSqm = null;
            if ($stats->count() > 2) {
                preg_match('/(\d+)/', $stats->eq(2)->text(''), $am);
                $areaSqm = isset($am[1]) ? (int) $am[1] : null;
            }

            $image = $node->filter('img.listing__img')->count()
                ? $node->filter('img.listing__img')->attr('src')
                : null;

            // Comuna desde el título: "Departamento en Concón"
            $city = preg_match('/\sen\s+(.+?)$/i', $title, $m)
                ? trim($m[1])
                : ($address ?: 'Santiago');

            return [
                'code' => 'LP-'.$code,
                'title' => $title,
                'type' => $type,
                'listing_type' => $listingType,
                'address' => $address ?: $title,
                'city' => $city,
                'bedrooms' => $bedrooms,
                'bathrooms' => $bathrooms ?: 1,
                'area_sqm' => $areaSqm,
                'price_rent' => $priceRent,
                'price_sale' => $priceSale,
                'image' => $image,
            ];
        } catch (\Throwable $e) {
            $this->warn('  Error parseando card: '.$e->getMessage());
            return null;
        }
    }

    private function detectType(string $title): string
    {
        $t = Str::lower($title);
        return match (true) {
            str_contains($t, 'departamento') || str_contains($t, 'depto') => 'apartamento',
            str_contains($t, 'casa') => 'casa',
            str_contains($t, 'oficina') => 'oficina',
            str_contains($t, 'local') || str_contains($t, 'comercial') => 'local',
            str_contains($t, 'parking') || str_contains($t, 'estacion') => 'parking',
            str_contains($t, 'bodega') || str_contains($t, 'trastero') => 'trastero',
            default => 'apartamento',
        };
    }

    /**
     * "$480.000" → rent 480000
     * "UF 6.700" → sale (1 UF ≈ 38500 CLP estimado abril 2026)
     */
    private function parsePrice(string $text, string $listingType): array
    {
        $text = preg_replace('/\s+/', ' ', trim($text));

        if (str_contains(strtolower($text), 'uf')) {
            preg_match('/uf\s*([\d.,]+)/i', $text, $m);
            $uf = isset($m[1]) ? (float) str_replace(['.', ','], ['', '.'], $m[1]) : 0;
            $clp = $uf * 38500;
            return $listingType === 'venta'
                ? [null, round($clp, 2)]
                : [round($clp, 2), null];
        }

        preg_match('/[\$]?\s*([\d.,]+)/', $text, $m);
        $amount = isset($m[1]) ? (float) str_replace(['.', ','], ['', '.'], $m[1]) : 0;

        return $listingType === 'venta'
            ? [null, round($amount, 2)]
            : [round($amount, 2), null];
    }
}
