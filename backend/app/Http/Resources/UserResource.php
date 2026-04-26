<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\User */
class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'role' => $this->role,
            'avatar_url' => $this->avatar_url,
            'phone' => $this->phone,
            'agency' => $this->whenLoaded('agency', fn () => [
                'id' => $this->agency->id,
                'name' => $this->agency->name,
                'slug' => $this->agency->slug,
                'plan' => $this->agency->plan,
                'currency' => $this->agency->currency ?? 'CLP',
                'locale' => $this->agency->locale ?? 'es-CL',
            ]),
        ];
    }
}
