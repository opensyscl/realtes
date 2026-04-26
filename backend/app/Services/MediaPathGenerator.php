<?php

namespace App\Services;

use Spatie\MediaLibrary\MediaCollections\Models\Media;
use Spatie\MediaLibrary\Support\PathGenerator\PathGenerator;

/**
 * PathGenerator custom para organizar archivos en R2 (o cualquier disk)
 * con una estructura coherente:
 *
 *   agencies/{agency_id}/properties/{property_id}/{collection}/{media_id}/file.ext
 *   agencies/{agency_id}/contracts/{contract_id}/{collection}/{media_id}/file.ext
 *   agencies/{agency_id}/agents/{user_id}/avatar/{media_id}/file.ext
 *   agencies/{agency_id}/_misc/{model_table}/{model_id}/{collection}/{media_id}/file.ext
 *
 * Usar `media_id/file.ext` evita colisiones cuando dos uploads tienen el
 * mismo filename y mantiene compatible las conversions de Spatie.
 */
class MediaPathGenerator implements PathGenerator
{
    public function getPath(Media $media): string
    {
        return $this->basePath($media).'/';
    }

    public function getPathForConversions(Media $media): string
    {
        return $this->basePath($media).'/conversions/';
    }

    public function getPathForResponsiveImages(Media $media): string
    {
        return $this->basePath($media).'/responsive/';
    }

    private function basePath(Media $media): string
    {
        $owner = $media->model;
        $collection = $media->collection_name ?: 'misc';
        $mediaId = $media->getKey();

        // Resolver agency_id según el dueño
        $agencyId = $this->resolveAgencyId($owner);
        $agencyPart = $agencyId ? "agencies/{$agencyId}" : 'shared';

        if ($owner instanceof \App\Models\Property) {
            return "{$agencyPart}/properties/{$owner->id}/{$collection}/{$mediaId}";
        }
        if ($owner instanceof \App\Models\Contract) {
            return "{$agencyPart}/contracts/{$owner->id}/{$collection}/{$mediaId}";
        }
        if ($owner instanceof \App\Models\User) {
            return "{$agencyPart}/users/{$owner->id}/{$collection}/{$mediaId}";
        }
        if ($owner instanceof \App\Models\Person) {
            return "{$agencyPart}/persons/{$owner->id}/{$collection}/{$mediaId}";
        }

        // Fallback genérico
        $table = $owner?->getTable() ?? 'unknown';
        $ownerId = $owner?->getKey() ?? 'orphan';
        return "{$agencyPart}/_misc/{$table}/{$ownerId}/{$collection}/{$mediaId}";
    }

    private function resolveAgencyId(?object $owner): ?int
    {
        if (! $owner) {
            return null;
        }
        if (isset($owner->agency_id)) {
            return (int) $owner->agency_id;
        }
        return null;
    }
}
