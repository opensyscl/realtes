<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Agency;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class AgencySettingsController extends Controller
{
    public function showTemplate(Request $request): JsonResponse
    {
        $agency = Agency::findOrFail($request->user()->agency_id);

        return response()->json([
            'data' => [
                'preset' => $agency->public_template_preset ?? 'modern_loft',
                'primary_color' => $agency->public_primary_color ?? '#f85757',
                'font' => $agency->public_font ?? 'sans',
                'config' => $agency->publicTemplateConfig(),
                'available_presets' => Agency::TEMPLATE_PRESETS,
            ],
        ]);
    }

    /**
     * Lista los miembros activos de la agencia para selectores (asignar agente, etc.).
     */
    public function members(Request $request): JsonResponse
    {
        $users = \App\Models\User::where('agency_id', $request->user()->agency_id)
            ->where('active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'email', 'role', 'avatar_url']);

        return response()->json(['data' => $users]);
    }

    public function showAgency(Request $request): JsonResponse
    {
        $agency = Agency::findOrFail($request->user()->agency_id);

        return response()->json([
            'data' => [
                'id' => $agency->id,
                'name' => $agency->name,
                'slug' => $agency->slug,
                'email' => $agency->email,
                'phone' => $agency->phone,
                'address' => $agency->address,
                'city' => $agency->city,
                'country' => $agency->country,
                'currency' => $agency->currency ?? 'CLP',
                'locale' => $agency->locale ?? 'es-CL',
                'logo_url' => $agency->logo_url,
            ],
        ]);
    }

    public function updateAgency(Request $request): JsonResponse
    {
        $agency = Agency::findOrFail($request->user()->agency_id);

        // Solo el owner puede modificar la configuración de la agencia
        if ($request->user()->role !== 'owner') {
            return response()->json([
                'message' => 'Solo el owner de la agencia puede modificar la configuración.',
            ], 403);
        }

        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:160'],
            'email' => ['sometimes', 'nullable', 'email', 'max:160'],
            'phone' => ['sometimes', 'nullable', 'string', 'max:30'],
            'address' => ['sometimes', 'nullable', 'string', 'max:255'],
            'city' => ['sometimes', 'nullable', 'string', 'max:120'],
            'country' => ['sometimes', 'nullable', 'string', 'size:2'],
            // ISO 4217: 3 letras mayúsculas
            'currency' => ['sometimes', 'string', 'regex:/^[A-Z]{3}$/'],
            'locale' => ['sometimes', 'string', 'max:10'],
        ]);

        $agency->update($data);

        return $this->showAgency($request);
    }

    public function showWatermark(Request $request): JsonResponse
    {
        $agency = Agency::findOrFail($request->user()->agency_id);

        return response()->json([
            'data' => [
                'image_url' => $agency->watermark_image_url,
                'settings' => $agency->watermarkSettings(),
            ],
        ]);
    }

    public function updateWatermark(Request $request): JsonResponse
    {
        $agency = Agency::findOrFail($request->user()->agency_id);

        if ($request->user()->role !== 'owner') {
            return response()->json([
                'message' => 'Solo el owner puede modificar la marca de agua.',
            ], 403);
        }

        $alignments = [
            'top_left','top','top_right',
            'left','center','right',
            'bottom_left','bottom','bottom_right',
        ];

        $data = $request->validate([
            'enabled' => ['sometimes', 'boolean'],
            'apply_to_cover' => ['sometimes', 'boolean'],
            'apply_to_gallery' => ['sometimes', 'boolean'],
            'apply_to_floors' => ['sometimes', 'boolean'],
            'manual_apply_enabled' => ['sometimes', 'boolean'],
            'alignment' => ['sometimes', Rule::in($alignments)],
            'offset_x' => ['sometimes', 'integer', 'min:-1000', 'max:1000'],
            'offset_y' => ['sometimes', 'integer', 'min:-1000', 'max:1000'],
            'offset_unit' => ['sometimes', Rule::in(['px', 'percent'])],
            'type' => ['sometimes', Rule::in(['image', 'text'])],
            'text' => ['sometimes', 'nullable', 'string', 'max:120'],
            'text_color' => ['sometimes', 'string', 'regex:/^#[0-9a-fA-F]{6}$/'],
            'size_mode' => ['sometimes', Rule::in(['original', 'custom', 'scaled'])],
            'size_value' => ['sometimes', 'numeric', 'min:0', 'max:100'],
            'opacity' => ['sometimes', 'numeric', 'min:0', 'max:100'],
            'quality' => ['sometimes', 'numeric', 'min:0', 'max:100'],
            'format' => ['sometimes', Rule::in(['baseline', 'progressive'])],
        ]);

        $current = $agency->watermarkSettings();
        $agency->watermark_settings = array_merge($current, $data);
        $agency->save();

        return $this->showWatermark($request);
    }

    public function uploadWatermarkImage(Request $request): JsonResponse
    {
        $agency = Agency::findOrFail($request->user()->agency_id);

        if ($request->user()->role !== 'owner') {
            return response()->json([
                'message' => 'Solo el owner puede subir la marca de agua.',
            ], 403);
        }

        $request->validate([
            'file' => ['required', 'file', 'image', 'max:5120'],
        ]);

        $file = $request->file('file');
        $ext = $file->getClientOriginalExtension() ?: 'png';
        $name = Str::uuid()->toString().'.'.$ext;
        $key = "agencies/{$agency->id}/watermark/{$name}";

        $disk = Storage::disk(config('media-library.disk_name', 'public'));
        $disk->put($key, file_get_contents($file->getRealPath()), 'public');

        // Borra la anterior si existe (para no llenar el bucket).
        if ($agency->watermark_image_url) {
            $oldKey = $this->keyFromUrl($agency->watermark_image_url, $disk);
            if ($oldKey && $disk->exists($oldKey)) {
                $disk->delete($oldKey);
            }
        }

        $agency->watermark_image_url = $disk->url($key);
        $agency->save();

        return response()->json([
            'data' => [
                'image_url' => $agency->watermark_image_url,
                'key' => $key,
            ],
        ], 201);
    }

    public function deleteWatermarkImage(Request $request): JsonResponse
    {
        $agency = Agency::findOrFail($request->user()->agency_id);

        if ($request->user()->role !== 'owner') {
            return response()->json([
                'message' => 'Solo el owner puede borrar la marca de agua.',
            ], 403);
        }

        if ($agency->watermark_image_url) {
            $disk = Storage::disk(config('media-library.disk_name', 'public'));
            $oldKey = $this->keyFromUrl($agency->watermark_image_url, $disk);
            if ($oldKey && $disk->exists($oldKey)) {
                $disk->delete($oldKey);
            }
            $agency->watermark_image_url = null;
            $agency->save();
        }

        return response()->json(['data' => ['image_url' => null]]);
    }

    private function keyFromUrl(string $url, $disk): ?string
    {
        $base = rtrim((string) $disk->url(''), '/').'/';
        if (str_starts_with($url, $base)) {
            return substr($url, strlen($base));
        }
        return null;
    }

    public function showQr(Request $request): JsonResponse
    {
        $agency = Agency::findOrFail($request->user()->agency_id);

        return response()->json([
            'data' => [
                'logo_url' => $agency->qr_logo_url,
                'color_main' => $agency->qr_color_main ?: '#C7B593',
                'color_bg' => $agency->qr_color_bg ?: '#ffffff',
            ],
        ]);
    }

    public function updateQr(Request $request): JsonResponse
    {
        $agency = Agency::findOrFail($request->user()->agency_id);

        $data = $request->validate([
            'logo_url' => ['nullable', 'url', 'max:500'],
            'color_main' => ['nullable', 'string', 'regex:/^#[0-9a-fA-F]{6}$/'],
            'color_bg' => ['nullable', 'string', 'regex:/^#[0-9a-fA-F]{6}$/'],
        ]);

        if (array_key_exists('logo_url', $data)) {
            $agency->qr_logo_url = $data['logo_url'];
        }
        if (array_key_exists('color_main', $data)) {
            $agency->qr_color_main = $data['color_main'];
        }
        if (array_key_exists('color_bg', $data)) {
            $agency->qr_color_bg = $data['color_bg'];
        }
        $agency->save();

        return $this->showQr($request);
    }

    public function uploadQrLogo(Request $request): JsonResponse
    {
        $agency = Agency::findOrFail($request->user()->agency_id);

        $request->validate([
            'file' => ['required', 'file', 'image', 'max:5120'],
        ]);

        $file = $request->file('file');
        $ext = $file->getClientOriginalExtension() ?: 'png';
        $name = Str::uuid()->toString().'.'.$ext;
        $key = "agencies/{$agency->id}/qr/{$name}";

        $disk = Storage::disk(config('media-library.disk_name', 'public'));
        $disk->put($key, file_get_contents($file->getRealPath()), 'public');

        $agency->qr_logo_url = $disk->url($key);
        $agency->save();

        return response()->json([
            'data' => [
                'logo_url' => $agency->qr_logo_url,
                'key' => $key,
            ],
        ], 201);
    }

    public function updateTemplate(Request $request): JsonResponse
    {
        $agency = Agency::findOrFail($request->user()->agency_id);

        $data = $request->validate([
            'preset' => ['sometimes', Rule::in(Agency::TEMPLATE_PRESETS)],
            'primary_color' => ['sometimes', 'string', 'regex:/^#[0-9a-fA-F]{6}$/'],
            'font' => ['sometimes', Rule::in(['sans', 'serif', 'display'])],
            'config' => ['sometimes', 'array'],
            'config.hero_style' => ['sometimes', Rule::in(['fullbleed', 'sidebar'])],
            'config.gallery_style' => ['sometimes', Rule::in(['grid', 'slider', 'masonry'])],
            'config.show_features' => ['sometimes', 'boolean'],
            'config.show_amenities_grid' => ['sometimes', 'boolean'],
            'config.show_map' => ['sometimes', 'boolean'],
            'config.show_agent' => ['sometimes', 'boolean'],
            'config.show_mortgage_calc' => ['sometimes', 'boolean'],
            'config.show_similar' => ['sometimes', 'boolean'],
            'config.show_tour' => ['sometimes', 'boolean'],
        ]);

        if (isset($data['preset'])) {
            $agency->public_template_preset = $data['preset'];
        }
        if (isset($data['primary_color'])) {
            $agency->public_primary_color = $data['primary_color'];
        }
        if (isset($data['font'])) {
            $agency->public_font = $data['font'];
        }
        if (isset($data['config'])) {
            $current = $agency->publicTemplateConfig();
            $agency->public_template_config = array_merge($current, $data['config']);
        }
        $agency->save();

        return $this->showTemplate($request);
    }
}
