<?php

namespace App\Services\MercadoLibre;

use App\Models\Lead;
use App\Models\LeadActivity;
use App\Models\MlPublication;
use App\Models\MlToken;
use App\Models\Pipeline;
use App\Models\Property;
use App\Services\NotificationService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

/**
 * Despacha eventos del webhook ML a su handler:
 *  - topic="items": refresca status/permalink de la publicación
 *  - topic="vis_leads.*": crea Lead en el pipeline + actividad + notifica
 */
class MlWebhookProcessor
{
    public function process(array $payload): void
    {
        $topic = (string) ($payload['topic'] ?? '');
        $resource = (string) ($payload['resource'] ?? '');
        $userId = (int) ($payload['user_id'] ?? 0);

        if (! $topic) {
            Log::warning('ML webhook sin topic', $payload);
            return;
        }

        $token = $userId
            ? MlToken::where('ml_user_id', $userId)->first()
            : null;

        if (! $token) {
            Log::warning('ML webhook sin token asociable', ['user_id' => $userId, 'topic' => $topic]);
            return;
        }

        match (true) {
            $topic === 'items' => $this->handleItem($token, $resource),
            Str::startsWith($topic, 'vis_leads.') => $this->handleVisLead($token, $topic, $resource),
            default => Log::info('ML webhook topic no soportado', ['topic' => $topic]),
        };
    }

    private function handleItem(MlToken $token, string $resource): void
    {
        $itemId = trim(str_replace('/items/', '', $resource));
        if ($itemId === '') {
            return;
        }

        $client = MlClient::for($token);
        try {
            $item = $client->get("/items/{$itemId}");
        } catch (\Throwable $e) {
            Log::warning('ML fetch item failed', ['item' => $itemId, 'err' => $e->getMessage()]);
            return;
        }

        $pub = MlPublication::where('agency_id', $token->agency_id)
            ->where('ml_item_id', $itemId)
            ->first();
        if (! $pub) {
            return;
        }

        $pub->update([
            'ml_status' => $item['status'] ?? $pub->ml_status,
            'ml_permalink' => $item['permalink'] ?? $pub->ml_permalink,
            'last_synced_at' => now(),
        ]);
    }

    private function handleVisLead(MlToken $token, string $topic, string $resource): void
    {
        $client = MlClient::for($token);
        try {
            $detail = $client->get($resource);
        } catch (\Throwable $e) {
            Log::warning('ML fetch lead failed', ['resource' => $resource, 'err' => $e->getMessage()]);
            return;
        }

        $itemId = (string) ($detail['item_id'] ?? '');
        $pub = $itemId
            ? MlPublication::where('agency_id', $token->agency_id)->where('ml_item_id', $itemId)->first()
            : null;
        $property = $pub
            ? Property::withoutGlobalScopes()->find($pub->property_id)
            : null;

        $name = (string) ($detail['contact']['name'] ?? $detail['name'] ?? 'Lead Mercado Libre');
        $email = (string) ($detail['contact']['email'] ?? $detail['email'] ?? '');
        $phone = (string) ($detail['contact']['phone'] ?? $detail['phone'] ?? '');
        $message = (string) ($detail['message'] ?? $detail['question'] ?? '');

        $pipeline = Pipeline::withoutGlobalScopes()
            ->where('agency_id', $token->agency_id)
            ->orderByDesc('is_default')->orderBy('position')
            ->with(['stages' => fn ($q) => $q->orderBy('position')])
            ->first();

        if (! $pipeline || ! $pipeline->stages->first()) {
            Log::warning('ML VIS lead sin pipeline destino', [
                'agency_id' => $token->agency_id, 'topic' => $topic,
            ]);
            return;
        }
        $stage = $pipeline->stages->first();

        $lead = DB::transaction(function () use ($token, $pipeline, $stage, $property, $name, $email, $phone, $message, $topic) {
            $position = (int) Lead::withoutGlobalScopes()
                ->where('stage_id', $stage->id)->max('position') + 1;

            $lead = Lead::create([
                'agency_id' => $token->agency_id,
                'pipeline_id' => $pipeline->id,
                'stage_id' => $stage->id,
                'position' => $position,
                'property_id' => $property?->id,
                'code' => 'L-'.strtoupper(Str::random(6)),
                'title' => $property
                    ? "Interesado ML en {$property->title}"
                    : "Lead Mercado Libre — {$name}",
                'contact_name' => $name ?: 'Sin nombre',
                'contact_email' => $email ?: null,
                'contact_phone' => $phone ?: null,
                'source' => 'mercadolibre',
                'value' => $property ? (float) ($property->price_rent ?? $property->price_sale ?? 0) : 0,
                'probability_pct' => 25,
                'last_activity_at' => now(),
                'status' => 'open',
                'notes' => $message ?: null,
            ]);

            LeadActivity::create([
                'agency_id' => $token->agency_id,
                'lead_id' => $lead->id,
                'type' => 'note',
                'title' => "Lead capturado vía Mercado Libre ({$topic})",
                'body' => $message ?: null,
                'occurred_at' => now(),
            ]);

            return $lead;
        });

        try {
            NotificationService::leadCreated($lead);
        } catch (\Throwable $e) {
            Log::error('ML lead notification failed', ['lead' => $lead->id, 'err' => $e->getMessage()]);
        }
    }
}
