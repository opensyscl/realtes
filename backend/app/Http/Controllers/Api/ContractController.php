<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreContractRequest;
use App\Http\Resources\ContractResource;
use App\Models\Contract;
use App\Services\CommissionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ContractController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $q = Contract::query()
            ->with(['property:id,code,title,address,city', 'owner:id,first_name,last_name,email', 'tenant:id,first_name,last_name,email', 'agent:id,name'])
            ->withCount('charges');

        if ($search = $request->string('search')->toString()) {
            $q->where(function ($w) use ($search) {
                $w->where('code', 'ilike', "%{$search}%")
                    ->orWhereHas('property', fn ($p) => $p->where('title', 'ilike', "%{$search}%")
                        ->orWhere('address', 'ilike', "%{$search}%"));
            });
        }

        if ($status = $request->string('status')->toString()) {
            $q->where('status', $status);
        }

        if ($expiringBefore = $request->string('expiring_before')->toString()) {
            $q->where('end_date', '<=', $expiringBefore);
        }

        $sort = $request->string('sort', 'created_at')->toString();
        $dir = $request->string('dir', 'desc')->toString() === 'asc' ? 'asc' : 'desc';
        if (! in_array($sort, ['created_at', 'start_date', 'end_date', 'monthly_rent', 'code'], true)) {
            $sort = 'created_at';
        }
        $q->orderBy($sort, $dir);

        $perPage = min(max((int) $request->integer('per_page', 15), 5), 100);

        return ContractResource::collection($q->paginate($perPage));
    }

    public function store(StoreContractRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['code'] ??= 'C-'.str_pad((string) random_int(1000, 99999), 5, '0', STR_PAD_LEFT);

        $contract = Contract::create($data);
        CommissionService::generateDefaultSplits($contract);
        $contract->load(['property', 'owner', 'tenant', 'agent']);

        return (new ContractResource($contract))->response()->setStatusCode(201);
    }

    public function show(Contract $contract): ContractResource
    {
        $contract->load(['property', 'owner', 'tenant', 'agent'])->loadCount('charges');

        return new ContractResource($contract);
    }

    public function update(StoreContractRequest $request, Contract $contract): ContractResource
    {
        $oldRent = (float) $contract->monthly_rent;
        $oldPct = (float) $contract->commission_pct;

        $contract->update($request->validated());

        // Si cambió la renta o el % de comisión, recalcular splits no pagados
        if ((float) $contract->monthly_rent !== $oldRent || (float) $contract->commission_pct !== $oldPct) {
            $contract->load('commissionSplits');
            CommissionService::recalculateAmounts($contract);
        }

        // Si no tenía splits y ahora tiene agente, generar
        if ($contract->agent_user_id && ! $contract->commissionSplits()->exists()) {
            CommissionService::generateDefaultSplits($contract);
        }

        return new ContractResource(
            $contract->fresh()->load(['property', 'owner', 'tenant', 'agent']),
        );
    }

    public function destroy(Contract $contract): JsonResponse
    {
        $contract->delete();

        return response()->json(['ok' => true]);
    }

    /**
     * POST /api/contracts/bulk-rent-adjust
     * Body: { adjustments: [{contract_id, new_rent}], reason?: string }
     *
     * Aplica un reajuste de renta a varios contratos en una transacción.
     * Recalcula commission splits no pagados y deja un log opcional.
     */
    public function bulkRentAdjust(Request $request): JsonResponse
    {
        $data = $request->validate([
            'adjustments' => ['required', 'array', 'min:1', 'max:500'],
            'adjustments.*.contract_id' => ['required', 'integer'],
            'adjustments.*.new_rent' => ['required', 'numeric', 'min:0'],
            'reason' => ['nullable', 'string', 'max:255'],
        ]);

        $updated = 0;
        $errors = [];

        \DB::transaction(function () use ($data, &$updated, &$errors) {
            foreach ($data['adjustments'] as $adj) {
                $contract = Contract::query()
                    ->where('id', $adj['contract_id'])
                    ->first();
                if (! $contract) {
                    $errors[] = ['contract_id' => $adj['contract_id'], 'error' => 'Contrato no encontrado'];
                    continue;
                }
                $oldRent = (float) $contract->monthly_rent;
                $newRent = (float) $adj['new_rent'];
                if (abs($newRent - $oldRent) < 0.01) {
                    continue; // sin cambio
                }
                $contract->monthly_rent = $newRent;
                $contract->save();

                $contract->load('commissionSplits');
                CommissionService::recalculateAmounts($contract);

                $updated++;
            }
        });

        return response()->json([
            'ok' => true,
            'updated' => $updated,
            'total' => count($data['adjustments']),
            'errors' => $errors,
        ]);
    }
}
