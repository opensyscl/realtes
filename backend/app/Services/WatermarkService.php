<?php

namespace App\Services;

use App\Models\Agency;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Spatie\Image\Enums\AlignPosition;
use Spatie\Image\Enums\Unit;
use Spatie\Image\Image;

/**
 * Aplica el watermark configurado en la Agency a un archivo subido.
 *
 * Uso: pasar el UploadedFile (tmp del upload) + agency + contexto. Devuelve
 * el path a un archivo procesado (en tmp) que luego se entrega a Spatie Media.
 * Si el watermark está deshabilitado o no aplica al contexto, devuelve el
 * archivo original sin tocar.
 */
class WatermarkService
{
    /**
     * @param  string  $context  cover | gallery | floors
     * @return string  Path local al archivo procesado (o el original si no aplicó)
     */
    public function apply(UploadedFile $file, Agency $agency, string $context = 'gallery'): string
    {
        return $this->applyToPath(
            sourcePath: $file->getRealPath(),
            extension: $file->getClientOriginalExtension() ?: 'jpg',
            mimeType: (string) $file->getMimeType(),
            agency: $agency,
            context: $context,
        );
    }

    /**
     * Versión que trabaja directamente con un path en disco — útil para
     * re-aplicar watermark a una foto ya subida (descargada de R2 a tmp).
     *
     * @return string  Path al archivo procesado, o $sourcePath si no aplicó.
     */
    public function applyToPath(
        string $sourcePath,
        string $extension,
        string $mimeType,
        Agency $agency,
        string $context = 'gallery',
    ): string {
        $settings = $agency->watermarkSettings();

        if (! ($settings['enabled'] ?? false)) {
            return $sourcePath;
        }

        $contextKey = match ($context) {
            'cover' => 'apply_to_cover',
            'floors' => 'apply_to_floors',
            default => 'apply_to_gallery',
        };
        if (! ($settings[$contextKey] ?? false)) {
            return $sourcePath;
        }

        if (! str_starts_with($mimeType, 'image/')) {
            return $sourcePath;
        }

        try {
            return $this->applyImageWatermark($sourcePath, $extension, $agency, $settings);
        } catch (\Throwable $e) {
            Log::warning('Watermark falló, se sube la foto original', [
                'agency_id' => $agency->id,
                'error' => $e->getMessage(),
            ]);
            return $sourcePath;
        }
    }

    private function applyImageWatermark(string $sourcePath, string $extension, Agency $agency, array $s): string
    {
        // 1. Asegurar que tenemos una imagen de watermark local (cacheada)
        $watermarkPath = $this->ensureWatermarkAsset($agency, $s);
        if (! $watermarkPath) {
            return $sourcePath;
        }

        // 2. Crear un destino temporal (mismo formato que el original)
        $ext = $extension ?: 'jpg';
        $outPath = sys_get_temp_dir() . '/' . 'wm_' . Str::random(12) . '.' . $ext;
        copy($sourcePath, $outPath);

        // 3. Aplicar
        $position = $this->mapAlignment($s['alignment'] ?? 'bottom_right');
        $opacity = max(0, min(100, (int) ($s['opacity'] ?? 70)));
        $widthPct = max(5, min(100, (int) ($s['size_value'] ?? 30)));
        $padX = abs((int) ($s['offset_x'] ?? 0));
        $padY = abs((int) ($s['offset_y'] ?? 0));
        $unit = ($s['offset_unit'] ?? 'px') === 'percent' ? Unit::Percent : Unit::Pixel;
        $quality = max(40, min(100, (int) ($s['quality'] ?? 90)));

        Image::load($outPath)
            ->watermark(
                watermarkImage: $watermarkPath,
                position: $position,
                paddingX: $padX,
                paddingY: $padY,
                paddingUnit: $unit,
                width: $widthPct,
                widthUnit: Unit::Percent,
                alpha: $opacity,
            )
            ->quality($quality)
            ->save($outPath);

        return $outPath;
    }

    /**
     * Asegura que tenemos el archivo del watermark local. Si la agency usa una
     * imagen subida (URL R2), la descargamos y cacheamos local; si usa modo
     * texto, generamos un PNG transparente con el texto.
     */
    private function ensureWatermarkAsset(Agency $agency, array $s): ?string
    {
        $type = $s['type'] ?? 'image';
        $cacheDir = storage_path('app/watermarks');
        if (! is_dir($cacheDir)) {
            mkdir($cacheDir, 0775, true);
        }

        if ($type === 'text') {
            return $this->renderTextWatermark($agency, $s, $cacheDir);
        }

        // Imagen
        if (! $agency->watermark_image_url) {
            return null;
        }

        $cachePath = $cacheDir . "/agency_{$agency->id}.png";
        // Re-descargar si no existe o si tiene >24h
        $needsFetch = ! file_exists($cachePath)
            || (time() - filemtime($cachePath)) > 86400;

        if ($needsFetch) {
            try {
                $res = Http::timeout(8)->get($agency->watermark_image_url);
                if (! $res->successful()) {
                    return null;
                }
                file_put_contents($cachePath, $res->body());
            } catch (\Throwable $e) {
                Log::warning('No se pudo descargar watermark', [
                    'agency_id' => $agency->id,
                    'url' => $agency->watermark_image_url,
                    'error' => $e->getMessage(),
                ]);
                return file_exists($cachePath) ? $cachePath : null;
            }
        }

        return $cachePath;
    }

    /**
     * Genera un PNG transparente con el texto del watermark. Cacheado por
     * (agency_id, hash del texto+color) para no regenerar en cada upload.
     */
    private function renderTextWatermark(Agency $agency, array $s, string $cacheDir): ?string
    {
        $text = trim((string) ($s['text'] ?? '')) ?: $agency->name;
        if ($text === '') {
            return null;
        }
        $color = $s['text_color'] ?? '#ffffff';

        $hash = substr(md5($text . $color), 0, 10);
        $cachePath = $cacheDir . "/agency_{$agency->id}_text_{$hash}.png";
        if (file_exists($cachePath)) {
            return $cachePath;
        }

        // Necesitamos GD habilitado para esto
        if (! function_exists('imagecreatetruecolor')) {
            return null;
        }

        // Tamaño base — la imagen final se va a escalar via spatie/image
        $w = 800;
        $h = 200;
        $img = imagecreatetruecolor($w, $h);
        imagesavealpha($img, true);
        $transparent = imagecolorallocatealpha($img, 0, 0, 0, 127);
        imagefill($img, 0, 0, $transparent);

        [$r, $g, $b] = $this->hexToRgb($color);
        $textColor = imagecolorallocate($img, $r, $g, $b);

        // Buscar fuente — usar la del proyecto si existe, sinó GD default
        $font = base_path('storage/app/fonts/EuclidCircularB-Bold.ttf');
        if (file_exists($font)) {
            $size = 56;
            $bbox = imagettfbbox($size, 0, $font, $text);
            $textWidth = abs($bbox[4] - $bbox[0]);
            $textHeight = abs($bbox[5] - $bbox[1]);
            $x = (int) (($w - $textWidth) / 2);
            $y = (int) (($h + $textHeight) / 2);
            imagettftext($img, $size, 0, $x, $y, $textColor, $font, $text);
        } else {
            // Fallback con bitmap font
            $font = 5;
            $tw = imagefontwidth($font) * strlen($text);
            $th = imagefontheight($font);
            imagestring($img, $font, (int) (($w - $tw) / 2), (int) (($h - $th) / 2), $text, $textColor);
        }

        imagepng($img, $cachePath);
        imagedestroy($img);
        return $cachePath;
    }

    private function mapAlignment(string $a): AlignPosition
    {
        return match ($a) {
            'top_left' => AlignPosition::TopLeft,
            'top' => AlignPosition::Top,
            'top_right' => AlignPosition::TopRight,
            'left' => AlignPosition::Left,
            'center' => AlignPosition::Center,
            'right' => AlignPosition::Right,
            'bottom_left' => AlignPosition::BottomLeft,
            'bottom' => AlignPosition::Bottom,
            default => AlignPosition::BottomRight,
        };
    }

    private function hexToRgb(string $hex): array
    {
        $hex = ltrim($hex, '#');
        if (strlen($hex) === 3) {
            $hex = $hex[0] . $hex[0] . $hex[1] . $hex[1] . $hex[2] . $hex[2];
        }
        return [
            (int) hexdec(substr($hex, 0, 2)),
            (int) hexdec(substr($hex, 2, 2)),
            (int) hexdec(substr($hex, 4, 2)),
        ];
    }
}
