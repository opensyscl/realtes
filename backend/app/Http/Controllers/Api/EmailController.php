<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\TemplatedEmail;
use App\Models\EmailLog;
use App\Models\EmailTemplate;
use App\Models\Person;
use App\Services\EmailRenderer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\Rule;

class EmailController extends Controller
{
    public function indexTemplates(): JsonResponse
    {
        $templates = EmailTemplate::orderBy('is_system', 'desc')
            ->orderBy('name')
            ->get();

        return response()->json([
            'data' => $templates,
            'available_tags' => EmailRenderer::availableTags(),
        ]);
    }

    public function showTemplate(EmailTemplate $template): JsonResponse
    {
        return response()->json(['data' => $template]);
    }

    public function storeTemplate(Request $request): JsonResponse
    {
        $data = $request->validate([
            'code' => ['required', 'string', 'max:60', 'regex:/^[a-z0-9_]+$/',
                Rule::unique('email_templates', 'code')->where('agency_id', $request->user()->agency_id),
            ],
            'name' => ['required', 'string', 'max:120'],
            'subject' => ['required', 'string', 'max:200'],
            'body' => ['required', 'string'],
            'audience' => ['sometimes', Rule::in(['tenant', 'owner', 'lead', 'internal'])],
            'is_active' => ['sometimes', 'boolean'],
        ]);
        $data['is_system'] = false;

        $tpl = EmailTemplate::create($data);

        return response()->json(['data' => $tpl], 201);
    }

    public function updateTemplate(Request $request, EmailTemplate $template): JsonResponse
    {
        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:120'],
            'subject' => ['sometimes', 'string', 'max:200'],
            'body' => ['sometimes', 'string'],
            'audience' => ['sometimes', Rule::in(['tenant', 'owner', 'lead', 'internal'])],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $template->update($data);

        return response()->json(['data' => $template->fresh()]);
    }

    public function destroyTemplate(EmailTemplate $template): JsonResponse
    {
        if ($template->is_system) {
            return response()->json(['message' => 'No se puede eliminar una plantilla del sistema'], 422);
        }
        $template->delete();

        return response()->json(['ok' => true]);
    }

    /**
     * POST /api/email-templates/{tpl}/preview
     * body: { person_id?, contract_id?, charge_id?, lead_id? }
     */
    public function preview(Request $request, EmailTemplate $template): JsonResponse
    {
        $context = $request->validate([
            'person_id' => ['nullable', 'integer'],
            'contract_id' => ['nullable', 'integer'],
            'charge_id' => ['nullable', 'integer'],
            'lead_id' => ['nullable', 'integer'],
        ]);

        $rendered = EmailRenderer::render($template, $context);

        return response()->json([
            'subject' => $rendered['subject'],
            'body' => $rendered['body'],
        ]);
    }

    /**
     * POST /api/email-templates/{tpl}/send
     * body: { recipient_email, person_id?, contract_id?, charge_id?, lead_id? }
     */
    public function send(Request $request, EmailTemplate $template): JsonResponse
    {
        $data = $request->validate([
            'recipient_email' => ['required', 'email', 'max:160'],
            'person_id' => ['nullable', 'integer'],
            'contract_id' => ['nullable', 'integer'],
            'charge_id' => ['nullable', 'integer'],
            'lead_id' => ['nullable', 'integer'],
        ]);

        $rendered = EmailRenderer::render($template, $data);

        $log = EmailLog::create([
            'agency_id' => $template->agency_id,
            'template_id' => $template->id,
            'person_id' => $data['person_id'] ?? null,
            'contract_id' => $data['contract_id'] ?? null,
            'charge_id' => $data['charge_id'] ?? null,
            'lead_id' => $data['lead_id'] ?? null,
            'sent_by' => $request->user()->id,
            'recipient_email' => $data['recipient_email'],
            'subject' => $rendered['subject'],
            'body' => $rendered['body'],
            'status' => 'queued',
        ]);

        try {
            Mail::to($data['recipient_email'])
                ->send(new TemplatedEmail($rendered['subject'], $rendered['body']));

            $log->update(['status' => 'sent', 'sent_at' => now()]);
        } catch (\Throwable $e) {
            $log->update(['status' => 'failed', 'error' => $e->getMessage()]);

            return response()->json([
                'message' => 'Error enviando email: '.$e->getMessage(),
                'log_id' => $log->id,
            ], 500);
        }

        return response()->json(['ok' => true, 'log_id' => $log->id]);
    }

    public function logs(Request $request): JsonResponse
    {
        $q = EmailLog::query()
            ->with(['template:id,name,code', 'person:id,first_name,last_name', 'sender:id,name'])
            ->orderByDesc('created_at');

        if ($status = $request->string('status')->toString()) {
            $q->where('status', $status);
        }
        if ($templateId = $request->integer('template_id')) {
            $q->where('template_id', $templateId);
        }

        $perPage = min(max((int) $request->integer('per_page', 25), 5), 100);
        $paginated = $q->paginate($perPage);

        return response()->json([
            'data' => collect($paginated->items())->map(fn ($l) => [
                'id' => $l->id,
                'recipient_email' => $l->recipient_email,
                'subject' => $l->subject,
                'status' => $l->status,
                'error' => $l->error,
                'sent_at' => $l->sent_at?->toIso8601String(),
                'created_at' => $l->created_at?->toIso8601String(),
                'template' => $l->template ? [
                    'id' => $l->template->id,
                    'name' => $l->template->name,
                    'code' => $l->template->code,
                ] : null,
                'person' => $l->person ? [
                    'id' => $l->person->id,
                    'full_name' => trim($l->person->first_name.' '.$l->person->last_name),
                ] : null,
                'sender' => $l->sender ? ['id' => $l->sender->id, 'name' => $l->sender->name] : null,
            ])->all(),
            'meta' => [
                'current_page' => $paginated->currentPage(),
                'last_page' => $paginated->lastPage(),
                'per_page' => $paginated->perPage(),
                'total' => $paginated->total(),
            ],
        ]);
    }

    public function showLog(EmailLog $log): JsonResponse
    {
        return response()->json(['data' => $log->load(['template', 'person'])]);
    }

    /**
     * Helper para que el frontend pueda buscar destinatarios rápido al enviar.
     * GET /api/email-templates/recipients?q=...
     */
    public function searchRecipients(Request $request): JsonResponse
    {
        $term = $request->string('q')->toString();
        $query = Person::query()->whereNotNull('email');
        if ($term) {
            $query->where(function ($w) use ($term) {
                $w->where('first_name', 'ilike', "%{$term}%")
                    ->orWhere('last_name', 'ilike', "%{$term}%")
                    ->orWhere('email', 'ilike', "%{$term}%");
            });
        }

        return response()->json([
            'data' => $query->limit(8)->get()->map(fn ($p) => [
                'id' => $p->id,
                'full_name' => trim($p->first_name.' '.$p->last_name),
                'email' => $p->email,
                'type' => $p->type,
            ]),
        ]);
    }
}
