<?php

namespace Database\Seeders;

use App\Models\AgencyChannel;
use App\Models\Channel;
use App\Models\ChannelPublication;
use App\Models\Property;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

/**
 * Data demo del Hub de Canales.
 *
 * Conecta Mercado Libre (y Proppit) a cada agencia con propiedades y siembra
 * channel_publications en estados variados (publicado, pausado, sincronizando,
 * error, borrador) para poder ver la card "Publicar en canales" poblada.
 *
 * Es independiente del seed principal y idempotente — corrélo cuando quieras:
 *   php artisan db:seed --class=ChannelsDemoSeeder
 *
 * NOTA: las credenciales son falsas ("DEMO-..."). Publicar de verdad contra ML
 * fallaría — el seeder sirve para ver datos, no para sincronizar con el portal.
 */
class ChannelsDemoSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $ml = Channel::where('slug', Channel::MERCADOLIBRE)->first();
        $proppit = Channel::where('slug', Channel::PROPPIT)->first();

        if (! $ml) {
            $this->command->warn('Canales no migrados — corré `php artisan migrate` primero.');
            return;
        }

        $agencyIds = Property::withoutGlobalScopes()
            ->select('agency_id')->distinct()->pluck('agency_id');

        $publicationsSeeded = 0;

        foreach ($agencyIds as $agencyId) {
            $mlUserId = (string) fake()->numberBetween(100000000, 999999999);

            AgencyChannel::withoutGlobalScopes()->updateOrCreate(
                ['agency_id' => $agencyId, 'channel_id' => $ml->id],
                [
                    'status' => AgencyChannel::STATUS_CONNECTED,
                    'credentials' => [
                        'access_token' => 'DEMO-'.fake()->sha1(),
                        'refresh_token' => 'DEMO-'.fake()->sha1(),
                        'token_type' => 'bearer',
                        'scope' => 'offline_access read write',
                        'expires_at' => now()->addHours(5)->toIso8601String(),
                        'ml_user_id' => $mlUserId,
                    ],
                    'settings' => ['default_listing_type' => 'auto', 'confirm_before_charge' => true],
                    'external_account_id' => $mlUserId,
                    'connected_at' => now()->subDays(fake()->numberBetween(3, 40)),
                    'last_synced_at' => now()->subMinutes(fake()->numberBetween(2, 600)),
                ],
            );

            if ($proppit) {
                $connected = fake()->boolean(60);
                AgencyChannel::withoutGlobalScopes()->updateOrCreate(
                    ['agency_id' => $agencyId, 'channel_id' => $proppit->id],
                    [
                        'status' => $connected
                            ? AgencyChannel::STATUS_CONNECTED
                            : AgencyChannel::STATUS_DISCONNECTED,
                        'credentials' => $connected ? ['feed_token' => fake()->uuid()] : null,
                        'connected_at' => $connected ? now()->subDays(fake()->numberBetween(1, 20)) : null,
                    ],
                );
            }

            $properties = Property::withoutGlobalScopes()
                ->where('agency_id', $agencyId)
                ->inRandomOrder()->limit(14)->get();

            // Mezcla de estados representativa del ciclo de vida del Hub.
            $statuses = [
                ChannelPublication::STATUS_PUBLISHED,
                ChannelPublication::STATUS_PUBLISHED,
                ChannelPublication::STATUS_PUBLISHED,
                ChannelPublication::STATUS_PUBLISHED,
                ChannelPublication::STATUS_PAUSED,
                ChannelPublication::STATUS_SYNCING,
                ChannelPublication::STATUS_ERROR,
            ];

            foreach ($properties as $i => $property) {
                $status = $statuses[$i % count($statuses)];
                $isLive = in_array($status, [
                    ChannelPublication::STATUS_PUBLISHED,
                    ChannelPublication::STATUS_PAUSED,
                ], true);
                $hasItem = $isLive || $status === ChannelPublication::STATUS_SYNCING;
                $itemId = 'MLC'.fake()->numberBetween(100000000, 999999999);

                ChannelPublication::withoutGlobalScopes()->updateOrCreate(
                    ['property_id' => $property->id, 'channel_id' => $ml->id],
                    [
                        'agency_id' => $agencyId,
                        'external_id' => $hasItem ? $itemId : null,
                        'external_url' => $isLive ? "https://articulo.mercadolibre.cl/{$itemId}" : null,
                        'status' => $status,
                        'external_status' => match ($status) {
                            ChannelPublication::STATUS_PUBLISHED => 'active',
                            ChannelPublication::STATUS_PAUSED => 'paused',
                            ChannelPublication::STATUS_SYNCING => 'under_review',
                            default => null,
                        },
                        'category_external_id' => 'MLC'.fake()->numberBetween(1000, 9999),
                        'meta' => ['listing_type_id' => fake()->randomElement(['free', 'gold_special', 'gold_premium'])],
                        'last_synced_at' => $status === ChannelPublication::STATUS_ERROR
                            ? now()->subMinutes(fake()->numberBetween(5, 120))
                            : now()->subMinutes(fake()->numberBetween(3, 1440)),
                        'published_at' => $isLive ? now()->subDays(fake()->numberBetween(1, 30)) : null,
                        'last_error' => $status === ChannelPublication::STATUS_ERROR
                            ? 'ML POST /items → HTTP 400: el título supera los 60 caracteres permitidos.'
                            : null,
                    ],
                );
                $publicationsSeeded++;
            }
        }

        $this->command->info("✓ Hub de Canales: {$agencyIds->count()} agencias conectadas, {$publicationsSeeded} publicaciones demo sembradas.");
    }
}
