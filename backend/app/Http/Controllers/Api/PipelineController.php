<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\PipelineResource;
use App\Models\Pipeline;
use App\Models\Stage;
use App\Services\PlanGate;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class PipelineController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        $pipelines = Pipeline::with([
            'stages' => fn ($q) => $q->withCount('leads')
                ->withSum(['leads as leads_value' => fn ($q2) => $q2->where('status', 'open')], 'value'),
        ])
            ->orderBy('position')
            ->get();

        return PipelineResource::collection($pipelines);
    }

    public function store(Request $request): JsonResponse
    {
        $agency = \App\Models\Agency::find($request->user()->agency_id);
        $check = PlanGate::canCreatePipeline($agency);
        if (! $check['allowed']) {
            return response()->json([
                'message' => "Has alcanzado el límite de pipelines de tu plan ({$check['current']}/{$check['limit']}). Actualiza tu plan para crear más.",
                'limit_reached' => true,
                'feature' => 'pipelines',
            ], 402);
        }

        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'purpose' => ['required', Rule::in(['alquiler', 'venta', 'captacion', 'otros'])],
            'stages' => ['sometimes', 'array', 'min:2'],
            'stages.*.name' => ['required_with:stages', 'string', 'max:80'],
            'stages.*.color' => ['sometimes', Rule::in(['neutral', 'info', 'positive', 'warning', 'negative'])],
            'stages.*.probability_pct' => ['sometimes', 'integer', 'between:0,100'],
            'stages.*.is_won' => ['sometimes', 'boolean'],
            'stages.*.is_lost' => ['sometimes', 'boolean'],
        ]);

        $pipeline = DB::transaction(function () use ($data, $agency) {
            $position = (int) Pipeline::withoutGlobalScopes()
                ->where('agency_id', $agency->id)
                ->max('position') + 1;

            $pipeline = Pipeline::create([
                'agency_id' => $agency->id,
                'name' => $data['name'],
                'slug' => Str::slug($data['name']).'-'.Str::lower(Str::random(4)),
                'purpose' => $data['purpose'],
                'is_default' => false,
                'position' => $position,
            ]);

            $stages = $data['stages'] ?? $this->defaultStages();
            foreach ($stages as $i => $s) {
                Stage::create([
                    'agency_id' => $agency->id,
                    'pipeline_id' => $pipeline->id,
                    'name' => $s['name'],
                    'color' => $s['color'] ?? 'neutral',
                    'position' => $i,
                    'probability_pct' => $s['probability_pct'] ?? (int) round(($i + 1) * 100 / count($stages)),
                    'is_won' => (bool) ($s['is_won'] ?? false),
                    'is_lost' => (bool) ($s['is_lost'] ?? false),
                ]);
            }

            return $pipeline;
        });

        $pipeline->load('stages');
        return response()->json(['data' => new PipelineResource($pipeline)], 201);
    }

    public function update(Request $request, Pipeline $pipeline): JsonResponse
    {
        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:120'],
            'purpose' => ['sometimes', Rule::in(['alquiler', 'venta', 'captacion', 'otros'])],
            'is_default' => ['sometimes', 'boolean'],
        ]);

        if (isset($data['is_default']) && $data['is_default']) {
            // Solo un default por agency
            Pipeline::where('agency_id', $pipeline->agency_id)
                ->where('id', '!=', $pipeline->id)
                ->update(['is_default' => false]);
        }

        $pipeline->update($data);

        return response()->json(['data' => new PipelineResource($pipeline->fresh()->load('stages'))]);
    }

    public function destroy(Pipeline $pipeline): JsonResponse
    {
        if ($pipeline->is_default) {
            return response()->json(['message' => 'No se puede eliminar el pipeline por defecto'], 422);
        }
        if ($pipeline->leads()->count() > 0) {
            return response()->json(['message' => 'Este pipeline tiene leads. Reasígnalos antes de eliminarlo.'], 422);
        }
        $pipeline->delete();
        return response()->json(['ok' => true]);
    }

    // ---------------- Stages ----------------

    public function storeStage(Request $request, Pipeline $pipeline): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:80'],
            'color' => ['sometimes', Rule::in(['neutral', 'info', 'positive', 'warning', 'negative'])],
            'probability_pct' => ['sometimes', 'integer', 'between:0,100'],
            'is_won' => ['sometimes', 'boolean'],
            'is_lost' => ['sometimes', 'boolean'],
        ]);

        $position = (int) Stage::where('pipeline_id', $pipeline->id)->max('position') + 1;

        $stage = Stage::create([
            'agency_id' => $pipeline->agency_id,
            'pipeline_id' => $pipeline->id,
            'name' => $data['name'],
            'color' => $data['color'] ?? 'neutral',
            'position' => $position,
            'probability_pct' => $data['probability_pct'] ?? 50,
            'is_won' => (bool) ($data['is_won'] ?? false),
            'is_lost' => (bool) ($data['is_lost'] ?? false),
        ]);

        return response()->json(['data' => $stage], 201);
    }

    public function updateStage(Request $request, Stage $stage): JsonResponse
    {
        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:80'],
            'color' => ['sometimes', Rule::in(['neutral', 'info', 'positive', 'warning', 'negative'])],
            'probability_pct' => ['sometimes', 'integer', 'between:0,100'],
            'is_won' => ['sometimes', 'boolean'],
            'is_lost' => ['sometimes', 'boolean'],
        ]);

        $stage->update($data);
        return response()->json(['data' => $stage->fresh()]);
    }

    public function destroyStage(Stage $stage): JsonResponse
    {
        if ($stage->leads()->count() > 0) {
            return response()->json([
                'message' => 'Este stage tiene leads. Muévelos a otro stage primero.',
            ], 422);
        }
        $stage->delete();
        return response()->json(['ok' => true]);
    }

    public function reorderStages(Request $request, Pipeline $pipeline): JsonResponse
    {
        $data = $request->validate([
            'order' => ['required', 'array', 'min:1'],
            'order.*' => ['integer'],
        ]);

        DB::transaction(function () use ($pipeline, $data) {
            foreach ($data['order'] as $position => $stageId) {
                Stage::where('id', $stageId)
                    ->where('pipeline_id', $pipeline->id)
                    ->update(['position' => $position]);
            }
        });

        return response()->json(['ok' => true]);
    }

    private function defaultStages(): array
    {
        return [
            ['name' => 'Nuevo', 'color' => 'neutral', 'probability_pct' => 10, 'is_won' => false, 'is_lost' => false],
            ['name' => 'En proceso', 'color' => 'info', 'probability_pct' => 50, 'is_won' => false, 'is_lost' => false],
            ['name' => 'Ganado', 'color' => 'positive', 'probability_pct' => 100, 'is_won' => true, 'is_lost' => false],
            ['name' => 'Perdido', 'color' => 'negative', 'probability_pct' => 0, 'is_won' => false, 'is_lost' => true],
        ];
    }
}
