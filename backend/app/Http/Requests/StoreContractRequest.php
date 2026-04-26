<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreContractRequest extends FormRequest
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
            'owner_id' => [$req, 'integer', 'exists:persons,id'],
            'tenant_id' => [$req, 'integer', 'exists:persons,id'],
            'agent_user_id' => ['nullable', 'integer', 'exists:users,id'],

            'type' => ['sometimes', 'string', 'max:50'],
            'status' => ['sometimes', Rule::in([
                'borrador', 'vigente', 'vencido', 'finalizado', 'renovado', 'cancelado',
            ])],
            'start_date' => [$req, 'date'],
            'end_date' => [$req, 'date', 'after:start_date'],
            'monthly_rent' => [$req, 'numeric', 'min:0'],
            'deposit' => ['sometimes', 'numeric', 'min:0'],
            'commission_pct' => ['sometimes', 'numeric', 'between:0,100'],
            'ipc_adjustment' => ['sometimes', 'boolean'],
            'payment_day' => ['sometimes', 'integer', 'between:1,28'],
            'signed_at' => ['nullable', 'date'],
            'notes' => ['nullable', 'string'],
        ];
    }
}
