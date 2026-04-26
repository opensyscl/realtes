<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Contract;
use App\Models\Person;
use App\Models\Property;
use App\Services\PropertyEventLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PropertyLeaseController extends Controller
{
    /**
     * GET /api/properties/{property}/lease
     * Devuelve el contrato vigente con datos del tenant (o null si no hay).
     */
    public function show(Property $property): JsonResponse
    {
        $contract = $property->activeContract()->with('tenant')->first();

        if (! $contract) {
            return response()->json(['data' => null]);
        }

        return response()->json([
            'data' => [
                'id' => $contract->id,
                'code' => $contract->code,
                'status' => $contract->status,
                'start_date' => $contract->start_date?->toDateString(),
                'end_date' => $contract->end_date?->toDateString(),
                'monthly_rent' => (float) $contract->monthly_rent,
                'deposit' => $contract->deposit !== null ? (float) $contract->deposit : null,
                'alert_days_before' => (int) ($contract->alert_days_before ?? 30),
                'auto_renew' => (bool) $contract->auto_renew,
                'notes' => $contract->notes,
                'contract_pdf_url' => $contract->contract_pdf_url,
                'tenant' => $contract->tenant ? [
                    'id' => $contract->tenant->id,
                    'first_name' => $contract->tenant->first_name,
                    'last_name' => $contract->tenant->last_name,
                    'full_name' => trim("{$contract->tenant->first_name} {$contract->tenant->last_name}"),
                    'nif' => $contract->tenant->nif,
                    'email' => $contract->tenant->email,
                    'phone' => $contract->tenant->phone,
                ] : null,
            ],
        ]);
    }

    /**
     * POST /api/properties/{property}/lease
     * Crea o actualiza el contrato vigente. Crea/reusa Person como tenant
     * basándose en email/nif. En una sola transacción.
     */
    public function store(Request $request, Property $property): JsonResponse
    {
        $data = $request->validate([
            // Tenant
            'tenant.full_name' => ['required', 'string', 'max:200'],
            'tenant.nif' => ['nullable', 'string', 'max:30'],
            'tenant.email' => ['required', 'email', 'max:160'],
            'tenant.phone' => ['nullable', 'string', 'max:30'],

            // Contract period + money
            'start_date' => ['required', 'date'],
            'duration_months' => ['nullable', 'integer', 'min:1', 'max:120'],
            'end_date' => ['nullable', 'date', 'after:start_date'],
            'monthly_rent' => ['required', 'numeric', 'min:0'],
            'deposit' => ['nullable', 'numeric', 'min:0'],

            // Alerts
            'alert_days_before' => ['nullable', 'integer', 'min:0', 'max:365'],
            'auto_renew' => ['sometimes', 'boolean'],

            // Notes
            'notes' => ['nullable', 'string', 'max:5000'],
        ]);

        $agencyId = $request->user()->agency_id;

        $previousStatus = $property->status;

        $result = DB::transaction(function () use ($property, $data, $agencyId) {
            // 1. Resolver el tenant: por email o nif si existe, sino crear nuevo
            $tenant = $this->resolveTenant($agencyId, $data['tenant']);

            // 2. Calcular end_date si solo viene duration_months
            $endDate = $data['end_date'] ?? null;
            if (! $endDate && ! empty($data['duration_months'])) {
                $endDate = \Carbon\Carbon::parse($data['start_date'])
                    ->addMonths((int) $data['duration_months'])
                    ->toDateString();
            }

            // 3. Buscar contrato vigente existente o crear uno nuevo
            $contract = Contract::query()
                ->where('property_id', $property->id)
                ->where('status', 'vigente')
                ->first();

            $payload = [
                'agency_id' => $agencyId,
                'property_id' => $property->id,
                'tenant_id' => $tenant->id,
                'owner_id' => $property->owner_person_id,
                'type' => 'arriendo',
                'status' => 'vigente',
                'start_date' => $data['start_date'],
                'end_date' => $endDate,
                'monthly_rent' => $data['monthly_rent'],
                'deposit' => $data['deposit'] ?? null,
                'alert_days_before' => $data['alert_days_before'] ?? 30,
                'auto_renew' => (bool) ($data['auto_renew'] ?? false),
                'notes' => $data['notes'] ?? null,
            ];

            $isNew = ! $contract;
            if ($contract) {
                $contract->update($payload);
            } else {
                $payload['code'] = 'C-'.now()->format('Ym').'-'.strtoupper(Str::random(4));
                $contract = Contract::create($payload);
            }

            // 4. Sincronizar la propiedad:
            //    - status = arrendada
            //    - client_person_id = tenant_id (el tenant ES el cliente actual)
            $property->update([
                'status' => Property::STATUS_RENTED,
                'client_person_id' => $tenant->id,
            ]);

            return ['contract' => $contract, 'isNew' => $isNew];
        });

        $contract = $result['contract'];

        // Log eventos fuera de la transacción (idempotente, no romper el lease)
        if ($result['isNew']) {
            PropertyEventLogger::leaseCreated($property->fresh(), $contract->fresh());
        } else {
            PropertyEventLogger::leaseUpdated($property->fresh(), $contract->fresh());
        }
        if ($previousStatus !== Property::STATUS_RENTED) {
            PropertyEventLogger::statusChanged(
                $property->fresh()->load('client'),
                $previousStatus,
                Property::STATUS_RENTED,
            );
        }

        return $this->show($property->fresh());
    }

    /**
     * DELETE /api/properties/{property}/lease
     * Termina el contrato vigente (status=finalizado) y libera la propiedad.
     */
    public function destroy(Property $property): JsonResponse
    {
        $previousStatus = $property->status;
        $contract = $property->activeContract()->with('tenant')->first();
        if ($contract) {
            $contract->update(['status' => 'finalizado']);
        }
        // Al finalizar el arriendo: la propiedad vuelve a disponible y se libera el cliente.
        $property->update([
            'status' => Property::STATUS_AVAILABLE,
            'client_person_id' => null,
        ]);

        if ($contract) {
            PropertyEventLogger::leaseEnded($property->fresh(), $contract);
        }
        if ($previousStatus !== Property::STATUS_AVAILABLE) {
            PropertyEventLogger::statusChanged(
                $property->fresh(),
                $previousStatus,
                Property::STATUS_AVAILABLE,
            );
        }

        return response()->json(['ok' => true]);
    }

    /**
     * Busca un Person existente por email o NIF de la misma agencia (cualquier type),
     * o crea uno nuevo type=tenant. Permite que el mismo Person sea owner+tenant.
     */
    private function resolveTenant(int $agencyId, array $tenantData): Person
    {
        $email = strtolower(trim($tenantData['email']));
        $nif = ! empty($tenantData['nif']) ? trim($tenantData['nif']) : null;

        $existing = Person::query()
            ->where('agency_id', $agencyId)
            ->when($nif, fn ($q) => $q->orWhere('nif', $nif))
            ->where(function ($q) use ($email, $nif) {
                $q->where('email', $email);
                if ($nif) {
                    $q->orWhere('nif', $nif);
                }
            })
            ->first();

        // Split full_name → first_name + last_name
        $parts = preg_split('/\s+/', trim($tenantData['full_name']), 2);
        $firstName = $parts[0] ?? '';
        $lastName = $parts[1] ?? null;

        if ($existing) {
            $existing->update([
                'first_name' => $firstName,
                'last_name' => $lastName,
                'email' => $email,
                'phone' => $tenantData['phone'] ?? $existing->phone,
                'nif' => $nif ?? $existing->nif,
                // No bajamos el role: si ya era owner, lo dejamos como 'both'
                'type' => $existing->type === 'owner' ? 'both' : ($existing->type ?: 'tenant'),
            ]);
            return $existing;
        }

        return Person::create([
            'agency_id' => $agencyId,
            'type' => 'tenant',
            'first_name' => $firstName,
            'last_name' => $lastName,
            'email' => $email,
            'phone' => $tenantData['phone'] ?? null,
            'nif' => $nif,
            'country' => 'CL',
        ]);
    }
}
