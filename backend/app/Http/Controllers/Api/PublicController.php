<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Agency;
use App\Models\Lead;
use App\Models\LeadActivity;
use App\Models\Pipeline;
use App\Models\Property;
use App\Services\NotificationService;
use App\Services\PlanGate;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

/**
 * Endpoints públicos del escaparate de cada agencia (sin auth).
 * Sirven el listing público y reciben leads desde el formulario de contacto.
 */
class PublicController extends Controller
{
    public function agency(string $slug): JsonResponse
    {
        $agency = Agency::where('slug', $slug)->where('active', true)->firstOrFail();

        return response()->json([
            'data' => [
                'name' => $agency->name,
                'slug' => $agency->slug,
                'phone' => $agency->phone,
                'email' => $agency->email,
                'address' => $agency->address,
                'city' => $agency->city,
                'logo_url' => $agency->logo_url,
                'properties_count' => Property::withoutGlobalScopes()
                    ->where('agency_id', $agency->id)
                    ->where('is_published', true)
                    ->where('status', 'disponible')
                    ->count(),
                'template' => [
                    'preset' => $agency->public_template_preset ?? 'modern_loft',
                    'primary_color' => $agency->public_primary_color ?? '#f85757',
                    'font' => $agency->public_font ?? 'sans',
                    'config' => $agency->publicTemplateConfig(),
                ],
            ],
        ]);
    }

    public function index(Request $request, string $slug): JsonResponse
    {
        $agency = Agency::where('slug', $slug)->where('active', true)->firstOrFail();

        $q = Property::withoutGlobalScopes()
            ->where('agency_id', $agency->id)
            ->where('is_published', true)
            ->where('status', 'disponible')
            ->select('properties.*')
            ->selectRaw('ST_Y(location::geometry) AS lat, ST_X(location::geometry) AS lng');

        if ($search = $request->string('search')->toString()) {
            $q->where(function ($w) use ($search) {
                $w->where('title', 'ilike', "%{$search}%")
                    ->orWhere('address', 'ilike', "%{$search}%");
            });
        }
        foreach (['type', 'listing_type', 'city'] as $col) {
            if ($val = $request->string($col)->toString()) {
                $q->where($col, $val);
            }
        }
        if ($min = $request->integer('min_price')) {
            $q->where('price_rent', '>=', $min);
        }
        if ($max = $request->integer('max_price')) {
            $q->where('price_rent', '<=', $max);
        }
        if ($beds = $request->integer('bedrooms_min')) {
            $q->where('bedrooms', '>=', $beds);
        }

        $sort = $request->string('sort', 'published_at')->toString();
        $allowed = ['published_at', 'price_rent', 'area_sqm'];
        if (! in_array($sort, $allowed, true)) {
            $sort = 'published_at';
        }
        $dir = $request->string('dir', 'desc')->toString() === 'asc' ? 'asc' : 'desc';
        $q->orderBy($sort, $dir);

        $perPage = min(max((int) $request->integer('per_page', 12), 4), 48);
        $paginated = $q->paginate($perPage);

        return response()->json([
            'data' => $paginated->items() ? collect($paginated->items())->map(fn ($p) => $this->shape($p))->all() : [],
            'meta' => [
                'current_page' => $paginated->currentPage(),
                'last_page' => $paginated->lastPage(),
                'per_page' => $paginated->perPage(),
                'total' => $paginated->total(),
            ],
        ]);
    }

    public function show(string $slug, int $id): JsonResponse
    {
        $agency = Agency::where('slug', $slug)->where('active', true)->firstOrFail();

        $property = Property::withoutGlobalScopes()
            ->where('agency_id', $agency->id)
            ->where('is_published', true)
            ->where('id', $id)
            ->select('properties.*')
            ->selectRaw('ST_Y(location::geometry) AS lat, ST_X(location::geometry) AS lng')
            ->firstOrFail();

        // Tracking de vistas: incrementar contador (sin tocar updated_at)
        Property::withoutGlobalScopes()
            ->where('id', $property->id)
            ->update([
                'view_count' => DB::raw('view_count + 1'),
                'last_viewed_at' => now(),
            ]);

        // Galería de fotos
        $photos = $property->getMedia('photos')->map(fn ($m) => [
            'id' => $m->id,
            'url' => $m->getFullUrl(),
        ])->values();

        $data = $this->shape($property);
        $data['photos'] = $photos;
        $data['description'] = $property->description;
        $data['features'] = $property->features ?? [];
        $data['tags'] = $property->tags ?? [];
        $data['tour_url'] = $property->tour_url;
        $data['video_url'] = $property->video_url;
        $data['booking_enabled'] = (bool) $property->booking_enabled;
        $data['booking_provider'] = $property->booking_provider;
        $data['booking_url'] = $property->booking_url;

        return response()->json(['data' => $data]);
    }

    public function alliances(string $slug): JsonResponse
    {
        $agency = Agency::where('slug', $slug)->where('active', true)->firstOrFail();

        $rows = \App\Models\Alliance::withoutGlobalScopes()
            ->where('agency_id', $agency->id)
            ->where('is_published', true)
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get()
            ->map(fn ($a) => [
                'id' => $a->id,
                'name' => $a->name,
                'logo_url' => $a->logo_url,
                'description' => $a->description,
                'benefit_title' => $a->benefit_title,
                'benefit_image_url' => $a->benefit_image_url,
                'benefit_detail' => $a->benefit_detail,
                'phone' => $a->phone,
                'whatsapp' => $a->whatsapp,
                'instagram' => $a->instagram,
                'website_url' => $a->website_url,
            ]);

        return response()->json(['data' => $rows]);
    }

    public function storeLead(Request $request, string $slug): JsonResponse
    {
        $agency = Agency::where('slug', $slug)->where('active', true)->firstOrFail();

        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:160'],
            'phone' => ['nullable', 'string', 'max:30'],
            'message' => ['nullable', 'string', 'max:1000'],
            'property_id' => ['nullable', 'integer'],
        ]);

        // 1. Pipeline: prefer default, fallback to any pipeline of the agency
        $pipeline = Pipeline::withoutGlobalScopes()
            ->where('agency_id', $agency->id)
            ->orderByDesc('is_default')
            ->orderBy('position')
            ->with(['stages' => fn ($q) => $q->orderBy('position')])
            ->first();

        if (! $pipeline) {
            Log::warning('Public lead rejected: agency has no pipeline', [
                'agency_id' => $agency->id,
                'agency_slug' => $agency->slug,
            ]);
            return response()->json([
                'message' => 'La agencia no tiene un pipeline configurado para recibir leads. Contacta directamente a la agencia.',
            ], 422);
        }

        $firstStage = $pipeline->stages->first();
        if (! $firstStage) {
            Log::warning('Public lead rejected: pipeline has no stages', [
                'agency_id' => $agency->id,
                'pipeline_id' => $pipeline->id,
            ]);
            return response()->json([
                'message' => 'El pipeline no tiene stages configurados. Contacta directamente a la agencia.',
            ], 422);
        }

        // 2. Property opcional pero validada
        $property = null;
        if (! empty($data['property_id'])) {
            $property = Property::withoutGlobalScopes()
                ->where('agency_id', $agency->id)
                ->where('is_published', true)
                ->where('id', $data['property_id'])
                ->first();
        }

        // 3. Dedupe: si hay un lead abierto del mismo email para la misma property en las últimas 24h,
        //    añadir actividad en vez de crear otro.
        $existing = Lead::withoutGlobalScopes()
            ->where('agency_id', $agency->id)
            ->where('contact_email', $data['email'])
            ->where('status', 'open')
            ->when($property, fn ($q) => $q->where('property_id', $property->id))
            ->where('created_at', '>=', now()->subDay())
            ->first();

        if ($existing) {
            LeadActivity::create([
                'agency_id' => $agency->id,
                'lead_id' => $existing->id,
                'type' => 'note',
                'title' => 'Mensaje adicional desde el escaparate',
                'body' => $data['message'] ?? '(sin mensaje)',
                'occurred_at' => now(),
            ]);
            $existing->update(['last_activity_at' => now()]);

            return response()->json([
                'ok' => true,
                'lead_code' => $existing->code,
                'deduped' => true,
            ], 200);
        }

        // 4. Calcular position al final del stage
        $position = (int) Lead::withoutGlobalScopes()
            ->where('stage_id', $firstStage->id)
            ->max('position') + 1;

        // 5. Valor del lead: rent o sale según el listing
        $leadValue = 0;
        if ($property) {
            $leadValue = (float) ($property->price_rent ?? $property->price_sale ?? 0);
        }

        $lead = DB::transaction(function () use ($agency, $pipeline, $firstStage, $property, $data, $leadValue, $position) {
            $lead = Lead::create([
                'agency_id' => $agency->id,
                'pipeline_id' => $pipeline->id,
                'stage_id' => $firstStage->id,
                'position' => $position,
                'property_id' => $property?->id,
                'code' => 'L-'.strtoupper(Str::random(6)),
                'title' => $property
                    ? "Interesado en {$property->title}"
                    : "Contacto desde web — {$data['name']}",
                'contact_name' => $data['name'],
                'contact_email' => $data['email'],
                'contact_phone' => $data['phone'] ?? null,
                'source' => 'web',
                'value' => $leadValue,
                'probability_pct' => 20,
                'last_activity_at' => now(),
                'status' => 'open',
                'notes' => $data['message'] ?? null,
            ]);

            LeadActivity::create([
                'agency_id' => $agency->id,
                'lead_id' => $lead->id,
                'type' => 'note',
                'title' => 'Lead capturado desde el escaparate público',
                'body' => $data['message'] ?? null,
                'occurred_at' => now(),
            ]);

            return $lead;
        });

        // 6. Notificar — pero NUNCA romper la creación del lead si la notificación falla
        try {
            NotificationService::leadCreated($lead);
        } catch (\Throwable $e) {
            Log::error('NotificationService::leadCreated failed', [
                'lead_id' => $lead->id,
                'error' => $e->getMessage(),
            ]);
        }

        // 7. Aviso suave si la agencia ya pasó del límite del plan — capturamos el lead igualmente
        //    porque rechazar a un visitante público sería perder negocio.
        $check = PlanGate::canCreateLead($agency);
        if (! ($check['allowed'] ?? true)) {
            Log::warning('Public lead captured beyond plan limit', [
                'agency_id' => $agency->id,
                'lead_id' => $lead->id,
                'limit' => $check['limit'] ?? null,
                'current' => $check['current'] ?? null,
            ]);
        }

        return response()->json([
            'ok' => true,
            'lead_code' => $lead->code,
            'deduped' => false,
        ], 201);
    }

    private function shape(Property $p): array
    {
        return [
            'id' => (int) $p->id,
            'code' => (string) $p->code,
            'title' => (string) $p->title,
            'type' => (string) $p->type,
            'status' => (string) $p->status,
            'listing_type' => (string) $p->listing_type,
            'bedrooms' => (int) $p->bedrooms,
            'bathrooms' => (float) $p->bathrooms,
            'area_sqm' => $p->area_sqm !== null ? (int) $p->area_sqm : null,
            'floor' => $p->floor,
            'door' => $p->door,
            'address' => (string) $p->address,
            'city' => (string) $p->city,
            'province' => $p->province,
            'postal_code' => $p->postal_code !== null ? (string) $p->postal_code : null,
            'price_rent' => $p->price_rent !== null ? (float) $p->price_rent : null,
            'price_sale' => $p->price_sale !== null ? (float) $p->price_sale : null,
            'community_fee' => $p->community_fee !== null ? (float) $p->community_fee : null,
            'cover_image_url' => $p->cover_image_url ?: null,
            'features' => is_array($p->features) ? $p->features : [],
            'tags' => is_array($p->tags) ? $p->tags : [],
            'lat' => isset($p->lat) ? (float) $p->lat : null,
            'lng' => isset($p->lng) ? (float) $p->lng : null,

            // Características
            'parking_spaces' => $p->parking_spaces !== null ? (int) $p->parking_spaces : null,
            'year_built' => $p->year_built !== null ? (int) $p->year_built : null,
            'orientation' => $p->orientation,
            'floors_count' => $p->floors_count !== null ? (int) $p->floors_count : null,
            'units_per_floor' => $p->units_per_floor !== null ? (int) $p->units_per_floor : null,
            'terrace_sqm' => $p->terrace_sqm !== null ? (int) $p->terrace_sqm : null,
            'built_sqm' => $p->built_sqm !== null ? (int) $p->built_sqm : null,

            // Interior
            'condition' => $p->condition,
            'suites_count' => $p->suites_count !== null ? (int) $p->suites_count : null,
            'service_rooms' => $p->service_rooms !== null ? (int) $p->service_rooms : null,
            'living_rooms' => $p->living_rooms !== null ? (int) $p->living_rooms : null,
            'service_bathrooms' => $p->service_bathrooms !== null ? (int) $p->service_bathrooms : null,
            'floor_type' => $p->floor_type,
            'gas_type' => $p->gas_type,
            'has_termopanel' => $p->has_termopanel === null ? null : (bool) $p->has_termopanel,
            'hot_water_type' => $p->hot_water_type,
            'heating_type' => $p->heating_type,
            'kitchen_type' => $p->kitchen_type,
            'window_type' => $p->window_type,

            // Exterior
            'elevators_count' => $p->elevators_count !== null ? (int) $p->elevators_count : null,
            'covered_parking_spaces' => $p->covered_parking_spaces !== null ? (int) $p->covered_parking_spaces : null,
            'uncovered_parking_spaces' => $p->uncovered_parking_spaces !== null ? (int) $p->uncovered_parking_spaces : null,

            // Otros
            'apartment_subtype' => $p->apartment_subtype,
            'rooms_count' => $p->rooms_count !== null ? (int) $p->rooms_count : null,
            'max_occupants' => $p->max_occupants !== null ? (int) $p->max_occupants : null,
            'parking_sqm' => $p->parking_sqm !== null ? (int) $p->parking_sqm : null,
            'storage_count' => $p->storage_count !== null ? (int) $p->storage_count : null,
        ];
    }
}
