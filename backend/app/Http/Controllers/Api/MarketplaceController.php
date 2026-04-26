<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Property;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MarketplaceController extends Controller
{
    /**
     * GET /api/marketplace
     * Devuelve propiedades compartidas por OTRAS agencias (cross-broker).
     */
    public function index(Request $request): JsonResponse
    {
        $myAgencyId = $request->user()->agency_id;

        $q = Property::withoutGlobalScopes()
            ->where('is_shared', true)
            ->where('is_published', true)
            ->where('status', 'disponible')
            ->where('agency_id', '!=', $myAgencyId)
            ->with(['agency:id,name,slug,phone,email']);

        if ($search = $request->string('search')->toString()) {
            $q->where(function ($w) use ($search) {
                $w->where('title', 'ilike', "%{$search}%")
                    ->orWhere('address', 'ilike', "%{$search}%");
            });
        }
        if ($type = $request->string('type')->toString()) {
            $q->where('type', $type);
        }
        if ($listing = $request->string('listing_type')->toString()) {
            $q->where('listing_type', $listing);
        }
        if ($min = $request->integer('min_price')) {
            $q->where('price_rent', '>=', $min);
        }
        if ($max = $request->integer('max_price')) {
            $q->where('price_rent', '<=', $max);
        }

        $perPage = min(max((int) $request->integer('per_page', 15), 5), 100);
        $paginated = $q->orderByDesc('shared_at')->paginate($perPage);

        return response()->json([
            'data' => collect($paginated->items())->map(fn ($p) => [
                'id' => $p->id,
                'code' => $p->code,
                'title' => $p->title,
                'type' => $p->type,
                'listing_type' => $p->listing_type,
                'address' => $p->address,
                'city' => $p->city,
                'price_rent' => $p->price_rent !== null ? (float) $p->price_rent : null,
                'price_sale' => $p->price_sale !== null ? (float) $p->price_sale : null,
                'bedrooms' => (int) $p->bedrooms,
                'bathrooms' => (float) $p->bathrooms,
                'area_sqm' => $p->area_sqm,
                'cover_image_url' => $p->cover_image_url,
                'share_pct' => (float) $p->share_pct,
                'shared_at' => $p->shared_at ? \Illuminate\Support\Carbon::parse($p->shared_at)->toIso8601String() : null,
                'agency' => [
                    'id' => $p->agency->id,
                    'name' => $p->agency->name,
                    'slug' => $p->agency->slug,
                    'phone' => $p->agency->phone,
                    'email' => $p->agency->email,
                ],
            ])->all(),
            'meta' => [
                'current_page' => $paginated->currentPage(),
                'last_page' => $paginated->lastPage(),
                'per_page' => $paginated->perPage(),
                'total' => $paginated->total(),
            ],
        ]);
    }

    /**
     * POST /api/properties/{id}/share — toggle is_shared
     */
    public function toggleShare(Request $request, Property $property): JsonResponse
    {
        $data = $request->validate([
            'is_shared' => ['required', 'boolean'],
            'share_pct' => ['sometimes', 'numeric', 'between:0,100'],
        ]);

        $property->update([
            'is_shared' => $data['is_shared'],
            'shared_at' => $data['is_shared'] ? now() : null,
            'share_pct' => $data['share_pct'] ?? $property->share_pct,
        ]);

        return response()->json([
            'is_shared' => $property->is_shared,
            'shared_at' => $property->shared_at?->toIso8601String(),
            'share_pct' => (float) $property->share_pct,
        ]);
    }

    public function stats(Request $request): JsonResponse
    {
        $myAgencyId = $request->user()->agency_id;

        return response()->json([
            'available_count' => Property::withoutGlobalScopes()
                ->where('is_shared', true)
                ->where('is_published', true)
                ->where('status', 'disponible')
                ->where('agency_id', '!=', $myAgencyId)
                ->count(),
            'my_shared_count' => Property::withoutGlobalScopes()
                ->where('agency_id', $myAgencyId)
                ->where('is_shared', true)
                ->count(),
            'agencies_sharing' => Property::withoutGlobalScopes()
                ->where('is_shared', true)
                ->where('agency_id', '!=', $myAgencyId)
                ->distinct('agency_id')
                ->count('agency_id'),
        ]);
    }
}
