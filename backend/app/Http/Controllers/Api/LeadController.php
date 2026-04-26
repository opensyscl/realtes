<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreLeadRequest;
use App\Http\Resources\LeadActivityResource;
use App\Http\Resources\LeadResource;
use App\Models\Charge;
use App\Models\Contract;
use App\Models\Lead;
use App\Models\LeadActivity;
use App\Models\Person;
use App\Models\Property;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class LeadController extends Controller
{
    /**
     * Returns all leads grouped by stage, ready for the kanban board.
     */
    public function index(Request $request): JsonResponse
    {
        $pipelineId = $request->integer('pipeline_id');
        $q = Lead::query()
            ->with(['assignedTo:id,name,avatar_url', 'person:id,first_name,last_name', 'property:id,code,title'])
            ->withCount('activities')
            ->orderBy('stage_id')
            ->orderBy('position');

        if ($pipelineId) {
            $q->where('pipeline_id', $pipelineId);
        }
        if ($propertyId = $request->integer('property_id')) {
            $q->where('property_id', $propertyId);
        }
        if ($status = $request->string('status')->toString()) {
            $q->where('status', $status);
        } elseif (! $propertyId) {
            // por defecto sólo abiertos en el board
            // (cuando filtramos por property mostramos todos)
            $q->whereIn('status', ['open']);
        }

        // Cuando filtramos por property devolvemos lista plana en vez de
        // agrupada por stage para usarla en la bandeja del detalle.
        if ($propertyId) {
            return response()->json([
                'data' => LeadResource::collection($q->orderByDesc('created_at')->get()),
            ]);
        }

        $leads = $q->get();
        $byStage = $leads->groupBy('stage_id');

        return response()->json([
            'data' => $byStage->map(fn ($items) => LeadResource::collection($items)->toArray($request)),
        ]);
    }

    public function store(StoreLeadRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['code'] = 'L-'.strtoupper(Str::random(6));
        $data['last_activity_at'] = now();

        $lead = DB::transaction(function () use ($data, $request) {
            $lead = Lead::create($data);

            LeadActivity::create([
                'agency_id' => $lead->agency_id,
                'lead_id' => $lead->id,
                'user_id' => $request->user()->id,
                'type' => 'note',
                'title' => 'Lead creado',
                'occurred_at' => now(),
            ]);

            return $lead;
        });

        $lead->load(['assignedTo', 'person', 'property']);

        return (new LeadResource($lead))->response()->setStatusCode(201);
    }

    public function show(Lead $lead): LeadResource
    {
        $lead->load(['assignedTo', 'person', 'property', 'pipeline', 'stage', 'convertedContract'])
            ->loadCount('activities');

        return new LeadResource($lead);
    }

    public function update(StoreLeadRequest $request, Lead $lead): LeadResource
    {
        $lead->update($request->validated());

        return new LeadResource(
            $lead->fresh()->load(['assignedTo', 'person', 'property']),
        );
    }

    public function destroy(Lead $lead): JsonResponse
    {
        $lead->delete();

        return response()->json(['ok' => true]);
    }

    /**
     * Move lead to another stage and reorder.
     * Body: { stage_id, position }  (position 0-based within target stage)
     */
    public function move(Request $request, Lead $lead): LeadResource
    {
        $data = $request->validate([
            'stage_id' => ['required', 'integer', 'exists:stages,id'],
            'position' => ['required', 'integer', 'min:0'],
        ]);

        $fromStageId = $lead->stage_id;
        $toStageId = (int) $data['stage_id'];
        $toPosition = (int) $data['position'];

        DB::transaction(function () use ($lead, $fromStageId, $toStageId, $toPosition, $request) {
            // Reordenar la columna origen
            if ($fromStageId !== $toStageId) {
                Lead::where('agency_id', $lead->agency_id)
                    ->where('stage_id', $fromStageId)
                    ->where('position', '>', $lead->position)
                    ->decrement('position');
            }

            // Hacer hueco en columna destino
            Lead::where('agency_id', $lead->agency_id)
                ->where('stage_id', $toStageId)
                ->where('id', '!=', $lead->id)
                ->where('position', '>=', $toPosition)
                ->increment('position');

            $stage = $lead->stage()->getRelated()->newQuery()->find($toStageId);
            $lead->update([
                'stage_id' => $toStageId,
                'position' => $toPosition,
                'last_activity_at' => now(),
                'probability_pct' => $stage->probability_pct,
                'status' => $stage->is_won ? 'won' : ($stage->is_lost ? 'lost' : 'open'),
            ]);

            if ($fromStageId !== $toStageId) {
                LeadActivity::create([
                    'agency_id' => $lead->agency_id,
                    'lead_id' => $lead->id,
                    'user_id' => $request->user()->id,
                    'type' => 'stage_change',
                    'title' => "Movido a '{$stage->name}'",
                    'payload' => ['from_stage_id' => $fromStageId, 'to_stage_id' => $toStageId],
                    'occurred_at' => now(),
                ]);
            }
        });

        return new LeadResource($lead->fresh()->load(['assignedTo', 'person', 'property']));
    }

    /**
     * Convert a captation lead into a new Property (listing taken on).
     * Body: { title, type, address, area_sqm, bedrooms, bathrooms, price_rent, price_sale?, listing_type? }
     */
    public function convertToProperty(Request $request, Lead $lead): JsonResponse
    {
        if ($lead->converted_contract_id) {
            return response()->json([
                'message' => 'Este lead ya está convertido.',
            ], 409);
        }

        $data = $request->validate([
            'title' => ['required', 'string', 'max:200'],
            'type' => ['required', 'string', 'max:50'],
            'address' => ['required', 'string', 'max:255'],
            'area_sqm' => ['nullable', 'integer', 'min:1'],
            'bedrooms' => ['nullable', 'integer', 'min:0'],
            'bathrooms' => ['nullable', 'numeric', 'min:0'],
            'price_rent' => ['nullable', 'numeric', 'min:0'],
            'price_sale' => ['nullable', 'numeric', 'min:0'],
            'listing_type' => ['sometimes', 'in:alquiler,venta,ambos'],
        ]);

        $property = DB::transaction(function () use ($lead, $data, $request) {
            // Crear o vincular Person como owner
            $owner = $lead->person ?? Person::create([
                'agency_id' => $lead->agency_id,
                'type' => 'owner',
                'first_name' => $lead->contact_name ? Str::before($lead->contact_name, ' ') : 'Sin nombre',
                'last_name' => $lead->contact_name ? Str::after($lead->contact_name, ' ') : null,
                'email' => $lead->contact_email,
                'phone' => $lead->contact_phone,
            ]);
            $lead->person_id = $owner->id;

            $property = Property::create([
                'agency_id' => $lead->agency_id,
                'code' => 'P-'.strtoupper(Str::random(6)),
                'title' => $data['title'],
                'type' => $data['type'],
                'status' => 'disponible',
                'listing_type' => $data['listing_type'] ?? 'alquiler',
                'is_published' => false,
                'address' => $data['address'],
                'city' => 'Valencia',
                'province' => 'Valencia',
                'country' => 'ES',
                'area_sqm' => $data['area_sqm'] ?? null,
                'bedrooms' => $data['bedrooms'] ?? 0,
                'bathrooms' => $data['bathrooms'] ?? 1,
                'price_rent' => $data['price_rent'] ?? null,
                'price_sale' => $data['price_sale'] ?? null,
            ]);

            $wonStage = $lead->pipeline->stages()->where('is_won', true)->first();
            $lead->update([
                'property_id' => $property->id,
                'status' => 'won',
                'stage_id' => $wonStage?->id ?? $lead->stage_id,
                'probability_pct' => 100,
                'last_activity_at' => now(),
            ]);

            LeadActivity::create([
                'agency_id' => $lead->agency_id,
                'lead_id' => $lead->id,
                'user_id' => $request->user()->id,
                'type' => 'won',
                'title' => "Captación firmada → Propiedad {$property->code} creada",
                'payload' => ['property_id' => $property->id],
                'occurred_at' => now(),
            ]);

            return $property;
        });

        return response()->json([
            'lead' => new LeadResource($lead->fresh()->load(['assignedTo', 'person', 'property'])),
            'property_id' => $property->id,
            'property_code' => $property->code,
        ], 201);
    }

    /**
     * Convert a lead into a Person + Contract (with charges if requested).
     * Body: { property_id, owner_id, monthly_rent, start_date, end_date, deposit?, generate_charges? }
     */
    public function convert(Request $request, Lead $lead): JsonResponse
    {
        $data = $request->validate([
            'property_id' => ['required', 'integer', 'exists:properties,id'],
            'owner_id' => ['required', 'integer', 'exists:persons,id'],
            'monthly_rent' => ['required', 'numeric', 'min:0'],
            'deposit' => ['sometimes', 'numeric', 'min:0'],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after:start_date'],
            'payment_day' => ['sometimes', 'integer', 'between:1,28'],
            'generate_charges' => ['sometimes', 'boolean'],
        ]);

        if ($lead->converted_contract_id) {
            return response()->json([
                'message' => 'Este lead ya está convertido a contrato.',
                'contract_id' => $lead->converted_contract_id,
            ], 409);
        }

        $contract = DB::transaction(function () use ($lead, $data, $request) {
            // 1. Crear o vincular persona arrendataria
            $tenant = $lead->person ?? Person::create([
                'agency_id' => $lead->agency_id,
                'type' => 'tenant',
                'first_name' => $lead->contact_name ? Str::before($lead->contact_name, ' ') : 'Sin nombre',
                'last_name' => $lead->contact_name ? Str::after($lead->contact_name, ' ') : null,
                'email' => $lead->contact_email,
                'phone' => $lead->contact_phone,
            ]);
            $lead->person_id = $tenant->id;

            // 2. Crear contrato
            $contract = Contract::create([
                'agency_id' => $lead->agency_id,
                'code' => 'C-'.str_pad((string) random_int(1000, 99999), 5, '0', STR_PAD_LEFT),
                'property_id' => $data['property_id'],
                'owner_id' => $data['owner_id'],
                'tenant_id' => $tenant->id,
                'agent_user_id' => $lead->assigned_user_id ?? $request->user()->id,
                'type' => 'alquiler_residencial',
                'status' => 'vigente',
                'start_date' => $data['start_date'],
                'end_date' => $data['end_date'],
                'monthly_rent' => $data['monthly_rent'],
                'deposit' => $data['deposit'] ?? $data['monthly_rent'] * 2,
                'commission_pct' => 10,
                'ipc_adjustment' => true,
                'payment_day' => $data['payment_day'] ?? 5,
                'signed_at' => now()->toDateString(),
            ]);

            // 3. Marcar la propiedad como ocupada
            Property::where('id', $data['property_id'])->update(['status' => 'arrendada']);

            // 4. (Opcional) generar el primer cargo del mes
            if ($data['generate_charges'] ?? true) {
                $start = Carbon::parse($data['start_date']);
                $due = $start->copy()->setDay($contract->payment_day);
                if ($due->lt($start)) {
                    $due->addMonth();
                }
                Charge::create([
                    'agency_id' => $lead->agency_id,
                    'contract_id' => $contract->id,
                    'person_id' => $tenant->id,
                    'code' => 'CG-'.str_pad((string) ($contract->id * 100 + 1), 7, '0', STR_PAD_LEFT),
                    'concept' => 'renta',
                    'description' => 'Renta '.$start->translatedFormat('F Y'),
                    'amount' => $contract->monthly_rent,
                    'paid_amount' => 0,
                    'issued_at' => $start->copy()->startOfMonth(),
                    'due_date' => $due,
                    'status' => 'pendiente',
                ]);
            }

            // 5. Cerrar el lead
            $wonStage = $lead->pipeline->stages()->where('is_won', true)->first();
            $lead->update([
                'converted_contract_id' => $contract->id,
                'status' => 'won',
                'stage_id' => $wonStage?->id ?? $lead->stage_id,
                'probability_pct' => 100,
                'last_activity_at' => now(),
            ]);

            LeadActivity::create([
                'agency_id' => $lead->agency_id,
                'lead_id' => $lead->id,
                'user_id' => $request->user()->id,
                'type' => 'won',
                'title' => "Convertido a contrato {$contract->code}",
                'payload' => ['contract_id' => $contract->id],
                'occurred_at' => now(),
            ]);

            return $contract;
        });

        return response()->json([
            'lead' => new LeadResource($lead->fresh()->load(['assignedTo', 'person', 'property'])),
            'contract_id' => $contract->id,
            'contract_code' => $contract->code,
        ], 201);
    }

    /**
     * GET /leads/{lead}/activities
     */
    public function activities(Lead $lead): AnonymousResourceCollection
    {
        return LeadActivityResource::collection(
            $lead->activities()->with('user:id,name')->paginate(50),
        );
    }

    /**
     * POST /leads/{lead}/activities
     */
    public function storeActivity(Request $request, Lead $lead): JsonResponse
    {
        $data = $request->validate([
            'type' => ['required', Rule::in(['note', 'call', 'email', 'meeting', 'visit_scheduled', 'message_in', 'message_out'])],
            'title' => ['nullable', 'string', 'max:160'],
            'body' => ['nullable', 'string'],
            'occurred_at' => ['nullable', 'date'],
        ]);

        $activity = LeadActivity::create([
            'agency_id' => $lead->agency_id,
            'lead_id' => $lead->id,
            'user_id' => $request->user()->id,
            'type' => $data['type'],
            'title' => $data['title'] ?? null,
            'body' => $data['body'] ?? null,
            'occurred_at' => $data['occurred_at'] ?? now(),
        ]);

        $lead->update(['last_activity_at' => now()]);

        return (new LeadActivityResource($activity->load('user')))
            ->response()
            ->setStatusCode(201);
    }
}
