<?php

namespace App\Console\Commands;

use App\Models\Property;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class SeedPropertyLocationsCommand extends Command
{
    protected $signature = 'properties:seed-locations
                            {--force : Sobrescribir las que ya tienen coordenadas}';

    protected $description = 'Asigna coordenadas dummy en Valencia a propiedades sin location';

    /**
     * Centro de cada barrio de Valencia para distribuir las propiedades.
     */
    private array $neighborhoods = [
        'Russafa' => [39.4626, -0.3736],
        'Eixample' => [39.4690, -0.3728],
        'Centro' => [39.4750, -0.3754],
        'Cabanyal' => [39.4683, -0.3300],
        'Patacona' => [39.4837, -0.3258],
        'Mestalla' => [39.4757, -0.3580],
        'Benimaclet' => [39.4878, -0.3578],
        'Plaza España' => [39.4622, -0.3838],
        'Sorní' => [39.4670, -0.3680],
        'Carmen' => [39.4795, -0.3810],
    ];

    public function handle(): int
    {
        $force = (bool) $this->option('force');

        $query = Property::query();
        if (! $force) {
            $query->whereRaw('location IS NULL');
        }

        $total = $query->count();
        if ($total === 0) {
            $this->info('Todas las propiedades ya tienen coordenadas. Usa --force para sobrescribir.');

            return self::SUCCESS;
        }

        $bar = $this->output->createProgressBar($total);
        $bar->start();

        $updated = 0;
        $query->chunk(100, function ($properties) use (&$updated, $bar) {
            foreach ($properties as $property) {
                // Detectar barrio del título o asignar uno random
                $neighborhood = collect($this->neighborhoods)
                    ->keys()
                    ->first(fn ($name) => stripos($property->title, $name) !== false);

                if (! $neighborhood) {
                    $neighborhood = array_rand($this->neighborhoods);
                }

                [$baseLat, $baseLng] = $this->neighborhoods[$neighborhood];

                // Spread aleatorio de ~600m alrededor del centro del barrio
                $lat = $baseLat + (mt_rand(-60, 60) / 10000);
                $lng = $baseLng + (mt_rand(-60, 60) / 10000);

                DB::statement(
                    "UPDATE properties SET location = ST_SetSRID(ST_MakePoint(?, ?), 4326) WHERE id = ?",
                    [$lng, $lat, $property->id],
                );
                $updated++;
                $bar->advance();
            }
        });

        $bar->finish();
        $this->newLine();
        $this->info("✓ {$updated} propiedades geolocalizadas en Valencia.");

        return self::SUCCESS;
    }
}
