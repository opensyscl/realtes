<?php

namespace App\Models\Scopes;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;

class AgencyScope implements Scope
{
    public function apply(Builder $builder, Model $model): void
    {
        // Solo aplicamos cuando hay un usuario autenticado con agency_id.
        // El super-admin (sin agency_id) ve todo.
        if (auth()->check() && auth()->user()->agency_id) {
            $builder->where(
                $model->getTable().'.agency_id',
                auth()->user()->agency_id,
            );
        }
    }
}
