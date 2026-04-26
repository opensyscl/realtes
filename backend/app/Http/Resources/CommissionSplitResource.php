<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\CommissionSplit */
class CommissionSplitResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'role' => $this->role,
            'pct' => (float) $this->pct,
            'amount' => (float) $this->amount,
            'status' => $this->status,
            'paid_at' => $this->paid_at?->toDateString(),
            'payment_reference' => $this->payment_reference,
            'notes' => $this->notes,
            'user' => $this->whenLoaded('user', fn () => $this->user ? [
                'id' => $this->user->id,
                'name' => $this->user->name,
                'role' => $this->user->role,
                'avatar_url' => $this->user->avatar_url,
            ] : null),
            'contract' => $this->whenLoaded('contract', fn () => $this->contract ? [
                'id' => $this->contract->id,
                'code' => $this->contract->code,
                'monthly_rent' => (float) $this->contract->monthly_rent,
            ] : null),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
