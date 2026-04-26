<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\Property */
class PropertyResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'code' => $this->code,
            'title' => $this->title,
            'type' => $this->type,
            'status' => $this->status,
            'listing_type' => $this->listing_type,
            'bedrooms' => $this->bedrooms,
            'bathrooms' => (float) $this->bathrooms,
            'area_sqm' => $this->area_sqm,
            'floor' => $this->floor,
            'door' => $this->door,
            'address' => $this->address,
            'city' => $this->city,
            'postal_code' => $this->postal_code,
            'province' => $this->province,
            'price_rent' => $this->price_rent !== null ? (float) $this->price_rent : null,
            'price_sale' => $this->price_sale !== null ? (float) $this->price_sale : null,
            'community_fee' => $this->community_fee !== null ? (float) $this->community_fee : null,
            'parking_spaces' => $this->parking_spaces !== null ? (int) $this->parking_spaces : null,
            'year_built' => $this->year_built !== null ? (int) $this->year_built : null,
            'orientation' => $this->orientation,
            'floors_count' => $this->floors_count !== null ? (int) $this->floors_count : null,
            'units_per_floor' => $this->units_per_floor !== null ? (int) $this->units_per_floor : null,
            'terrace_sqm' => $this->terrace_sqm !== null ? (int) $this->terrace_sqm : null,
            'built_sqm' => $this->built_sqm !== null ? (int) $this->built_sqm : null,
            // Interior
            'condition' => $this->condition,
            'suites_count' => $this->suites_count !== null ? (int) $this->suites_count : null,
            'service_rooms' => $this->service_rooms !== null ? (int) $this->service_rooms : null,
            'living_rooms' => $this->living_rooms !== null ? (int) $this->living_rooms : null,
            'service_bathrooms' => $this->service_bathrooms !== null ? (int) $this->service_bathrooms : null,
            'floor_type' => $this->floor_type,
            'gas_type' => $this->gas_type,
            'has_termopanel' => $this->has_termopanel === null ? null : (bool) $this->has_termopanel,
            'hot_water_type' => $this->hot_water_type,
            'heating_type' => $this->heating_type,
            'kitchen_type' => $this->kitchen_type,
            'window_type' => $this->window_type,
            // Exterior
            'elevators_count' => $this->elevators_count !== null ? (int) $this->elevators_count : null,
            'covered_parking_spaces' => $this->covered_parking_spaces !== null ? (int) $this->covered_parking_spaces : null,
            'uncovered_parking_spaces' => $this->uncovered_parking_spaces !== null ? (int) $this->uncovered_parking_spaces : null,
            // Deudas y adquisición
            'acquisition_year' => $this->acquisition_year !== null ? (int) $this->acquisition_year : null,
            'acquisition_method' => $this->acquisition_method,
            'bank_debt' => $this->bank_debt !== null ? (float) $this->bank_debt : null,
            'debt_institution' => $this->debt_institution,
            'requires_guarantor' => $this->requires_guarantor === null ? null : (bool) $this->requires_guarantor,
            'ibi_annual' => $this->ibi_annual !== null ? (float) $this->ibi_annual : null,
            // Otros
            'rooms_count' => $this->rooms_count !== null ? (int) $this->rooms_count : null,
            'parking_sqm' => $this->parking_sqm !== null ? (int) $this->parking_sqm : null,
            'storage_count' => $this->storage_count !== null ? (int) $this->storage_count : null,
            'apartment_subtype' => $this->apartment_subtype,
            'max_occupants' => $this->max_occupants !== null ? (int) $this->max_occupants : null,
            'features' => $this->features ?? [],
            'tags' => $this->tags ?? [],
            'cover_image_url' => $this->cover_image_url,
            'tour_url' => $this->tour_url,
            'video_url' => $this->video_url,
            'is_published' => (bool) $this->is_published,
            'is_shared' => (bool) $this->is_shared,
            'share_pct' => $this->share_pct !== null ? (float) $this->share_pct : null,
            'view_count' => (int) ($this->view_count ?? 0),
            'last_viewed_at' => $this->last_viewed_at?->toIso8601String(),
            'leads_count' => $this->whenCounted('leads'),

            // Captación + identificación + asignaciones
            'currency' => $this->currency,
            'captacion_date' => $this->captacion_date?->toDateString(),
            'captacion_source' => $this->captacion_source,
            'is_exclusive' => (bool) $this->is_exclusive,
            'commission_pct' => $this->commission_pct !== null ? (float) $this->commission_pct : null,
            'rol' => $this->rol,
            'owner_person_id' => $this->owner_person_id,
            'agent_user_id' => $this->agent_user_id,
            'client_person_id' => $this->client_person_id,
            'private_note' => $this->private_note,
            'inventory_notes' => $this->inventory_notes,
            'reception_notes' => $this->reception_notes,
            'booking_enabled' => (bool) $this->booking_enabled,
            'booking_provider' => $this->booking_provider,
            'booking_url' => $this->booking_url,
            'owner' => $this->whenLoaded('owner', fn () => $this->owner ? [
                'id' => $this->owner->id,
                'full_name' => trim("{$this->owner->first_name} {$this->owner->last_name}"),
                'email' => $this->owner->email,
                'phone' => $this->owner->phone,
            ] : null),
            'agent' => $this->whenLoaded('agent', fn () => $this->agent ? [
                'id' => $this->agent->id,
                'name' => $this->agent->name,
                'avatar_url' => $this->agent->avatar_url,
            ] : null),
            'client' => $this->whenLoaded('client', fn () => $this->client ? [
                'id' => $this->client->id,
                'full_name' => trim("{$this->client->first_name} {$this->client->last_name}"),
                'email' => $this->client->email,
                'phone' => $this->client->phone,
            ] : null),
            'building' => $this->whenLoaded('building', fn () => $this->building ? [
                'id' => $this->building->id,
                'name' => $this->building->name,
            ] : null),
            'active_contract' => $this->whenLoaded('activeContract', function () {
                if (! $this->activeContract) {
                    return null;
                }

                return [
                    'id' => $this->activeContract->id,
                    'code' => $this->activeContract->code,
                    'monthly_rent' => (float) $this->activeContract->monthly_rent,
                    'start_date' => $this->activeContract->start_date?->toDateString(),
                    'end_date' => $this->activeContract->end_date?->toDateString(),
                ];
            }),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
