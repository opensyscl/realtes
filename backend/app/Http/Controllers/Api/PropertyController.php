<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePropertyRequest;
use App\Http\Resources\PropertyResource;
use App\Models\Charge;
use App\Models\Contract;
use App\Models\MaintenanceTicket;
use App\Models\Payment;
use App\Models\Property;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PropertyController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        // ?trashed=only  → solo archivadas
        // ?trashed=with  → activas + archivadas
        // (default)      → solo activas (excluye soft-deleted)
        $trashedMode = $request->string('trashed')->toString();
        $q = Property::query()
            ->with(['building', 'activeContract'])
            ->withCount('leads');

        if ($trashedMode === 'only') {
            $q->onlyTrashed();
        } elseif ($trashedMode === 'with') {
            $q->withTrashed();
        }

        if ($search = $request->string('search')->toString()) {
            $q->where(function ($w) use ($search) {
                $w->where('title', 'ilike', "%{$search}%")
                  ->orWhere('code', 'ilike', "%{$search}%")
                  ->orWhere('address', 'ilike', "%{$search}%");
            });
        }

        foreach (['status', 'listing_type', 'type', 'city'] as $col) {
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
        if ($area = $request->integer('area_min')) {
            $q->where('area_sqm', '>=', $area);
        }
        if ($buildingId = $request->integer('building_id')) {
            $q->where('building_id', $buildingId);
        }
        // Filtros multivalor
        if ($types = $request->input('types')) {
            $q->whereIn('type', is_array($types) ? $types : explode(',', (string) $types));
        }
        // Features (jsonb @> array)
        if ($features = $request->input('features')) {
            $features = is_array($features) ? $features : explode(',', (string) $features);
            foreach ($features as $f) {
                $q->whereJsonContains('features', $f);
            }
        }

        $sort = $request->string('sort', 'created_at')->toString();
        $dir = $request->string('dir', 'desc')->toString() === 'asc' ? 'asc' : 'desc';
        $allowedSorts = [
            'created_at', 'price_rent', 'area_sqm', 'bedrooms', 'code',
            'title', 'status', 'listing_type', 'view_count',
        ];
        if ($sort === 'leads_count') {
            $q->orderBy('leads_count', $dir);
        } elseif (in_array($sort, $allowedSorts, true)) {
            $q->orderBy($sort, $dir);
        } else {
            $q->orderBy('created_at', 'desc');
        }

        $perPage = min(max((int) $request->integer('per_page', 15), 5), 100);

        return PropertyResource::collection($q->paginate($perPage));
    }

    public function store(StorePropertyRequest $request): JsonResponse
    {
        $agency = \App\Models\Agency::find($request->user()->agency_id);
        $check = \App\Services\PlanGate::canCreateProperty($agency);
        if (! $check['allowed']) {
            return response()->json([
                'message' => "Has alcanzado el límite de tu plan ({$check['current']}/{$check['limit']} propiedades). Actualiza tu plan para crear más.",
                'limit_reached' => true,
                'current' => $check['current'],
                'limit' => $check['limit'],
                'feature' => 'properties',
            ], 402);
        }

        $data = $request->validated();
        $data['code'] ??= 'P-'.strtoupper(Str::random(6));

        $property = Property::create($data);

        return (new PropertyResource($property))
            ->response()
            ->setStatusCode(201);
    }

    public function show(Property $property): PropertyResource
    {
        $property->load(['building', 'activeContract', 'owner', 'agent', 'client']);

        return new PropertyResource($property);
    }

    public function update(StorePropertyRequest $request, Property $property): PropertyResource
    {
        $data = $request->validated();
        $previousStatus = $property->status;
        $previousClient = $property->client_person_id;

        $property->update($data);

        // Registrar cambios de cliente
        $clientChangedToSet = array_key_exists('client_person_id', $data)
            && $data['client_person_id']
            && (int) $data['client_person_id'] !== (int) $previousClient;
        $clientChangedToNull = array_key_exists('client_person_id', $data)
            && ! $data['client_person_id']
            && $previousClient;

        if ($clientChangedToSet) {
            \App\Services\PropertyEventLogger::clientAssigned(
                $property->fresh()->load('client'),
                (int) $data['client_person_id'],
            );
        } elseif ($clientChangedToNull) {
            \App\Services\PropertyEventLogger::clientRemoved($property->fresh(), (int) $previousClient);
        }

        // Sincronización de estado entre client_person_id <-> status:
        //  - Si se ASIGNÓ un cliente (no había antes) y la propiedad estaba `disponible`,
        //    pasa a `reservada` automáticamente — solo si el user no envió `status` explícito.
        //  - Si se QUITÓ el cliente y la propiedad estaba `reservada`, vuelve a `disponible`.
        // No tocamos `arrendada` (la maneja el lease controller).
        $hasContract = $property->activeContract()->exists();
        if (! $hasContract && ! array_key_exists('status', $data)) {
            if ($clientChangedToSet && $previousStatus === Property::STATUS_AVAILABLE) {
                $property->update(['status' => Property::STATUS_RESERVED]);
            } elseif ($clientChangedToNull && $previousStatus === Property::STATUS_RESERVED) {
                $property->update(['status' => Property::STATUS_AVAILABLE]);
            }
        }

        // Registrar cambio de status (incluye el auto-sync de arriba)
        $finalStatus = $property->fresh()->status;
        if ($finalStatus !== $previousStatus) {
            \App\Services\PropertyEventLogger::statusChanged(
                $property->fresh()->load('client'),
                $previousStatus,
                $finalStatus,
            );
        }

        return new PropertyResource(
            $property->fresh()->load(['building', 'activeContract', 'owner', 'agent', 'client']),
        );
    }

    public function destroy(Property $property): JsonResponse
    {
        $property->delete();

        return response()->json(['ok' => true]);
    }

    /**
     * POST /api/properties/{property}/duplicate
     * Clona la propiedad con un nuevo código, status=disponible, sin contrato/cliente.
     */
    public function duplicate(Property $property): PropertyResource
    {
        $clone = $property->replicate([
            'view_count', 'last_viewed_at',
            'client_person_id', 'is_published',
            'is_shared', 'shared_at',
        ]);
        $clone->code = 'P-'.strtoupper(\Illuminate\Support\Str::random(6));
        $clone->title = $property->title.' (Copia)';
        $clone->status = 'disponible';
        $clone->is_published = false;
        $clone->is_shared = false;
        $clone->save();

        return new PropertyResource(
            $clone->fresh()->load(['building', 'activeContract', 'owner', 'agent', 'client']),
        );
    }

    /**
     * POST /api/properties/bulk
     * Body: { action: 'change_status' | 'archive' | 'restore', ids: number[], payload?: {} }
     */
    public function bulk(Request $request): JsonResponse
    {
        $data = $request->validate([
            'action' => ['required', 'in:change_status,archive,restore'],
            'ids' => ['required', 'array', 'min:1', 'max:200'],
            'ids.*' => ['integer'],
            'payload' => ['sometimes', 'array'],
            'payload.status' => ['sometimes', \Illuminate\Validation\Rule::in(Property::STATUSES)],
        ]);

        $ids = $data['ids'];
        $affected = 0;

        switch ($data['action']) {
            case 'change_status':
                $status = $data['payload']['status'] ?? null;
                if (! $status) {
                    return response()->json(['message' => 'payload.status requerido'], 422);
                }
                $affected = Property::whereIn('id', $ids)->update(['status' => $status]);
                break;

            case 'archive':
                $affected = Property::whereIn('id', $ids)->delete();
                break;

            case 'restore':
                $affected = Property::onlyTrashed()
                    ->whereIn('id', $ids)
                    ->where('agency_id', $request->user()->agency_id)
                    ->restore();
                break;
        }

        return response()->json([
            'action' => $data['action'],
            'affected' => $affected,
        ]);
    }

    /**
     * GET /api/properties/map
     * Lista compacta para pintar pins en un mapa.
     */
    public function map(Request $request): JsonResponse
    {
        $q = Property::query()->whereRaw('location IS NOT NULL');

        if ($status = $request->string('status')->toString()) {
            $q->where('status', $status);
        }
        if ($listing = $request->string('listing_type')->toString()) {
            $q->where('listing_type', $listing);
        }
        if ($min = $request->integer('min_price')) {
            $q->where('price_rent', '>=', $min);
        }
        if ($max = $request->integer('max_price')) {
            $q->where('price_rent', '<=', $max);
        }

        $rows = $q
            ->select([
                'id', 'code', 'title', 'type', 'status', 'listing_type',
                'address', 'city', 'price_rent', 'price_sale',
                'bedrooms', 'bathrooms', 'area_sqm', 'cover_image_url',
                DB::raw('ST_Y(location::geometry) AS lat'),
                DB::raw('ST_X(location::geometry) AS lng'),
            ])
            ->limit(500)
            ->get()
            ->map(fn ($p) => [
                'id' => $p->id,
                'code' => $p->code,
                'title' => $p->title,
                'type' => $p->type,
                'status' => $p->status,
                'listing_type' => $p->listing_type,
                'address' => $p->address,
                'city' => $p->city,
                'price_rent' => $p->price_rent !== null ? (float) $p->price_rent : null,
                'price_sale' => $p->price_sale !== null ? (float) $p->price_sale : null,
                'bedrooms' => (int) $p->bedrooms,
                'bathrooms' => (float) $p->bathrooms,
                'area_sqm' => $p->area_sqm,
                'cover_image_url' => $p->cover_image_url,
                'lat' => (float) $p->lat,
                'lng' => (float) $p->lng,
            ]);

        return response()->json(['data' => $rows]);
    }

    public function stats(): JsonResponse
    {
        $base = Property::query();

        return response()->json([
            'total' => (clone $base)->count(),
            'available' => (clone $base)->where('status', 'disponible')->count(),
            'occupied' => (clone $base)->where('status', 'arrendada')->count(),
            'maintenance' => (clone $base)->where('status', 'mantenimiento')->count(),
            'avg_rent' => (float) (clone $base)->where('listing_type', 'alquiler')->avg('price_rent'),
        ]);
    }

    /**
     * GET /api/properties/{property}/analytics
     * Métricas históricas de la propiedad: ingresos lifetime, ocupación, ROI, mantenciones.
     */
    /**
     * GET /api/properties/{property}/history
     * Devuelve el historial completo de eventos de la propiedad para mostrar en timeline.
     */
    public function history(Property $property): JsonResponse
    {
        $events = \App\Models\PropertyEvent::query()
            ->where('property_id', $property->id)
            ->with('user:id,name,avatar_url')
            ->orderByDesc('occurred_at')
            ->orderByDesc('id')
            ->limit(200)
            ->get();

        return response()->json([
            'data' => $events->map(fn ($e) => [
                'id' => $e->id,
                'type' => $e->type,
                'from_value' => $e->from_value,
                'to_value' => $e->to_value,
                'snapshot' => $e->snapshot ?? [],
                'occurred_at' => $e->occurred_at?->toIso8601String(),
                'user' => $e->user ? [
                    'id' => $e->user->id,
                    'name' => $e->user->name,
                    'avatar_url' => $e->user->avatar_url,
                ] : null,
            ]),
            'meta' => [
                'current_status' => $property->status,
            ],
        ]);
    }

    public function analytics(Property $property): JsonResponse
    {
        $contracts = Contract::where('property_id', $property->id)->get();
        $contractIds = $contracts->pluck('id');

        // Total ingresos cobrados lifetime
        $lifetimeRevenue = (float) Payment::whereIn('charge_id',
            Charge::whereIn('contract_id', $contractIds)->pluck('id'),
        )->sum('amount');

        // Ingresos últimos 12 meses
        $last12Revenue = (float) Payment::whereIn('charge_id',
            Charge::whereIn('contract_id', $contractIds)->pluck('id'),
        )->where('received_at', '>=', Carbon::now()->subYear())->sum('amount');

        // Cargos emitidos lifetime + pagados → tasa de cobro
        $totalIssued = (float) Charge::whereIn('contract_id', $contractIds)->sum('amount');
        $totalCollected = (float) Charge::whereIn('contract_id', $contractIds)->sum('paid_amount');
        $collectionRate = $totalIssued > 0
            ? round(($totalCollected / $totalIssued) * 100, 1)
            : 0;

        // Ocupación histórica: días cubiertos por contratos vs días totales desde el primer contrato.
        $firstStart = $contracts->min('start_date');
        $occupancyRate = 0;
        $daysOccupied = 0;
        $daysSinceFirst = 0;
        if ($firstStart) {
            $firstStart = Carbon::parse($firstStart);
            $today = Carbon::today();
            $daysSinceFirst = $firstStart->diffInDays($today);
            $daysOccupied = $contracts->reduce(function ($carry, Contract $c) use ($today) {
                $start = $c->start_date instanceof Carbon ? $c->start_date : Carbon::parse($c->start_date);
                $end = $c->end_date instanceof Carbon ? $c->end_date : Carbon::parse($c->end_date);
                if ($end->gt($today)) {
                    $end = $today;
                }

                return $carry + max(0, (int) $start->diffInDays($end, false));
            }, 0);
            $occupancyRate = $daysSinceFirst > 0
                ? round(($daysOccupied / $daysSinceFirst) * 100, 1)
                : 0;
        }

        // €/m² mensual basado en renta actual
        $rentPerSqm = $property->price_rent && $property->area_sqm > 0
            ? round((float) $property->price_rent / $property->area_sqm, 2)
            : null;

        // ROI anualizado si hay precio de venta
        $roiAnnual = null;
        if ($property->price_sale && $property->price_rent) {
            $roiAnnual = round(((float) $property->price_rent * 12) / (float) $property->price_sale * 100, 2);
        }

        // Mantenciones lifetime + coste total
        $tickets = MaintenanceTicket::where('property_id', $property->id)->get();
        $maintenanceCost = (float) $tickets->whereNotNull('actual_cost')->sum('actual_cost');

        // Próximo fin de contrato (si está ocupada)
        $activeContract = $contracts->firstWhere('status', 'vigente');

        // Línea mensual ingresos últimos 12 meses (sparkline)
        $monthly = collect();
        $base = Carbon::now()->startOfMonth();
        for ($i = 11; $i >= 0; $i--) {
            $start = $base->copy()->subMonthsNoOverflow($i)->startOfMonth();
            $end = $start->copy()->endOfMonth();
            $sum = (float) Payment::whereIn('charge_id',
                Charge::whereIn('contract_id', $contractIds)->pluck('id'),
            )->whereBetween('received_at', [$start, $end])->sum('amount');
            $monthly->push([
                'month' => $start->format('Y-m'),
                'label' => $start->translatedFormat('M'),
                'revenue' => $sum,
            ]);
        }

        return response()->json([
            'lifetime_revenue' => $lifetimeRevenue,
            'last_12_revenue' => $last12Revenue,
            'collection_rate' => $collectionRate,
            'occupancy_rate' => $occupancyRate,
            'days_occupied' => $daysOccupied,
            'days_since_first_contract' => $daysSinceFirst,
            'rent_per_sqm' => $rentPerSqm,
            'roi_annual_pct' => $roiAnnual,
            'contracts_count' => $contracts->count(),
            'active_tenants_count' => $contracts->whereIn('status', ['vigente'])->count(),
            'maintenance_count' => $tickets->count(),
            'maintenance_cost_total' => $maintenanceCost,
            'next_contract_end' => $activeContract?->end_date?->toDateString(),
            'monthly_revenue' => $monthly,
        ]);
    }
}
