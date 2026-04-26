<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreMaintenanceTicketRequest;
use App\Http\Resources\MaintenanceCommentResource;
use App\Http\Resources\MaintenanceTicketResource;
use App\Models\MaintenanceComment;
use App\Models\MaintenanceTicket;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class MaintenanceController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $q = MaintenanceTicket::query()
            ->with([
                'property:id,code,title,address',
                'reporter:id,first_name,last_name,phone',
                'assignedTo:id,name,avatar_url',
            ])
            ->withCount('comments');

        if ($search = $request->string('search')->toString()) {
            $q->where(function ($w) use ($search) {
                $w->where('title', 'ilike', "%{$search}%")
                    ->orWhere('code', 'ilike', "%{$search}%")
                    ->orWhereHas('property', fn ($p) => $p->where('title', 'ilike', "%{$search}%"));
            });
        }

        foreach (['status', 'priority', 'category'] as $col) {
            if ($val = $request->string($col)->toString()) {
                $q->where($col, $val);
            }
        }
        if ($pid = $request->integer('property_id')) {
            $q->where('property_id', $pid);
        }
        if ($aid = $request->integer('assigned_user_id')) {
            $q->where('assigned_user_id', $aid);
        }

        $sort = $request->string('sort', 'opened_at')->toString();
        $dir = $request->string('dir', 'desc')->toString() === 'asc' ? 'asc' : 'desc';
        if (! in_array($sort, ['opened_at', 'priority', 'status', 'estimated_cost'], true)) {
            $sort = 'opened_at';
        }
        $q->orderBy($sort, $dir);

        $perPage = min(max((int) $request->integer('per_page', 25), 5), 100);

        return MaintenanceTicketResource::collection($q->paginate($perPage));
    }

    public function store(StoreMaintenanceTicketRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['code'] = 'M-'.strtoupper(Str::random(6));

        $ticket = DB::transaction(function () use ($data, $request) {
            $ticket = MaintenanceTicket::create($data);

            MaintenanceComment::create([
                'agency_id' => $ticket->agency_id,
                'ticket_id' => $ticket->id,
                'user_id' => $request->user()->id,
                'type' => 'comment',
                'body' => 'Ticket creado.',
            ]);

            return $ticket;
        });

        $ticket->load(['property', 'reporter', 'assignedTo']);

        return (new MaintenanceTicketResource($ticket))->response()->setStatusCode(201);
    }

    public function show(MaintenanceTicket $ticket): MaintenanceTicketResource
    {
        $ticket->load(['property', 'reporter', 'assignedTo'])->loadCount('comments');

        return new MaintenanceTicketResource($ticket);
    }

    public function update(StoreMaintenanceTicketRequest $request, MaintenanceTicket $ticket): MaintenanceTicketResource
    {
        $oldStatus = $ticket->status;
        $oldAssignee = $ticket->assigned_user_id;

        DB::transaction(function () use ($request, $ticket, $oldStatus, $oldAssignee) {
            $data = $request->validated();
            if (isset($data['status']) && in_array($data['status'], ['resuelto', 'cerrado'], true) && ! $ticket->resolved_at) {
                $data['resolved_at'] = now();
            }
            $ticket->update($data);

            if (isset($data['status']) && $data['status'] !== $oldStatus) {
                MaintenanceComment::create([
                    'agency_id' => $ticket->agency_id,
                    'ticket_id' => $ticket->id,
                    'user_id' => $request->user()->id,
                    'type' => 'status_change',
                    'body' => "Estado: {$oldStatus} → {$ticket->status}",
                    'payload' => ['from' => $oldStatus, 'to' => $ticket->status],
                ]);
            }
            if (isset($data['assigned_user_id']) && $data['assigned_user_id'] !== $oldAssignee) {
                MaintenanceComment::create([
                    'agency_id' => $ticket->agency_id,
                    'ticket_id' => $ticket->id,
                    'user_id' => $request->user()->id,
                    'type' => 'assignment',
                    'body' => 'Reasignado.',
                    'payload' => ['from' => $oldAssignee, 'to' => $ticket->assigned_user_id],
                ]);
            }
        });

        return new MaintenanceTicketResource(
            $ticket->fresh()->load(['property', 'reporter', 'assignedTo']),
        );
    }

    public function destroy(MaintenanceTicket $ticket): JsonResponse
    {
        $ticket->delete();

        return response()->json(['ok' => true]);
    }

    public function comments(MaintenanceTicket $ticket): AnonymousResourceCollection
    {
        return MaintenanceCommentResource::collection(
            $ticket->comments()->with('user:id,name')->paginate(50),
        );
    }

    public function storeComment(Request $request, MaintenanceTicket $ticket): JsonResponse
    {
        $data = $request->validate([
            'body' => ['required', 'string'],
            'type' => ['nullable', Rule::in(['comment', 'status_change', 'assignment', 'cost_update'])],
        ]);

        $comment = MaintenanceComment::create([
            'agency_id' => $ticket->agency_id,
            'ticket_id' => $ticket->id,
            'user_id' => $request->user()->id,
            'type' => $data['type'] ?? 'comment',
            'body' => $data['body'],
        ]);

        return (new MaintenanceCommentResource($comment->load('user')))
            ->response()
            ->setStatusCode(201);
    }

    public function stats(): JsonResponse
    {
        $base = MaintenanceTicket::query();

        return response()->json([
            'open' => (clone $base)->where('status', 'abierto')->count(),
            'in_progress' => (clone $base)->where('status', 'en_progreso')->count(),
            'urgent_open' => (clone $base)
                ->whereIn('status', ['abierto', 'en_progreso', 'esperando_proveedor'])
                ->where('priority', 'urgente')
                ->count(),
            'resolved_this_month' => (clone $base)
                ->where('status', 'resuelto')
                ->whereYear('resolved_at', now()->year)
                ->whereMonth('resolved_at', now()->month)
                ->count(),
            'total_cost_this_month' => (float) (clone $base)
                ->whereNotNull('actual_cost')
                ->whereYear('resolved_at', now()->year)
                ->whereMonth('resolved_at', now()->month)
                ->sum('actual_cost'),
        ]);
    }
}
