<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreLeadRequest extends FormRequest
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
            'pipeline_id' => [$req, 'integer', 'exists:pipelines,id'],
            'stage_id' => [$req, 'integer', 'exists:stages,id'],
            'title' => [$req, 'string', 'max:200'],
            'contact_name' => ['nullable', 'string', 'max:120'],
            'contact_email' => ['nullable', 'email', 'max:160'],
            'contact_phone' => ['nullable', 'string', 'max:30'],
            'source' => ['sometimes', Rule::in([
                'web', 'idealista', 'referral', 'instagram', 'llamada', 'walk_in', 'otros',
            ])],
            'value' => ['sometimes', 'numeric', 'min:0'],
            'probability_pct' => ['sometimes', 'integer', 'between:0,100'],
            'expected_close_date' => ['nullable', 'date'],
            'assigned_user_id' => ['nullable', 'integer', 'exists:users,id'],
            'person_id' => ['nullable', 'integer', 'exists:persons,id'],
            'property_id' => ['nullable', 'integer', 'exists:properties,id'],
            'notes' => ['nullable', 'string'],
            'requirements' => ['nullable', 'array'],
            'status' => ['sometimes', Rule::in(['open', 'won', 'lost'])],
            'lost_reason' => ['nullable', 'string', 'max:200'],
        ];
    }
}
