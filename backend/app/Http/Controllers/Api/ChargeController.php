<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ChargeResource;
use App\Models\Charge;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ChargeController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $q = Charge::query()
            ->with(['contract:id,code', 'person:id,first_name,last_name'])
            ->withCount('payments');

        if ($status = $request->string('status')->toString()) {
            $q->where('status', $status);
        }
        if ($contractId = $request->integer('contract_id')) {
            $q->where('contract_id', $contractId);
        }
        if ($personId = $request->integer('person_id')) {
            $q->where('person_id', $personId);
        }
        if ($from = $request->string('from')->toString()) {
            $q->where('due_date', '>=', $from);
        }
        if ($to = $request->string('to')->toString()) {
            $q->where('due_date', '<=', $to);
        }

        $sort = $request->string('sort', 'due_date')->toString();
        $dir = $request->string('dir', 'desc')->toString() === 'asc' ? 'asc' : 'desc';
        if (! in_array($sort, ['due_date', 'issued_at', 'amount', 'paid_at', 'code'], true)) {
            $sort = 'due_date';
        }
        $q->orderBy($sort, $dir);

        $perPage = min(max((int) $request->integer('per_page', 25), 5), 100);

        return ChargeResource::collection($q->paginate($perPage));
    }

    public function show(Charge $charge): ChargeResource
    {
        $charge->load(['contract', 'person'])->loadCount('payments');

        return new ChargeResource($charge);
    }

    public function stats(): JsonResponse
    {
        $base = Charge::query();

        return response()->json([
            'pending_count' => (clone $base)->where('status', 'pendiente')->count(),
            'overdue_count' => (clone $base)->where('status', 'vencido')->count(),
            'paid_count_this_month' => (clone $base)->where('status', 'pagado')
                ->whereMonth('paid_at', now()->month)
                ->whereYear('paid_at', now()->year)
                ->count(),
            'total_pending_amount' => (float) (clone $base)
                ->whereIn('status', ['pendiente', 'parcial', 'vencido'])
                ->sum('amount'),
            'collected_this_month' => (float) (clone $base)
                ->whereMonth('paid_at', now()->month)
                ->whereYear('paid_at', now()->year)
                ->sum('paid_amount'),
        ]);
    }
}
