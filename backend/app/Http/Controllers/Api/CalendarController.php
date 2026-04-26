<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LeadActivity;
use App\Models\MaintenanceTicket;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class CalendarController extends Controller
{
    /**
     * Próximas visitas (lead activities tipo visit_scheduled + maintenance con scheduled_for).
     * GET /api/calendar/upcoming?days=14
     */
    public function upcoming(Request $request): JsonResponse
    {
        $days = (int) $request->integer('days', 14);
        $from = Carbon::today();
        $to = $from->copy()->addDays($days);

        $visits = LeadActivity::query()
            ->where('type', 'visit_scheduled')
            ->whereBetween('occurred_at', [$from, $to])
            ->with(['lead:id,code,title,contact_name,contact_phone', 'user:id,name'])
            ->orderBy('occurred_at')
            ->get()
            ->map(fn ($a) => [
                'id' => 'visit-'.$a->id,
                'kind' => 'visit',
                'title' => $a->title ?? 'Visita',
                'description' => $a->body,
                'datetime' => $a->occurred_at?->toIso8601String(),
                'lead' => $a->lead ? [
                    'id' => $a->lead->id,
                    'code' => $a->lead->code,
                    'title' => $a->lead->title,
                    'contact_name' => $a->lead->contact_name,
                    'contact_phone' => $a->lead->contact_phone,
                ] : null,
                'agent' => $a->user ? ['id' => $a->user->id, 'name' => $a->user->name] : null,
            ]);

        $maintenance = MaintenanceTicket::query()
            ->whereIn('status', ['abierto', 'en_progreso', 'esperando_proveedor'])
            ->whereNotNull('scheduled_for')
            ->whereBetween('scheduled_for', [$from->toDateString(), $to->toDateString()])
            ->with(['property:id,title,address', 'assignedTo:id,name'])
            ->orderBy('scheduled_for')
            ->get()
            ->map(fn ($t) => [
                'id' => 'maint-'.$t->id,
                'kind' => 'maintenance',
                'title' => $t->title,
                'description' => $t->vendor ? "Proveedor: {$t->vendor}" : null,
                'datetime' => $t->scheduled_for?->toIso8601String(),
                'property' => $t->property ? [
                    'id' => $t->property->id,
                    'title' => $t->property->title,
                    'address' => $t->property->address,
                ] : null,
                'agent' => $t->assignedTo ? ['id' => $t->assignedTo->id, 'name' => $t->assignedTo->name] : null,
                'priority' => $t->priority,
                'category' => $t->category,
                'code' => $t->code,
            ]);

        $all = $visits->concat($maintenance)->sortBy('datetime')->values();

        return response()->json(['data' => $all]);
    }
}
