<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Jobs\GenerateMonthlyChargesJob;
use App\Models\Charge;
use App\Models\Lead;
use App\Models\LeadActivity;
use App\Models\Payment;
use App\Models\Property;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    /**
     * Financial flow: monthly issued vs collected for the last N months.
     */
    public function financial(Request $request): JsonResponse
    {
        $months = (int) $request->integer('months', 12);
        $base = Carbon::now()->startOfMonth();

        $rows = collect();
        for ($i = $months - 1; $i >= 0; $i--) {
            $start = $base->copy()->subMonthsNoOverflow($i)->startOfMonth();
            $end = $start->copy()->endOfMonth();

            $issued = (float) Charge::whereBetween('issued_at', [$start, $end])->sum('amount');
            $collected = (float) Payment::whereBetween('received_at', [$start, $end])->sum('amount');
            $pendingByMonth = (float) Charge::whereBetween('due_date', [$start, $end])
                ->whereIn('status', ['pendiente', 'parcial', 'vencido'])
                ->sum(DB::raw('amount - paid_amount'));

            $rows->push([
                'month' => $start->format('Y-m'),
                'label' => $start->translatedFormat('M'),
                'issued' => $issued,
                'collected' => $collected,
                'pending' => $pendingByMonth,
                'collection_rate' => $issued > 0 ? round(($collected / $issued) * 100, 1) : 0,
            ]);
        }

        $totalIssued = (float) $rows->sum('issued');
        $totalCollected = (float) $rows->sum('collected');

        return response()->json([
            'data' => $rows,
            'summary' => [
                'total_issued' => $totalIssued,
                'total_collected' => $totalCollected,
                'avg_collection_rate' => $totalIssued > 0 ? round(($totalCollected / $totalIssued) * 100, 1) : 0,
                'months' => $months,
            ],
        ]);
    }

    /**
     * Aging report (morosidad): pending amount bucketed by days overdue.
     */
    public function aging(): JsonResponse
    {
        $today = Carbon::today();
        $buckets = [
            ['label' => 'Al día', 'min' => null, 'max' => 0],   // due_date >= hoy (no vencido)
            ['label' => '1-30 días', 'min' => 1, 'max' => 30],
            ['label' => '31-60 días', 'min' => 31, 'max' => 60],
            ['label' => '61-90 días', 'min' => 61, 'max' => 90],
            ['label' => '+90 días', 'min' => 91, 'max' => null],
        ];

        $rows = collect();

        foreach ($buckets as $b) {
            $q = Charge::query()
                ->whereIn('status', ['pendiente', 'parcial', 'vencido']);

            if ($b['min'] === null) {
                // Al día: no vencido aún
                $q->where('due_date', '>=', $today);
            } else {
                $maxDate = $today->copy()->subDays($b['min']);
                $q->where('due_date', '<=', $maxDate);
                if ($b['max'] !== null) {
                    $minDate = $today->copy()->subDays($b['max']);
                    $q->where('due_date', '>=', $minDate);
                }
            }

            $rows->push([
                'label' => $b['label'],
                'count' => (int) $q->count(),
                'amount' => (float) $q->sum(DB::raw('amount - paid_amount')),
            ]);
        }

        // Top 10 deudores
        $debtors = Charge::query()
            ->whereIn('status', ['pendiente', 'parcial', 'vencido'])
            ->select('person_id', DB::raw('SUM(amount - paid_amount) as total_owed'), DB::raw('COUNT(*) as charges_count'))
            ->groupBy('person_id')
            ->orderByDesc('total_owed')
            ->with('person:id,first_name,last_name,email,phone')
            ->limit(10)
            ->get()
            ->map(fn ($row) => [
                'person_id' => $row->person_id,
                'name' => trim(optional($row->person)->first_name.' '.optional($row->person)->last_name),
                'email' => optional($row->person)->email,
                'phone' => optional($row->person)->phone,
                'total_owed' => (float) $row->total_owed,
                'charges_count' => (int) $row->charges_count,
            ]);

        return response()->json([
            'buckets' => $rows,
            'top_debtors' => $debtors,
            'total_pending' => (float) $rows->sum('amount'),
        ]);
    }

    /**
     * Top properties by collected revenue.
     */
    public function propertiesRevenue(Request $request): JsonResponse
    {
        $months = (int) $request->integer('months', 12);
        $since = Carbon::now()->subMonths($months)->startOfMonth();

        $rows = Payment::query()
            ->join('charges', 'charges.id', '=', 'payments.charge_id')
            ->join('contracts', 'contracts.id', '=', 'charges.contract_id')
            ->join('properties', 'properties.id', '=', 'contracts.property_id')
            ->where('payments.received_at', '>=', $since)
            ->groupBy('properties.id', 'properties.title', 'properties.code', 'properties.city')
            ->orderByDesc(DB::raw('SUM(payments.amount)'))
            ->limit(15)
            ->select(
                'properties.id',
                'properties.title',
                'properties.code',
                'properties.city',
                DB::raw('SUM(payments.amount) as collected'),
                DB::raw('COUNT(DISTINCT payments.id) as payments_count'),
            )
            ->get()
            ->map(fn ($row) => [
                'id' => (int) $row->id,
                'title' => $row->title,
                'code' => $row->code,
                'city' => $row->city,
                'collected' => (float) $row->collected,
                'payments_count' => (int) $row->payments_count,
            ]);

        $available = Property::where('status', 'disponible')->count();
        $occupied = Property::where('status', 'arrendada')->count();
        $total = Property::count();
        $occupancy = $total > 0 ? round(($occupied / $total) * 100, 1) : 0;

        return response()->json([
            'top_properties' => $rows,
            'occupancy' => [
                'total' => $total,
                'available' => $available,
                'occupied' => $occupied,
                'occupancy_rate' => $occupancy,
            ],
        ]);
    }

    /**
     * Pipeline conversion + funnel.
     */
    public function pipelineConversion(): JsonResponse
    {
        // Funnel actual: cuántos leads hay en cada stage por status
        $byStage = DB::table('leads')
            ->join('stages', 'stages.id', '=', 'leads.stage_id')
            ->select('stages.id', 'stages.name', 'stages.position', 'stages.is_won', 'stages.is_lost',
                DB::raw('COUNT(*) as total'),
                DB::raw('SUM(leads.value) as value'))
            ->groupBy('stages.id', 'stages.name', 'stages.position', 'stages.is_won', 'stages.is_lost')
            ->orderBy('stages.position')
            ->get()
            ->map(fn ($r) => [
                'stage_id' => (int) $r->id,
                'name' => $r->name,
                'is_won' => (bool) $r->is_won,
                'is_lost' => (bool) $r->is_lost,
                'count' => (int) $r->total,
                'value' => (float) $r->value,
            ]);

        // Conversiones: leads creados vs ganados últimos 6 meses
        $base = Carbon::now()->startOfMonth();
        $monthly = collect();
        for ($i = 5; $i >= 0; $i--) {
            $start = $base->copy()->subMonthsNoOverflow($i)->startOfMonth();
            $end = $start->copy()->endOfMonth();

            $created = Lead::whereBetween('created_at', [$start, $end])->count();
            $won = Lead::where('status', 'won')
                ->whereBetween('updated_at', [$start, $end])
                ->count();
            $lost = Lead::where('status', 'lost')
                ->whereBetween('updated_at', [$start, $end])
                ->count();

            $monthly->push([
                'month' => $start->format('Y-m'),
                'label' => $start->translatedFormat('M'),
                'created' => $created,
                'won' => $won,
                'lost' => $lost,
                'conversion_rate' => $created > 0 ? round(($won / $created) * 100, 1) : 0,
            ]);
        }

        // Tiempo medio en cada stage (días) — basado en lead_activities stage_change consecutivos
        // Simplificación: tiempo promedio en cada stage = AVG(updated_at - created_at) para los leads que ya pasaron por ahí
        // Para no complicar, devolvemos sólo los leads abiertos con el tiempo en su stage actual.
        $avgDaysInStage = DB::table('leads')
            ->join('stages', 'stages.id', '=', 'leads.stage_id')
            ->where('leads.status', 'open')
            ->select(
                'stages.id',
                'stages.name',
                DB::raw('AVG(EXTRACT(EPOCH FROM (NOW() - leads.last_activity_at)) / 86400) as avg_days'),
            )
            ->groupBy('stages.id', 'stages.name')
            ->orderBy('stages.position')
            ->get()
            ->map(fn ($r) => [
                'stage_id' => (int) $r->id,
                'name' => $r->name,
                'avg_days' => round((float) $r->avg_days, 1),
            ]);

        return response()->json([
            'funnel' => $byStage,
            'monthly' => $monthly,
            'avg_days_in_stage' => $avgDaysInStage,
        ]);
    }

    /**
     * Agent performance.
     */
    public function agentsPerformance(): JsonResponse
    {
        $rows = User::query()
            ->withCount([
                'agency as leads_open' => function ($q) {
                    // dummy — necesitamos consulta directa
                },
            ])
            ->get();

        // Mejor: query directa
        $agents = DB::table('users')
            ->leftJoin('leads as l_open', function ($j) {
                $j->on('l_open.assigned_user_id', '=', 'users.id')
                    ->where('l_open.status', '=', 'open')
                    ->whereNull('l_open.deleted_at');
            })
            ->leftJoin('leads as l_won', function ($j) {
                $j->on('l_won.assigned_user_id', '=', 'users.id')
                    ->where('l_won.status', '=', 'won')
                    ->whereNull('l_won.deleted_at');
            })
            ->leftJoin('contracts', function ($j) {
                $j->on('contracts.agent_user_id', '=', 'users.id')
                    ->whereNull('contracts.deleted_at');
            })
            ->where('users.active', true)
            ->whereNotNull('users.agency_id')
            ->groupBy('users.id', 'users.name', 'users.email', 'users.role', 'users.avatar_url')
            ->select(
                'users.id', 'users.name', 'users.email', 'users.role', 'users.avatar_url',
                DB::raw('COUNT(DISTINCT l_open.id) as leads_open'),
                DB::raw('COUNT(DISTINCT l_won.id) as leads_won'),
                DB::raw('COUNT(DISTINCT contracts.id) as contracts_count'),
                DB::raw('COALESCE(SUM(DISTINCT contracts.monthly_rent), 0) as managed_rent'),
            )
            ->orderByDesc('leads_won')
            ->get()
            ->map(fn ($u) => [
                'id' => (int) $u->id,
                'name' => $u->name,
                'email' => $u->email,
                'role' => $u->role,
                'leads_open' => (int) $u->leads_open,
                'leads_won' => (int) $u->leads_won,
                'contracts_count' => (int) $u->contracts_count,
                'managed_rent' => (float) $u->managed_rent,
            ]);

        // Suprime warning de variable inicial
        unset($rows);

        return response()->json([
            'data' => $agents,
        ]);
    }

    /**
     * Manually trigger monthly charge generation. Returns the result.
     */
    public function generateCharges(Request $request): JsonResponse
    {
        $month = $request->string('month')->toString() ?: null;
        $job = new GenerateMonthlyChargesJob($request->user()->agency_id, $month);
        $result = $job->handle();

        return response()->json($result);
    }
}
