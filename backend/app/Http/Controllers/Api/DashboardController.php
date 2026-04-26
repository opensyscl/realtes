<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Charge;
use App\Models\Contract;
use App\Models\Payment;
use App\Models\Property;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function overview(): JsonResponse
    {
        $now = Carbon::now();
        $monthAgo = $now->copy()->subMonth();

        // Properties
        $propsTotal = Property::count();
        $propsAvailable = Property::where('status', 'disponible')->count();
        $propsRented = Property::where('status', 'arrendada')->count();
        $propsAvailableLast = Property::where('status', 'disponible')
            ->where('created_at', '<=', $monthAgo)->count();

        // Active contracts
        $activeContracts = Contract::where('status', 'vigente')->count();
        $activeContractsLast = Contract::where('status', 'vigente')
            ->where('start_date', '<=', $monthAgo->toDateString())->count();

        // Collection rate this month
        $issuedThisMonth = (float) Charge::whereYear('issued_at', $now->year)
            ->whereMonth('issued_at', $now->month)
            ->sum('amount');
        $collectedThisMonth = (float) Payment::whereYear('received_at', $now->year)
            ->whereMonth('received_at', $now->month)
            ->sum('amount');
        $collectionRate = $issuedThisMonth > 0
            ? round(($collectedThisMonth / $issuedThisMonth) * 100, 1)
            : 0;
        $issuedLast = (float) Charge::whereYear('issued_at', $monthAgo->year)
            ->whereMonth('issued_at', $monthAgo->month)
            ->sum('amount');
        $collectedLast = (float) Payment::whereYear('received_at', $monthAgo->year)
            ->whereMonth('received_at', $monthAgo->month)
            ->sum('amount');
        $collectionRateLast = $issuedLast > 0 ? round(($collectedLast / $issuedLast) * 100, 1) : 0;

        // Sparkline (últimos 9 meses): nuevos contratos por mes
        $sparkContracts = collect(range(8, 0))->map(function (int $offset) use ($now) {
            $d = $now->copy()->subMonths($offset);

            return Contract::whereYear('start_date', $d->year)
                ->whereMonth('start_date', $d->month)
                ->count();
        })->values();

        $sparkRevenue = collect(range(8, 0))->map(function (int $offset) use ($now) {
            $d = $now->copy()->subMonths($offset);

            return (float) Payment::whereYear('received_at', $d->year)
                ->whereMonth('received_at', $d->month)
                ->sum('amount');
        })->values();

        $sparkAvailable = collect(range(8, 0))->map(function (int $offset) use ($now) {
            $d = $now->copy()->subMonths($offset)->endOfMonth();

            return Property::where('status', 'disponible')
                ->where('created_at', '<=', $d)
                ->count();
        })->values();

        return response()->json([
            'kpis' => [
                'properties_active' => [
                    'value' => $propsTotal,
                    'available' => $propsAvailable,
                    'rented' => $propsRented,
                    'delta_pct' => $this->pctChange($propsAvailableLast, $propsAvailable),
                    'trend' => $sparkAvailable,
                ],
                'active_contracts' => [
                    'value' => $activeContracts,
                    'delta_pct' => $this->pctChange($activeContractsLast, $activeContracts),
                    'trend' => $sparkContracts,
                ],
                'collection_rate' => [
                    'value' => $collectionRate,
                    'delta_pct' => round($collectionRate - $collectionRateLast, 1),
                    'trend' => $sparkRevenue,
                ],
            ],
        ]);
    }

    public function activityVolume(): JsonResponse
    {
        // últimos 7 días: nº actividades = charges emitidos + payments recibidos + contratos creados
        $today = Carbon::today();
        $rows = [];
        for ($i = 6; $i >= 0; $i--) {
            $d = $today->copy()->subDays($i);
            $charges = Charge::whereDate('created_at', $d)->count();
            $payments = Payment::whereDate('created_at', $d)->count();
            $contracts = Contract::whereDate('created_at', $d)->count();
            $rows[] = [
                'day' => ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'][$d->dayOfWeek],
                'date' => $d->toDateString(),
                'value' => $charges + $payments + $contracts,
            ];
        }

        return response()->json([
            'data' => $rows,
            'total' => array_sum(array_column($rows, 'value')),
        ]);
    }

    public function activityFeed(): JsonResponse
    {
        $items = collect();

        Contract::with('property:id,title')
            ->orderByDesc('created_at')
            ->limit(8)
            ->get()
            ->each(function ($c) use ($items) {
                $items->push([
                    'type' => 'contract',
                    'title' => 'Contrato '.$c->code,
                    'description' => optional($c->property)->title ?? '—',
                    'time' => $c->created_at?->format('H:i'),
                    'created_at' => $c->created_at?->toIso8601String(),
                ]);
            });

        Payment::with('charge:id,code')
            ->orderByDesc('created_at')
            ->limit(8)
            ->get()
            ->each(function ($p) use ($items) {
                $items->push([
                    'type' => 'payment',
                    'title' => 'Pago recibido',
                    'description' => '€'.number_format((float) $p->amount, 2, ',', '.'),
                    'time' => $p->created_at?->format('H:i'),
                    'created_at' => $p->created_at?->toIso8601String(),
                ]);
            });

        Charge::where('status', 'vencido')
            ->orderByDesc('due_date')
            ->limit(5)
            ->get()
            ->each(function ($c) use ($items) {
                $items->push([
                    'type' => 'overdue',
                    'title' => 'Mora detectada',
                    'description' => $c->code.' · €'.number_format((float) $c->amount, 0),
                    'time' => $c->due_date?->format('d/m'),
                    'created_at' => $c->due_date?->toIso8601String(),
                ]);
            });

        $sorted = $items
            ->sortByDesc('created_at')
            ->take(12)
            ->values();

        return response()->json(['data' => $sorted]);
    }

    private function pctChange(float $old, float $new): float
    {
        if ($old <= 0) {
            return $new > 0 ? 100.0 : 0.0;
        }

        return round((($new - $old) / $old) * 100, 1);
    }
}
