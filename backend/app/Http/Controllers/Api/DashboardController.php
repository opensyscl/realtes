<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Charge;
use App\Models\Contract;
use App\Models\Payment;
use App\Models\Property;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
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

    public function activityVolume(Request $request): JsonResponse
    {
        // nº actividades = charges emitidos + payments recibidos + contratos creados,
        // agrupado en barras según el período (week = 7 días, month = 4 semanas,
        // quarter = 3 meses).
        $period = $request->query('period', 'week');
        if (! in_array($period, ['week', 'month', 'quarter'], true)) {
            $period = 'week';
        }

        [$buckets, $prevStart, $prevEnd] = $this->volumeBuckets($period);

        $rows = array_map(fn (array $b) => [
            'day' => $b['label'],
            'date' => $b['start']->toDateString(),
            'value' => $this->activityCount($b['start'], $b['end']),
        ], $buckets);

        $total = array_sum(array_column($rows, 'value'));
        $prevTotal = $this->activityCount($prevStart, $prevEnd);

        return response()->json([
            'period' => $period,
            'data' => $rows,
            'total' => $total,
            'average' => (int) round($total / max(count($rows), 1)),
            'delta_pct' => $this->pctChange($prevTotal, $total),
        ]);
    }

    /**
     * Buckets del gráfico según el período, más la ventana del período anterior
     * (para el delta). Cada bucket: ['label', 'start' => Carbon, 'end' => Carbon].
     *
     * @return array{0: list<array{label: string, start: Carbon, end: Carbon}>, 1: Carbon, 2: Carbon}
     */
    private function volumeBuckets(string $period): array
    {
        $today = Carbon::today();
        $buckets = [];

        if ($period === 'quarter') {
            // 3 buckets mensuales.
            $months = ['', 'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
            for ($i = 2; $i >= 0; $i--) {
                $m = $today->copy()->subMonths($i);
                $buckets[] = [
                    'label' => $months[$m->month],
                    'start' => $m->copy()->startOfMonth(),
                    'end' => $m->copy()->endOfMonth(),
                ];
            }

            return [
                $buckets,
                $today->copy()->subMonths(5)->startOfMonth(),
                $today->copy()->subMonths(3)->endOfMonth(),
            ];
        }

        if ($period === 'month') {
            // 4 buckets semanales (28 días).
            for ($i = 3; $i >= 0; $i--) {
                $end = $today->copy()->subDays($i * 7);
                $start = $end->copy()->subDays(6);
                $buckets[] = [
                    'label' => $start->format('j/n'),
                    'start' => $start,
                    'end' => $end,
                ];
            }

            return [
                $buckets,
                $today->copy()->subDays(55),
                $today->copy()->subDays(28),
            ];
        }

        // week: 7 buckets diarios.
        $names = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        for ($i = 6; $i >= 0; $i--) {
            $d = $today->copy()->subDays($i);
            $buckets[] = [
                'label' => $names[$d->dayOfWeek],
                'start' => $d->copy(),
                'end' => $d->copy(),
            ];
        }

        return [
            $buckets,
            $today->copy()->subDays(13),
            $today->copy()->subDays(7),
        ];
    }

    /**
     * Nº de actividades en un rango de fechas: cargos emitidos, pagos recibidos y
     * contratos firmados. Se cuenta por la fecha de dominio del evento (no por
     * created_at) para reflejar cuándo ocurrió realmente la actividad.
     */
    private function activityCount(Carbon $start, Carbon $end): int
    {
        $range = [$start->copy()->startOfDay(), $end->copy()->endOfDay()];

        return Charge::whereBetween('issued_at', $range)->count()
            + Payment::whereBetween('received_at', $range)->count()
            + Contract::whereBetween('signed_at', $range)->count();
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
