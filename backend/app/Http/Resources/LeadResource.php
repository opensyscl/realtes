<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\Lead */
class LeadResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'code' => $this->code,
            'title' => $this->title,
            'pipeline_id' => $this->pipeline_id,
            'stage_id' => $this->stage_id,
            'position' => $this->position,
            'contact_name' => $this->contact_name,
            'contact_email' => $this->contact_email,
            'contact_phone' => $this->contact_phone,
            'source' => $this->source,
            'value' => (float) $this->value,
            'probability_pct' => $this->probability_pct,
            'requirements' => $this->requirements ?? [],
            'notes' => $this->notes,
            'expected_close_date' => $this->expected_close_date?->toDateString(),
            'last_activity_at' => $this->last_activity_at?->toIso8601String(),
            'status' => $this->status,
            'lost_reason' => $this->lost_reason,
            'converted_contract_id' => $this->converted_contract_id,
            'assigned_to' => $this->whenLoaded('assignedTo', fn () => $this->assignedTo ? [
                'id' => $this->assignedTo->id,
                'name' => $this->assignedTo->name,
                'avatar_url' => $this->assignedTo->avatar_url,
            ] : null),
            'person' => $this->whenLoaded('person', fn () => $this->person ? [
                'id' => $this->person->id,
                'full_name' => trim("{$this->person->first_name} {$this->person->last_name}"),
            ] : null),
            'property' => $this->whenLoaded('property', fn () => $this->property ? [
                'id' => $this->property->id,
                'code' => $this->property->code,
                'title' => $this->property->title,
            ] : null),
            'activities_count' => $this->whenCounted('activities'),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
