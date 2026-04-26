<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreMaintenanceTicketRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() && $this->user()->agency_id !== null;
    }

    public function rules(): array
    {
        $isUpdate = $this->isMethod('PATCH') || $this->isMethod('PUT');
        $req = $isUpdate ? 'sometimes' : 'required';

        return [
            'property_id' => [$req, 'integer', 'exists:properties,id'],
            'contract_id' => ['nullable', 'integer', 'exists:contracts,id'],
            'reported_by' => ['nullable', 'integer', 'exists:persons,id'],
            'assigned_user_id' => ['nullable', 'integer', 'exists:users,id'],
            'title' => [$req, 'string', 'max:200'],
            'description' => ['nullable', 'string'],
            'category' => ['sometimes', Rule::in([
                'fontaneria', 'electricidad', 'calefaccion', 'electrodomesticos',
                'pintura', 'cerrajeria', 'jardineria', 'ascensor', 'otros',
            ])],
            'priority' => ['sometimes', Rule::in(['baja', 'media', 'alta', 'urgente'])],
            'status' => ['sometimes', Rule::in([
                'abierto', 'en_progreso', 'esperando_proveedor', 'resuelto', 'cerrado', 'cancelado',
            ])],
            'estimated_cost' => ['nullable', 'numeric', 'min:0'],
            'actual_cost' => ['nullable', 'numeric', 'min:0'],
            'vendor' => ['nullable', 'string', 'max:120'],
            'vendor_notes' => ['nullable', 'string'],
            'scheduled_for' => ['nullable', 'date'],
        ];
    }
}
