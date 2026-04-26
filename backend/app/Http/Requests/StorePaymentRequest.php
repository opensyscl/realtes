<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() && $this->user()->agency_id !== null;
    }

    public function rules(): array
    {
        return [
            'charge_id' => ['required', 'integer', 'exists:charges,id'],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'method' => ['required', Rule::in([
                'transferencia', 'efectivo', 'tarjeta', 'domiciliacion', 'otro',
            ])],
            'reference' => ['nullable', 'string', 'max:80'],
            'received_at' => ['required', 'date'],
            'notes' => ['nullable', 'string'],
        ];
    }
}
