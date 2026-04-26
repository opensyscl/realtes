<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\Contract */
class ContractResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'code' => $this->code,
            'type' => $this->type,
            'status' => $this->status,
            'start_date' => $this->start_date?->toDateString(),
            'end_date' => $this->end_date?->toDateString(),
            'monthly_rent' => (float) $this->monthly_rent,
            'deposit' => (float) $this->deposit,
            'commission_pct' => (float) $this->commission_pct,
            'ipc_adjustment' => (bool) $this->ipc_adjustment,
            'payment_day' => $this->payment_day,
            'signed_at' => $this->signed_at?->toDateString(),
            'notes' => $this->notes,
            'property' => $this->whenLoaded('property', fn () => [
                'id' => $this->property->id,
                'code' => $this->property->code,
                'title' => $this->property->title,
                'address' => $this->property->address,
                'city' => $this->property->city,
            ]),
            'owner' => $this->whenLoaded('owner', fn () => [
                'id' => $this->owner->id,
                'full_name' => trim("{$this->owner->first_name} {$this->owner->last_name}"),
                'email' => $this->owner->email,
                'phone' => $this->owner->phone,
            ]),
            'tenant' => $this->whenLoaded('tenant', fn () => [
                'id' => $this->tenant->id,
                'full_name' => trim("{$this->tenant->first_name} {$this->tenant->last_name}"),
                'email' => $this->tenant->email,
                'phone' => $this->tenant->phone,
            ]),
            'agent' => $this->whenLoaded('agent', fn () => $this->agent ? [
                'id' => $this->agent->id,
                'name' => $this->agent->name,
            ] : null),
            'charges_count' => $this->whenCounted('charges'),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
