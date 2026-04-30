<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PropertyInspectionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $photos = $this->getMedia('photos')->sortBy('order_column')->values();

        return [
            'id' => $this->id,
            'property_id' => $this->property_id,
            'contract_id' => $this->contract_id,
            'type' => $this->type,
            'title' => $this->title,
            'description' => $this->description,
            'inspection_date' => $this->inspection_date?->toDateString(),
            'inspector_name' => $this->inspector_name,
            'condition' => $this->condition,
            'signed_by_tenant' => $this->signed_by_tenant,
            'tenant_signed_at' => $this->tenant_signed_at?->toIso8601String(),
            'signed_by_landlord' => $this->signed_by_landlord,
            'landlord_signed_at' => $this->landlord_signed_at?->toIso8601String(),
            'created_by' => $this->whenLoaded('createdBy', fn () => $this->createdBy ? [
                'id' => $this->createdBy->id,
                'name' => $this->createdBy->name,
            ] : null),
            'photos' => $photos->map(function ($m) {
                $cp = $m->custom_properties ?? [];
                return [
                    'id' => $m->id,
                    'url' => $m->getFullUrl(),
                    'name' => $m->name,
                    'mime_type' => $m->mime_type,
                    'size' => $m->size,
                    'description' => $cp['description'] ?? null,
                    'note' => $cp['note'] ?? null,
                    'tag' => $cp['tag'] ?? null,
                ];
            })->values(),
            'photos_count' => $photos->count(),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
