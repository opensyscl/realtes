<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\Stage */
class StageResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'color' => $this->color,
            'position' => $this->position,
            'probability_pct' => $this->probability_pct,
            'is_won' => $this->is_won,
            'is_lost' => $this->is_lost,
            'leads_count' => $this->whenCounted('leads'),
            'leads_value' => $this->when(isset($this->leads_value), fn () => (float) $this->leads_value),
        ];
    }
}
