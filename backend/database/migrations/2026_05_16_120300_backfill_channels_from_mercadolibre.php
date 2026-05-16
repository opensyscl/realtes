<?php

use App\Models\AgencyChannel;
use App\Models\Channel;
use App\Models\ChannelPublication;
use App\Models\MlPublication;
use App\Models\MlToken;
use Illuminate\Database\Migrations\Migration;

/**
 * Hub de Canales — backfill no destructivo.
 *
 * Copia las conexiones y publicaciones de Mercado Libre existentes
 * (ml_tokens / ml_publications) a las tablas genéricas del Hub. Las tablas
 * originales quedan intactas: ML las sigue usando hasta el corte definitivo.
 *
 * Usa los modelos Eloquent a propósito: MlToken desencripta los tokens al leer
 * y AgencyChannel los vuelve a encriptar al escribir (cast encrypted:array).
 * En contexto de migración no hay usuario autenticado, así que el AgencyScope
 * no filtra nada y agency_id se setea explícito.
 */
return new class extends Migration
{
    public function up(): void
    {
        $channel = Channel::where('slug', Channel::MERCADOLIBRE)->first();
        if (! $channel) {
            return;
        }

        foreach (MlToken::all() as $token) {
            AgencyChannel::updateOrCreate(
                ['agency_id' => $token->agency_id, 'channel_id' => $channel->id],
                [
                    'status' => $token->last_error
                        ? AgencyChannel::STATUS_ERROR
                        : AgencyChannel::STATUS_CONNECTED,
                    'credentials' => [
                        'access_token' => $token->access_token,
                        'refresh_token' => $token->refresh_token,
                        'token_type' => $token->token_type,
                        'scope' => $token->scope,
                        'expires_at' => optional($token->expires_at)->toIso8601String(),
                        'ml_user_id' => $token->ml_user_id,
                    ],
                    'settings' => [
                        'default_listing_type' => $token->default_listing_type,
                        'confirm_before_charge' => (bool) $token->confirm_before_charge,
                    ],
                    'external_account_id' => $token->ml_user_id ? (string) $token->ml_user_id : null,
                    'connected_by_user_id' => $token->connected_by_user_id,
                    'connected_at' => $token->connected_at,
                    'last_synced_at' => $token->last_refresh_at,
                    'last_error' => $token->last_error,
                ],
            );
        }

        foreach (MlPublication::all() as $pub) {
            ChannelPublication::updateOrCreate(
                ['property_id' => $pub->property_id, 'channel_id' => $channel->id],
                [
                    'agency_id' => $pub->agency_id,
                    'external_id' => $pub->ml_item_id ?: null,
                    'external_url' => $pub->ml_permalink,
                    'status' => match ($pub->ml_status) {
                        'active' => ChannelPublication::STATUS_PUBLISHED,
                        'paused' => ChannelPublication::STATUS_PAUSED,
                        'closed' => ChannelPublication::STATUS_CLOSED,
                        'under_review' => ChannelPublication::STATUS_SYNCING,
                        default => ChannelPublication::STATUS_DRAFT,
                    },
                    'external_status' => $pub->ml_status,
                    'category_external_id' => $pub->ml_category_id,
                    'payload_snapshot' => $pub->payload_snapshot,
                    'meta' => ['listing_type_id' => $pub->listing_type_id],
                    'last_synced_at' => $pub->last_synced_at,
                    'published_at' => $pub->published_at,
                    'last_error' => $pub->last_error,
                ],
            );
        }
    }

    public function down(): void
    {
        $channel = Channel::where('slug', Channel::MERCADOLIBRE)->first();
        if (! $channel) {
            return;
        }
        ChannelPublication::where('channel_id', $channel->id)->delete();
        AgencyChannel::where('channel_id', $channel->id)->delete();
    }
};
