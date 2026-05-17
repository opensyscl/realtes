<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Agency;
use App\Models\Channel;
use App\Models\ChannelPublication;
use App\Models\Property;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;

/**
 * Property feeds para distribución a portales (Idealista, Fotocasa, etc.)
 */
class FeedController extends Controller
{
    /**
     * GET /api/feeds/{slug}/properties.json
     * Formato JSON genérico (compatible con muchos portales y agregadores).
     */
    public function json(string $slug): JsonResponse
    {
        $agency = Agency::where('slug', $slug)->where('active', true)->firstOrFail();
        $properties = $this->loadProperties($agency->id);

        return response()->json([
            'agency' => [
                'name' => $agency->name,
                'slug' => $agency->slug,
                'phone' => $agency->phone,
                'email' => $agency->email,
            ],
            'generated_at' => now()->toIso8601String(),
            'count' => $properties->count(),
            'properties' => $properties->map(fn ($p) => $this->shape($p, $agency))->values(),
        ]);
    }

    /**
     * GET /api/feeds/{slug}/idealista.xml
     * Formato XML compatible con el feed propietario de Idealista.
     */
    public function idealistaXml(string $slug): Response
    {
        $agency = Agency::where('slug', $slug)->where('active', true)->firstOrFail();
        $properties = $this->loadProperties($agency->id);

        $xml = new \SimpleXMLElement('<?xml version="1.0" encoding="UTF-8"?><idealista><properties/></idealista>');

        $root = $xml->properties;
        foreach ($properties as $p) {
            $node = $root->addChild('property');
            $node->addChild('reference', htmlspecialchars((string) $p->code));
            $node->addChild('typology', $this->mapTypology($p->type));
            $node->addChild('operation', $p->listing_type === 'venta' ? 'sale' : 'rent');
            $node->addChild('price', (string) ($p->listing_type === 'venta' ? $p->price_sale : $p->price_rent));
            $node->addChild('currency', 'EUR');

            $address = $node->addChild('address');
            $address->addChild('country', 'ES');
            $address->addChild('region', htmlspecialchars((string) ($p->province ?? 'Valencia')));
            $address->addChild('city', htmlspecialchars((string) ($p->city ?? 'Valencia')));
            $address->addChild('postcode', htmlspecialchars((string) ($p->postal_code ?? '')));
            $address->addChild('streetAddress', htmlspecialchars((string) $p->address));
            if ($p->lat && $p->lng) {
                $address->addChild('latitude', (string) $p->lat);
                $address->addChild('longitude', (string) $p->lng);
            }

            $features = $node->addChild('features');
            $features->addChild('builtArea', (string) ($p->area_sqm ?? ''));
            $features->addChild('rooms', (string) $p->bedrooms);
            $features->addChild('bathrooms', (string) $p->bathrooms);
            $features->addChild('floor', htmlspecialchars((string) ($p->floor ?? '')));

            // Características adicionales
            if ($p->features) {
                $extras = $node->addChild('extras');
                foreach ($p->features as $f) {
                    $extras->addChild('feature', htmlspecialchars((string) $f));
                }
            }

            $descNode = $node->addChild('description');
            $domNode = dom_import_simplexml($descNode);
            $domNode->appendChild($domNode->ownerDocument->createCDATASection(
                (string) ($p->description ?? $p->title),
            ));

            // Foto principal
            if ($p->cover_image_url) {
                $images = $node->addChild('images');
                $img = $images->addChild('image');
                $img->addChild('url', htmlspecialchars((string) $p->cover_image_url));
                $img->addChild('order', '1');
            }

            $contact = $node->addChild('contact');
            $contact->addChild('name', htmlspecialchars((string) $agency->name));
            if ($agency->phone) {
                $contact->addChild('phone', htmlspecialchars((string) $agency->phone));
            }
            if ($agency->email) {
                $contact->addChild('email', htmlspecialchars((string) $agency->email));
            }
        }

        return response($xml->asXML(), 200, [
            'Content-Type' => 'application/xml; charset=utf-8',
            'Cache-Control' => 'public, max-age=900', // 15 minutos
        ]);
    }

    /**
     * GET /api/feeds/{slug}/proppit.xml
     * Feed XML formato Trovit/Thribee. Proppit lo consume y redistribuye a
     * Trovit, Mitula, iCasas, Nestoria, OLX y Properati. Incluye solo las
     * propiedades publicadas al canal Proppit desde el Hub de Canales.
     */
    public function proppitXml(string $slug): Response
    {
        $agency = Agency::where('slug', $slug)->where('active', true)->firstOrFail();
        $properties = $this->loadPublishedToChannel($agency->id, Channel::PROPPIT);

        $xml = new \SimpleXMLElement('<?xml version="1.0" encoding="UTF-8"?><trovit/>');

        foreach ($properties as $p) {
            $isSale = $p->listing_type === 'venta';
            $ad = $xml->addChild('ad');

            $ad->addChild('id', htmlspecialchars((string) $p->code));
            $this->cdata($ad->addChild('url'), $this->publicUrl($agency, $p));
            $this->cdata($ad->addChild('title'), (string) $p->title);
            $this->cdata($ad->addChild('content'), (string) ($p->description ?? $p->title));
            $ad->addChild('price', (string) (int) ($isSale ? $p->price_sale : $p->price_rent));
            $ad->addChild('type', $isSale ? 'For Sale' : 'For Rent');
            $this->cdata($ad->addChild('property_type'), $this->mapTrovitType((string) $p->type));
            $this->cdata($ad->addChild('city'), (string) ($p->city ?? ''));
            $this->cdata($ad->addChild('region'), (string) ($p->province ?? ''));
            $ad->addChild('postcode', htmlspecialchars((string) ($p->postal_code ?? '')));
            $this->cdata($ad->addChild('address'), (string) $p->address);

            if ($p->lat && $p->lng) {
                $ad->addChild('latitude', (string) $p->lat);
                $ad->addChild('longitude', (string) $p->lng);
            }

            $floorArea = $ad->addChild('floor_area', (string) (int) ($p->area_sqm ?? 0));
            $floorArea->addAttribute('unit', 'meters');
            $ad->addChild('rooms', (string) $p->bedrooms);
            $ad->addChild('bathrooms', (string) $p->bathrooms);

            if ($p->cover_image_url) {
                $pictures = $ad->addChild('pictures');
                $this->cdata(
                    $pictures->addChild('picture')->addChild('picture_url'),
                    (string) $p->cover_image_url,
                );
            }

            $this->cdata($ad->addChild('agency'), (string) $agency->name);
            $ad->addChild('by_owner', '0');
            $this->cdata(
                $ad->addChild('date'),
                optional($p->created_at)->format('d/m/Y H:i:s') ?? now()->format('d/m/Y H:i:s'),
            );
        }

        return response($xml->asXML(), 200, [
            'Content-Type' => 'application/xml; charset=utf-8',
            'Cache-Control' => 'public, max-age=900', // 15 minutos
        ]);
    }

    private function loadProperties(int $agencyId)
    {
        return Property::withoutGlobalScopes()
            ->where('agency_id', $agencyId)
            ->where('is_published', true)
            ->where('status', 'disponible')
            ->select([
                'id', 'code', 'title', 'type', 'status', 'listing_type', 'description',
                'address', 'city', 'province', 'postal_code', 'country',
                'price_rent', 'price_sale', 'community_fee', 'ibi_annual',
                'bedrooms', 'bathrooms', 'area_sqm', 'floor', 'door',
                'features', 'tags', 'cover_image_url', 'created_at', 'published_at',
                DB::raw('ST_Y(location::geometry) AS lat'),
                DB::raw('ST_X(location::geometry) AS lng'),
            ])
            ->limit(2000)
            ->get();
    }

    private function shape(Property $p, Agency $agency): array
    {
        return [
            'reference' => $p->code,
            'title' => $p->title,
            'type' => $p->type,
            'operation' => $p->listing_type,
            'price' => $p->listing_type === 'venta'
                ? (float) ($p->price_sale ?? 0)
                : (float) ($p->price_rent ?? 0),
            'currency' => 'EUR',
            'address' => [
                'street' => $p->address,
                'city' => $p->city,
                'province' => $p->province,
                'postal_code' => $p->postal_code,
                'country' => $p->country,
                'lat' => $p->lat ? (float) $p->lat : null,
                'lng' => $p->lng ? (float) $p->lng : null,
            ],
            'features' => [
                'rooms' => (int) $p->bedrooms,
                'bathrooms' => (float) $p->bathrooms,
                'built_area_sqm' => $p->area_sqm,
                'floor' => $p->floor,
                'extras' => $p->features ?? [],
            ],
            'description' => $p->description,
            'cover_image_url' => $p->cover_image_url,
            'community_fee' => $p->community_fee !== null ? (float) $p->community_fee : null,
            'ibi_annual' => $p->ibi_annual !== null ? (float) $p->ibi_annual : null,
            'published_at' => optional($p->published_at)->toIso8601String(),
            'contact' => [
                'name' => $agency->name,
                'phone' => $agency->phone,
                'email' => $agency->email,
            ],
        ];
    }

    private function mapTypology(string $type): string
    {
        return match ($type) {
            'apartamento', 'piso' => 'flat',
            'casa', 'chalet' => 'house',
            'oficina' => 'office',
            'local' => 'commercial',
            'parking' => 'garage',
            'trastero' => 'storage',
            default => 'other',
        };
    }

    /** Propiedades publicadas a un canal del Hub (channel_publications status=published). */
    private function loadPublishedToChannel(int $agencyId, string $channelSlug)
    {
        $channel = Channel::where('slug', $channelSlug)->first();
        if (! $channel) {
            return collect();
        }

        $propertyIds = ChannelPublication::where('channel_id', $channel->id)
            ->where('agency_id', $agencyId)
            ->where('status', ChannelPublication::STATUS_PUBLISHED)
            ->pluck('property_id');

        return Property::withoutGlobalScopes()
            ->where('agency_id', $agencyId)
            ->whereIn('id', $propertyIds)
            ->where('status', 'disponible')
            ->select([
                'id', 'code', 'title', 'type', 'status', 'listing_type', 'description',
                'address', 'city', 'province', 'postal_code', 'country',
                'price_rent', 'price_sale',
                'bedrooms', 'bathrooms', 'area_sqm',
                'cover_image_url', 'created_at',
                DB::raw('ST_Y(location::geometry) AS lat'),
                DB::raw('ST_X(location::geometry) AS lng'),
            ])
            ->limit(2000)
            ->get();
    }

    /** URL del aviso en el escaparate público de la agencia. */
    private function publicUrl(Agency $agency, Property $p): string
    {
        $base = rtrim((string) env('FRONTEND_URL', 'http://localhost:3001'), '/');

        return "{$base}/p/{$agency->slug}/{$p->id}";
    }

    /** Tipo de propiedad legible para Chile (Trovit acepta texto libre). */
    private function mapTrovitType(string $type): string
    {
        return match ($type) {
            'apartamento', 'piso' => 'Departamento',
            'casa', 'chalet' => 'Casa',
            'oficina' => 'Oficina',
            'local' => 'Local comercial',
            'parking' => 'Estacionamiento',
            'trastero' => 'Bodega',
            default => 'Propiedad',
        };
    }

    /** Inserta texto como CDATA — SimpleXMLElement no tiene addCData(). */
    private function cdata(\SimpleXMLElement $node, string $text): void
    {
        $dom = dom_import_simplexml($node);
        $dom->appendChild($dom->ownerDocument->createCDATASection($text));
    }
}
