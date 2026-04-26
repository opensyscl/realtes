<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Contract;
use App\Models\Lead;
use App\Models\Person;
use App\Models\Property;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SearchController extends Controller
{
    /**
     * GET /api/search?q=...
     * Cross-entity search: properties, persons, contracts, leads.
     */
    public function index(Request $request): JsonResponse
    {
        $query = trim($request->string('q')->toString());
        if ($query === '') {
            return response()->json(['data' => []]);
        }

        $like = "%{$query}%";

        $properties = Property::query()
            ->where(function ($q) use ($like) {
                $q->where('title', 'ilike', $like)
                    ->orWhere('code', 'ilike', $like)
                    ->orWhere('address', 'ilike', $like);
            })
            ->limit(5)
            ->get(['id', 'code', 'title', 'address', 'city', 'status', 'price_rent'])
            ->map(fn ($p) => [
                'kind' => 'property',
                'id' => $p->id,
                'code' => $p->code,
                'title' => $p->title,
                'subtitle' => "{$p->address}, {$p->city}",
                'meta' => ['status' => $p->status, 'price_rent' => (float) $p->price_rent],
                'href' => "/propiedades/{$p->id}",
            ]);

        $persons = Person::query()
            ->where(function ($q) use ($like) {
                $q->where('first_name', 'ilike', $like)
                    ->orWhere('last_name', 'ilike', $like)
                    ->orWhere('email', 'ilike', $like)
                    ->orWhere('phone', 'ilike', $like)
                    ->orWhere('nif', 'ilike', $like);
            })
            ->limit(5)
            ->get(['id', 'first_name', 'last_name', 'email', 'phone', 'type'])
            ->map(fn ($p) => [
                'kind' => 'person',
                'id' => $p->id,
                'code' => null,
                'title' => trim("{$p->first_name} {$p->last_name}"),
                'subtitle' => $p->email ?? $p->phone ?? '—',
                'meta' => ['type' => $p->type],
                'href' => "/personas/{$p->id}",
            ]);

        $contracts = Contract::query()
            ->where('code', 'ilike', $like)
            ->limit(5)
            ->with('property:id,title')
            ->get(['id', 'code', 'status', 'monthly_rent', 'property_id'])
            ->map(fn ($c) => [
                'kind' => 'contract',
                'id' => $c->id,
                'code' => $c->code,
                'title' => "Contrato {$c->code}",
                'subtitle' => optional($c->property)->title ?? '—',
                'meta' => ['status' => $c->status, 'monthly_rent' => (float) $c->monthly_rent],
                'href' => "/contratos/{$c->id}",
            ]);

        $leads = Lead::query()
            ->where(function ($q) use ($like) {
                $q->where('title', 'ilike', $like)
                    ->orWhere('code', 'ilike', $like)
                    ->orWhere('contact_name', 'ilike', $like)
                    ->orWhere('contact_email', 'ilike', $like);
            })
            ->limit(5)
            ->get(['id', 'code', 'title', 'contact_name', 'status', 'value'])
            ->map(fn ($l) => [
                'kind' => 'lead',
                'id' => $l->id,
                'code' => $l->code,
                'title' => $l->title,
                'subtitle' => $l->contact_name ?? '—',
                'meta' => ['status' => $l->status, 'value' => (float) $l->value],
                'href' => "/leads",
            ]);

        return response()->json([
            'groups' => [
                ['kind' => 'property', 'label' => 'Propiedades', 'items' => $properties->values()],
                ['kind' => 'person', 'label' => 'Personas', 'items' => $persons->values()],
                ['kind' => 'contract', 'label' => 'Contratos', 'items' => $contracts->values()],
                ['kind' => 'lead', 'label' => 'Leads', 'items' => $leads->values()],
            ],
            'total' => $properties->count() + $persons->count() + $contracts->count() + $leads->count(),
        ]);
    }
}
