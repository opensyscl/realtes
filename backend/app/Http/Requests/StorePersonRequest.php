<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePersonRequest extends FormRequest
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
            'type' => [$req, Rule::in(['owner', 'tenant', 'both', 'prospect'])],
            'first_name' => [$req, 'string', 'max:80'],
            'last_name' => ['nullable', 'string', 'max:160'],
            'nif' => ['nullable', 'string', 'max:20',
                Rule::unique('persons', 'nif')
                    ->where('agency_id', $this->user()->agency_id)
                    ->ignore($this->route('person')),
            ],
            'email' => ['nullable', 'email', 'max:160'],
            'phone' => ['nullable', 'string', 'max:30'],
            'phone_alt' => ['nullable', 'string', 'max:30'],
            'address' => ['nullable', 'string', 'max:255'],
            'city' => ['nullable', 'string', 'max:100'],
            'postal_code' => ['nullable', 'string', 'max:10'],
            'country' => ['nullable', 'string', 'size:2'],
            'iban_last4' => ['nullable', 'string', 'size:4'],
            'birthday' => ['nullable', 'date'],
            'notes' => ['nullable', 'string'],
            'tags' => ['nullable', 'array'],
            'tags.*' => ['string', 'max:50'],
        ];
    }
}
