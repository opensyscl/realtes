<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CommissionSplitResource;
use App\Models\CommissionSplit;
use App\Services\CommissionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class CommissionController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $q = CommissionSplit::query()
            ->with([
                'user:id,name,role,avatar_url',
                'contract:id,code,monthly_rent,property_id',
                'contract.property:id,code,title',
            ]);

        if ($status = $request->string('status')->toString()) {
            $q->where('status', $status);
        }
        if ($userId = $request->integer('user_id')) {
            $q->where('user_id', $userId);
        }
        if ($role = $request->string('role')->toString()) {
            $q->where('role', $role);
        }
        if ($from = $request->string('from')->toString()) {
            $q->where('created_at', '>=', $from);
        }
        if ($to = $request->string('to')->toString()) {
            $q->where('created_at', '<=', $to);
        }

        $sort = $request->string('sort', 'created_at')->toString();
        $dir = $request->string('dir', 'desc')->toString() === 'asc' ? 'asc' : 'desc';
        if (! in_array($sort, ['created_at', 'amount', 'paid_at'], true)) {
            $sort = 'created_at';
        }
        $q->orderBy($sort, $dir);

        $perPage = min(max((int) $request->integer('per_page', 25), 5), 100);

        return CommissionSplitResource::collection($q->paginate($perPage));
    }

    public function listForContract(int $contractId): AnonymousResourceCollection
    {
        return CommissionSplitResource::collection(
            CommissionSplit::where('contract_id', $contractId)
                ->with(['user:id,name,role,avatar_url'])
                ->orderBy('id')
                ->get(),
        );
    }

    public function pay(Request $request, CommissionSplit $commission): CommissionSplitResource
    {
        $data = $request->validate([
            'paid_at' => ['nullable', 'date'],
            'payment_reference' => ['nullable', 'string', 'max:80'],
            'notes' => ['nullable', 'string'],
        ]);

        $commission->update([
            'status' => CommissionSplit::STATUS_PAID,
            'paid_at' => $data['paid_at'] ?? now()->toDateString(),
            'payment_reference' => $data['payment_reference'] ?? null,
            'notes' => $data['notes'] ?? $commission->notes,
        ]);

        return new CommissionSplitResource($commission->fresh()->load(['user', 'contract']));
    }

    public function update(Request $request, CommissionSplit $commission): CommissionSplitResource
    {
        $data = $request->validate([
            'pct' => ['sometimes', 'numeric', 'between:0,100'],
            'role' => ['sometimes', Rule::in(['captador', 'vendedor', 'broker', 'otros'])],
            'user_id' => ['sometimes', 'nullable', 'integer', 'exists:users,id'],
            'status' => ['sometimes', Rule::in(['pending', 'paid', 'cancelled'])],
            'notes' => ['sometimes', 'nullable', 'string'],
        ]);

        $commission->update($data);

        // Si cambió el pct, recalcular el amount basado en el contrato
        if (isset($data['pct'])) {
            $contract = $commission->contract;
            $total = CommissionSplit::calculateTotalForContract($contract);
            $commission->update([
                'amount' => round($total * (float) $commission->pct / 100, 2),
            ]);
        }

        return new CommissionSplitResource($commission->fresh()->load(['user', 'contract']));
    }

    /**
     * Crear un split adicional para un contrato (manual, ej. broker externo).
     */
    public function store(Request $request, int $contractId): CommissionSplitResource
    {
        $data = $request->validate([
            'user_id' => ['nullable', 'integer', 'exists:users,id'],
            'role' => ['required', Rule::in(['captador', 'vendedor', 'broker', 'otros'])],
            'pct' => ['required', 'numeric', 'between:0,100'],
            'notes' => ['nullable', 'string'],
        ]);

        $contract = \App\Models\Contract::findOrFail($contractId);
        $total = CommissionSplit::calculateTotalForContract($contract);

        $split = CommissionSplit::create([
            'agency_id' => $contract->agency_id,
            'contract_id' => $contract->id,
            'user_id' => $data['user_id'] ?? null,
            'role' => $data['role'],
            'pct' => $data['pct'],
            'amount' => round($total * (float) $data['pct'] / 100, 2),
            'status' => CommissionSplit::STATUS_PENDING,
            'notes' => $data['notes'] ?? null,
        ]);

        return new CommissionSplitResource($split->load(['user', 'contract']));
    }

    public function destroy(CommissionSplit $commission): JsonResponse
    {
        $commission->delete();

        return response()->json(['ok' => true]);
    }

    public function stats(): JsonResponse
    {
        $base = CommissionSplit::query();
        $month = Carbon::now();

        return response()->json([
            'total_pending' => (float) (clone $base)->where('status', 'pending')->sum('amount'),
            'pending_count' => (clone $base)->where('status', 'pending')->count(),
            'paid_this_month' => (float) (clone $base)
                ->where('status', 'paid')
                ->whereYear('paid_at', $month->year)
                ->whereMonth('paid_at', $month->month)
                ->sum('amount'),
            'paid_this_month_count' => (clone $base)
                ->where('status', 'paid')
                ->whereYear('paid_at', $month->year)
                ->whereMonth('paid_at', $month->month)
                ->count(),
            'top_agents' => (clone $base)
                ->select('user_id', DB::raw('SUM(amount) as total'), DB::raw('COUNT(*) as count'))
                ->whereNotNull('user_id')
                ->groupBy('user_id')
                ->orderByDesc('total')
                ->with('user:id,name,avatar_url')
                ->limit(5)
                ->get()
                ->map(fn ($r) => [
                    'user_id' => $r->user_id,
                    'name' => optional($r->user)->name,
                    'avatar_url' => optional($r->user)->avatar_url,
                    'total' => (float) $r->total,
                    'count' => (int) $r->count,
                ]),
        ]);
    }

    /**
     * Backfill: genera splits para contratos vigentes que aún no los tienen.
     */
    public function backfill(): JsonResponse
    {
        $count = 0;
        \App\Models\Contract::with('commissionSplits')
            ->whereDoesntHave('commissionSplits')
            ->whereIn('status', ['vigente', 'renovado'])
            ->chunkById(50, function ($contracts) use (&$count) {
                foreach ($contracts as $c) {
                    CommissionService::generateDefaultSplits($c);
                    $count++;
                }
            });

        return response()->json(['generated' => $count]);
    }
}
