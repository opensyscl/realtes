<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePersonRequest;
use App\Http\Resources\PersonResource;
use App\Models\Person;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class PersonController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $q = Person::query()
            ->withCount(['rentedContracts', 'ownedContracts']);

        if ($search = $request->string('search')->toString()) {
            $q->where(function ($w) use ($search) {
                $w->where('first_name', 'ilike', "%{$search}%")
                    ->orWhere('last_name', 'ilike', "%{$search}%")
                    ->orWhere('email', 'ilike', "%{$search}%")
                    ->orWhere('nif', 'ilike', "%{$search}%")
                    ->orWhere('phone', 'ilike', "%{$search}%");
            });
        }

        if ($type = $request->string('type')->toString()) {
            $q->where('type', $type);
        }

        $sort = $request->string('sort', 'created_at')->toString();
        $dir = $request->string('dir', 'desc')->toString() === 'asc' ? 'asc' : 'desc';
        if (! in_array($sort, ['created_at', 'first_name', 'last_name', 'type'], true)) {
            $sort = 'created_at';
        }
        $q->orderBy($sort, $dir);

        $perPage = min(max((int) $request->integer('per_page', 20), 5), 100);

        return PersonResource::collection($q->paginate($perPage));
    }

    public function store(StorePersonRequest $request): JsonResponse
    {
        $person = Person::create($request->validated());

        return (new PersonResource($person))->response()->setStatusCode(201);
    }

    public function show(Person $person): PersonResource
    {
        $person->loadCount(['rentedContracts', 'ownedContracts']);

        return new PersonResource($person);
    }

    public function update(StorePersonRequest $request, Person $person): PersonResource
    {
        $person->update($request->validated());

        return new PersonResource($person->fresh());
    }

    public function destroy(Person $person): JsonResponse
    {
        $person->delete();

        return response()->json(['ok' => true]);
    }
}
