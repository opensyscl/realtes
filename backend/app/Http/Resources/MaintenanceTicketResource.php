<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\MaintenanceTicket */
class MaintenanceTicketResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'code' => $this->code,
            'title' => $this->title,
            'description' => $this->description,
            'category' => $this->category,
            'priority' => $this->priority,
            'status' => $this->status,
            'estimated_cost' => $this->estimated_cost !== null ? (float) $this->estimated_cost : null,
            'actual_cost' => $this->actual_cost !== null ? (float) $this->actual_cost : null,
            'vendor' => $this->vendor,
            'vendor_notes' => $this->vendor_notes,
            'opened_at' => $this->opened_at?->toIso8601String(),
            'resolved_at' => $this->resolved_at?->toIso8601String(),
            'scheduled_for' => $this->scheduled_for?->toDateString(),
            'property' => $this->whenLoaded('property', fn () => [
                'id' => $this->property->id,
                'code' => $this->property->code,
                'title' => $this->property->title,
                'address' => $this->property->address,
            ]),
            'reporter' => $this->whenLoaded('reporter', fn () => $this->reporter ? [
                'id' => $this->reporter->id,
                'full_name' => trim("{$this->reporter->first_name} {$this->reporter->last_name}"),
                'phone' => $this->reporter->phone,
            ] : null),
            'assigned_to' => $this->whenLoaded('assignedTo', fn () => $this->assignedTo ? [
                'id' => $this->assignedTo->id,
                'name' => $this->assignedTo->name,
                'avatar_url' => $this->assignedTo->avatar_url,
            ] : null),
            'comments_count' => $this->whenCounted('comments'),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
