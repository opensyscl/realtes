<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\Payment */
class PaymentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'amount' => (float) $this->amount,
            'method' => $this->method,
            'reference' => $this->reference,
            'received_at' => $this->received_at?->toDateString(),
            'notes' => $this->notes,
            'charge' => $this->whenLoaded('charge', fn () => [
                'id' => $this->charge->id,
                'code' => $this->charge->code,
            ]),
            'registered_by' => $this->whenLoaded('registeredBy', fn () => $this->registeredBy ? [
                'id' => $this->registeredBy->id,
                'name' => $this->registeredBy->name,
            ] : null),
        ];
    }
}
