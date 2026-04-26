<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \Spatie\MediaLibrary\MediaCollections\Models\Media */
class DocumentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'collection' => $this->collection_name,
            'name' => $this->name,
            'file_name' => $this->file_name,
            'mime_type' => $this->mime_type,
            'size' => (int) $this->size,
            'url' => $this->getFullUrl(),
            'category' => $this->getCustomProperty('category', 'otros'),
            'description' => $this->getCustomProperty('description'),
            'uploaded_by' => $this->getCustomProperty('uploaded_by'),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
