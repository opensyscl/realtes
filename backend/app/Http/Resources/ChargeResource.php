<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\Charge */
class ChargeResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'code' => $this->code,
            'concept' => $this->concept,
            'description' => $this->description,
            'amount' => (float) $this->amount,
            'paid_amount' => (float) $this->paid_amount,
            'pending' => (float) $this->amount - (float) $this->paid_amount,
            'issued_at' => $this->issued_at?->toDateString(),
            'due_date' => $this->due_date?->toDateString(),
            'paid_at' => $this->paid_at?->toDateString(),
            'status' => $this->status,
            'recurring' => (bool) $this->recurring,
            'late_fee' => (float) $this->late_fee,
            'contract' => $this->whenLoaded('contract', fn () => [
                'id' => $this->contract->id,
                'code' => $this->contract->code,
            ]),
            'person' => $this->whenLoaded('person', fn () => [
                'id' => $this->person->id,
                'full_name' => trim("{$this->person->first_name} {$this->person->last_name}"),
            ]),
            'payments_count' => $this->whenCounted('payments'),
        ];
    }
}
