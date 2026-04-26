<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\Person */
class PersonResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'type' => $this->type,
            'first_name' => $this->first_name,
            'last_name' => $this->last_name,
            'full_name' => trim("{$this->first_name} {$this->last_name}"),
            'nif' => $this->nif,
            'email' => $this->email,
            'phone' => $this->phone,
            'phone_alt' => $this->phone_alt,
            'address' => $this->address,
            'city' => $this->city,
            'postal_code' => $this->postal_code,
            'country' => $this->country,
            'iban_last4' => $this->iban_last4,
            'birthday' => $this->birthday?->toDateString(),
            'notes' => $this->notes,
            'tags' => $this->tags ?? [],
            'created_at' => $this->created_at?->toIso8601String(),
            'active_contracts_count' => $this->whenCounted('rentedContracts'),
            'owned_count' => $this->whenCounted('ownedContracts'),
        ];
    }
}
