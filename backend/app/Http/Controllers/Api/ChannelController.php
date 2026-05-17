<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AgencyChannel;
use App\Models\Channel;
use App\Models\ChannelPublication;
use App\Models\Property;
use App\Services\Channels\ChannelManager;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

/**
 * Hub de Canales — API genérica de publicación multi-portal.
 *
 * Reemplaza progresivamente a MlPropertyController: en vez de endpoints por
 * integración, una sola superficie `{property}/channels/{channel}/...` que
 * delega en el driver correspondiente vía ChannelManager.
 */
class ChannelController extends Controller
{
    public function __construct(private readonly ChannelManager $manager) {}

    /** GET /api/channels — catálogo de canales + estado de conexión de la agencia. */
    public function index(): JsonResponse
    {
        $channels = Channel::orderBy('sort_order')->get();
        $connections = AgencyChannel::where('agency_id', auth()->user()->agency_id)
            ->get()->keyBy('channel_id');

        return response()->json([
            'data' => $channels
                ->map(fn (Channel $c) => $this->shapeChannel($c, $connections->get($c->id)))
                ->all(),
        ]);
    }

    /**
     * POST /api/channels/{channel}/connect — conecta un canal de tipo feed/aggregator.
     * Los canales OAuth (Mercado Libre) se conectan por su propio flujo.
     */
    public function connect(Channel $channel): JsonResponse
    {
        if ($channel->supports_oauth) {
            return response()->json([
                'message' => "{$channel->name} se conecta por su flujo OAuth, no desde acá.",
            ], 422);
        }

        $conn = AgencyChannel::updateOrCreate(
            ['agency_id' => auth()->user()->agency_id, 'channel_id' => $channel->id],
            [
                'status' => AgencyChannel::STATUS_CONNECTED,
                'connected_by_user_id' => auth()->id(),
                'connected_at' => now(),
                'credentials' => ['feed_token' => (string) Str::uuid()],
                'last_error' => null,
            ],
        );

        return response()->json(['data' => $this->shapeChannel($channel, $conn)]);
    }

    /** DELETE /api/channels/{channel}/disconnect */
    public function disconnect(Channel $channel): JsonResponse
    {
        AgencyChannel::where('agency_id', auth()->user()->agency_id)
            ->where('channel_id', $channel->id)
            ->delete();

        return response()->json(['ok' => true]);
    }

    /** GET /api/properties/{property}/publications — estado de la propiedad en cada canal. */
    public function publications(Property $property): JsonResponse
    {
        $channels = Channel::orderBy('sort_order')->get();
        $pubs = ChannelPublication::where('property_id', $property->id)
            ->get()->keyBy('channel_id');
        $connections = AgencyChannel::where('agency_id', $property->agency_id)
            ->get()->keyBy('channel_id');

        return response()->json([
            'data' => $channels->map(fn (Channel $c) => [
                'channel' => $this->shapeChannel($c, $connections->get($c->id)),
                'publication' => ($p = $pubs->get($c->id)) ? $this->shapePublication($p) : null,
            ])->all(),
        ]);
    }

    /** POST /api/properties/{property}/channels/{channel}/publish */
    public function publish(Request $request, Property $property, Channel $channel): JsonResponse
    {
        $options = $request->validate([
            'listing_type_id' => ['nullable', 'string', 'max:32'],
        ]);

        if ($err = $this->guard($property, $channel)) {
            return $err;
        }

        try {
            $pub = $this->manager->driver($channel->slug)->publish(
                $property,
                $this->manager->connection($property->agency_id, $channel->slug),
                $options,
            );
        } catch (\Throwable $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        return response()->json(['data' => $this->shapePublication($pub)]);
    }

    /** PATCH /api/properties/{property}/channels/{channel}/status */
    public function setStatus(Request $request, Property $property, Channel $channel): JsonResponse
    {
        $data = $request->validate([
            'status' => ['required', 'in:published,paused,closed'],
        ]);

        if ($err = $this->guard($property, $channel)) {
            return $err;
        }

        $publication = $this->publicationFor($property, $channel);
        if (! $publication) {
            return response()->json(['message' => 'La propiedad no está publicada en este canal.'], 422);
        }

        try {
            $pub = $this->manager->driver($channel->slug)->setStatus(
                $property,
                $publication,
                $this->manager->connection($property->agency_id, $channel->slug),
                $data['status'],
            );
        } catch (\Throwable $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        return response()->json(['data' => $this->shapePublication($pub)]);
    }

    /** POST /api/properties/{property}/channels/{channel}/sync — re-sincroniza la publicación. */
    public function sync(Property $property, Channel $channel): JsonResponse
    {
        if ($err = $this->guard($property, $channel)) {
            return $err;
        }

        $publication = $this->publicationFor($property, $channel);
        if (! $publication) {
            return response()->json(['message' => 'La propiedad no está publicada en este canal.'], 422);
        }

        try {
            $pub = $this->manager->driver($channel->slug)->update(
                $property,
                $publication,
                $this->manager->connection($property->agency_id, $channel->slug),
            );
        } catch (\Throwable $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        return response()->json(['data' => $this->shapePublication($pub)]);
    }

    /** DELETE /api/properties/{property}/channels/{channel} — baja la publicación. */
    public function unpublish(Property $property, Channel $channel): JsonResponse
    {
        if ($err = $this->guard($property, $channel)) {
            return $err;
        }

        $publication = $this->publicationFor($property, $channel);
        if (! $publication) {
            return response()->json(['ok' => true]);
        }

        try {
            $this->manager->driver($channel->slug)->unpublish(
                $property,
                $publication,
                $this->manager->connection($property->agency_id, $channel->slug),
            );
        } catch (\Throwable $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        return response()->json(['ok' => true]);
    }

    /** Valida que el canal tenga driver implementado y la agencia esté conectada. */
    private function guard(Property $property, Channel $channel): ?JsonResponse
    {
        if (! $this->manager->hasDriver($channel->slug)) {
            return response()->json([
                'message' => "El canal {$channel->name} todavía no está disponible.",
            ], 422);
        }

        $conn = $this->manager->connection($property->agency_id, $channel->slug);
        if (! $conn || ! $conn->isConnected()) {
            return response()->json([
                'message' => "Conectá {$channel->name} antes de publicar.",
            ], 422);
        }

        return null;
    }

    private function publicationFor(Property $property, Channel $channel): ?ChannelPublication
    {
        return ChannelPublication::where('property_id', $property->id)
            ->where('channel_id', $channel->id)
            ->first();
    }

    private function shapeChannel(Channel $c, ?AgencyChannel $conn): array
    {
        return [
            'id' => $c->id,
            'slug' => $c->slug,
            'name' => $c->name,
            'kind' => $c->kind,
            'description' => $c->description,
            'is_active' => $c->is_active,
            'supports_oauth' => $c->supports_oauth,
            'has_driver' => $this->manager->hasDriver($c->slug),
            'connection' => $conn ? [
                'status' => $conn->status,
                'external_account_id' => $conn->external_account_id,
                'connected_at' => $conn->connected_at,
                'last_synced_at' => $conn->last_synced_at,
                'last_error' => $conn->last_error,
            ] : null,
        ];
    }

    private function shapePublication(ChannelPublication $p): array
    {
        return [
            'id' => $p->id,
            'channel_id' => $p->channel_id,
            'property_id' => $p->property_id,
            'external_id' => $p->external_id,
            'external_url' => $p->external_url,
            'status' => $p->status,
            'external_status' => $p->external_status,
            'last_synced_at' => $p->last_synced_at,
            'published_at' => $p->published_at,
            'last_error' => $p->last_error,
        ];
    }
}
