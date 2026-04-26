<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Alliance;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class AllianceController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $rows = Alliance::query()
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get()
            ->map(fn ($a) => $this->shape($a));

        return response()->json(['data' => $rows]);
    }

    public function show(Alliance $alliance): JsonResponse
    {
        return response()->json(['data' => $this->shape($alliance)]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $this->validateData($request);
        $alliance = Alliance::create($data);
        return response()->json(['data' => $this->shape($alliance)], 201);
    }

    public function update(Request $request, Alliance $alliance): JsonResponse
    {
        $data = $this->validateData($request);
        $alliance->update($data);
        return response()->json(['data' => $this->shape($alliance)]);
    }

    public function destroy(Alliance $alliance): JsonResponse
    {
        $alliance->delete();
        return response()->json(['ok' => true]);
    }

    /** Sube una imagen (logo o benefit_image) a R2 y devuelve la URL. */
    public function uploadImage(Request $request): JsonResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'image', 'max:5120'],
            'kind' => ['required', 'in:logo,benefit'],
        ]);

        $agencyId = $request->user()->agency_id;
        $kind = $request->string('kind');
        $file = $request->file('file');
        $ext = $file->getClientOriginalExtension() ?: 'png';
        $name = Str::uuid()->toString().'.'.$ext;
        $key = "agencies/{$agencyId}/alliances/{$kind}/{$name}";

        $disk = Storage::disk(config('media-library.disk_name', 'public'));
        $disk->put($key, file_get_contents($file->getRealPath()), 'public');

        return response()->json([
            'data' => [
                'key' => $key,
                'url' => $disk->url($key),
            ],
        ], 201);
    }

    /** Reordena las alianzas: recibe array de IDs en el orden deseado. */
    public function reorder(Request $request): JsonResponse
    {
        $data = $request->validate([
            'order' => ['required', 'array'],
            'order.*' => ['integer'],
        ]);

        foreach ($data['order'] as $i => $id) {
            Alliance::where('id', $id)->update(['sort_order' => $i]);
        }

        return response()->json(['ok' => true]);
    }

    private function validateData(Request $request): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:160'],
            'logo_url' => ['nullable', 'url', 'max:500'],
            'description' => ['nullable', 'string', 'max:500'],
            'benefit_title' => ['nullable', 'string', 'max:160'],
            'benefit_image_url' => ['nullable', 'url', 'max:500'],
            'benefit_detail' => ['nullable', 'string', 'max:5000'],
            'phone' => ['nullable', 'string', 'max:30'],
            'whatsapp' => ['nullable', 'string', 'max:30'],
            'instagram' => ['nullable', 'string', 'max:80'],
            'website_url' => ['nullable', 'url', 'max:500'],
            'is_published' => ['sometimes', 'boolean'],
            'sort_order' => ['sometimes', 'integer', 'min:0', 'max:9999'],
        ]);
    }

    private function shape(Alliance $a): array
    {
        return [
            'id' => $a->id,
            'name' => $a->name,
            'logo_url' => $a->logo_url,
            'description' => $a->description,
            'benefit_title' => $a->benefit_title,
            'benefit_image_url' => $a->benefit_image_url,
            'benefit_detail' => $a->benefit_detail,
            'phone' => $a->phone,
            'whatsapp' => $a->whatsapp,
            'instagram' => $a->instagram,
            'website_url' => $a->website_url,
            'is_published' => (bool) $a->is_published,
            'sort_order' => (int) $a->sort_order,
            'created_at' => $a->created_at?->toIso8601String(),
            'updated_at' => $a->updated_at?->toIso8601String(),
        ];
    }
}
