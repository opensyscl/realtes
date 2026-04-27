<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePropertyRequest extends FormRequest
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
            'building_id' => ['nullable', 'integer', 'exists:buildings,id'],
            'code' => ['nullable', 'string', 'max:50',
                Rule::unique('properties', 'code')
                    ->where('agency_id', $this->user()->agency_id)
                    ->ignore($this->route('property')),
            ],
            'title' => [$req, 'string', 'max:200'],
            'type' => [$req, Rule::in(['apartamento','casa','chalet','oficina','local','parking','trastero'])],
            'status' => ['sometimes', Rule::in(\App\Models\Property::STATUSES)],
            'listing_type' => ['sometimes', Rule::in(['alquiler','venta','ambos'])],

            'bedrooms' => ['sometimes', 'integer', 'min:0', 'max:20'],
            'bathrooms' => ['sometimes', 'numeric', 'min:0', 'max:10'],
            'area_sqm' => ['sometimes', 'integer', 'min:1', 'max:100000'],
            'floor' => ['nullable', 'string', 'max:10'],
            'door' => ['nullable', 'string', 'max:10'],
            'parking_spaces' => ['nullable', 'integer', 'min:0', 'max:50'],
            'year_built' => ['nullable', 'integer', 'min:1800', 'max:'.((int) date('Y') + 5)],
            'orientation' => ['nullable', Rule::in([
                'norte','sur','oriente','poniente',
                'nororiente','norponiente','suroriente','surponiente',
            ])],
            'floors_count' => ['nullable', 'integer', 'min:1', 'max:200'],
            'units_per_floor' => ['nullable', 'integer', 'min:1', 'max:200'],
            'terrace_sqm' => ['nullable', 'integer', 'min:0', 'max:100000'],
            'built_sqm' => ['nullable', 'integer', 'min:0', 'max:100000'],

            // Interior
            'condition' => ['nullable', Rule::in(['excelente', 'bueno', 'regular', 'a_reformar'])],
            'suites_count' => ['nullable', 'integer', 'min:0', 'max:20'],
            'service_rooms' => ['nullable', 'integer', 'min:0', 'max:10'],
            'living_rooms' => ['nullable', 'integer', 'min:0', 'max:10'],
            'service_bathrooms' => ['nullable', 'integer', 'min:0', 'max:10'],
            'floor_type' => ['nullable', Rule::in([
                'piso_flotante','ceramica','madera','porcelanato',
                'alfombra','vinilico','marmol','otro',
            ])],
            'gas_type' => ['nullable', Rule::in(['caneria', 'balon', 'otros'])],
            'has_termopanel' => ['nullable', 'boolean'],
            'hot_water_type' => ['nullable', Rule::in(['electrico', 'gas', 'solar', 'otro'])],
            'heating_type' => ['nullable', Rule::in([
                'central','electrica','losa_radiante','gas','no_tiene','otro',
            ])],
            'kitchen_type' => ['nullable', Rule::in(['americana', 'cerrada', 'isla', 'otro'])],
            'window_type' => ['nullable', Rule::in([
                'termopanel','aluminio','pvc','madera','otro',
            ])],

            // Exterior
            'elevators_count' => ['nullable', 'integer', 'min:0', 'max:50'],
            'covered_parking_spaces' => ['nullable', 'integer', 'min:0', 'max:50'],
            'uncovered_parking_spaces' => ['nullable', 'integer', 'min:0', 'max:50'],

            // Deudas y adquisición
            'acquisition_year' => ['nullable', 'integer', 'min:1900', 'max:'.((int) date('Y') + 1)],
            'acquisition_method' => ['nullable', Rule::in([
                'compra','herencia','donacion','permuta','remate','otro',
            ])],
            'bank_debt' => ['nullable', 'numeric', 'min:0'],
            'debt_institution' => ['nullable', 'string', 'max:120'],
            'requires_guarantor' => ['nullable', 'boolean'],

            // Otros
            'rooms_count' => ['nullable', 'integer', 'min:0', 'max:50'],
            'parking_sqm' => ['nullable', 'integer', 'min:0', 'max:100000'],
            'storage_count' => ['nullable', 'integer', 'min:0', 'max:50'],
            'apartment_subtype' => ['nullable', Rule::in([
                'tradicional','loft','duplex','triplex','penthouse','studio','otro',
            ])],
            'max_occupants' => ['nullable', 'integer', 'min:0', 'max:100'],

            'address' => [$req, 'string', 'max:255'],
            'postal_code' => ['nullable', 'string', 'max:10'],
            'city' => ['sometimes', 'string', 'max:100'],
            'province' => ['sometimes', 'string', 'max:100'],
            'country' => ['sometimes', 'string', 'size:2'],

            'price_rent' => ['nullable', 'numeric', 'min:0'],
            'price_sale' => ['nullable', 'numeric', 'min:0'],
            'community_fee' => ['nullable', 'numeric', 'min:0'],
            'ibi_annual' => ['nullable', 'numeric', 'min:0'],

            'description' => ['nullable', 'string'],
            'cover_image_url' => ['nullable', 'url', 'max:500'],
            'tour_url' => ['nullable', 'url', 'max:500'],
            'video_url' => ['nullable', 'url', 'max:500'],
            'features' => ['nullable', 'array'],
            'features.*' => ['string', 'max:50'],
            'tags' => ['nullable', 'array'],
            'tags.*' => ['string', 'max:50'],

            // Captación + identificación + asignaciones
            'currency' => ['nullable', 'string', 'regex:/^[A-Z]{3}$/'],
            'captacion_date' => ['nullable', 'date'],
            'captacion_source' => ['nullable', Rule::in(['particular', 'portal', 'referido', 'web', 'otro'])],
            'is_exclusive' => ['sometimes', 'boolean'],
            'commission_pct' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'rol' => ['nullable', 'string', 'max:60'],
            'owner_person_id' => ['nullable', 'integer', 'exists:persons,id'],
            'agent_user_id' => ['nullable', 'integer', 'exists:users,id'],
            'client_person_id' => ['nullable', 'integer', 'exists:persons,id'],
            'private_note' => ['nullable', 'string', 'max:5000'],
            'inventory_notes' => ['nullable', 'string', 'max:5000'],
            'reception_notes' => ['nullable', 'string', 'max:5000'],

            // Agendamiento de visitas
            'booking_enabled' => ['sometimes', 'boolean'],
            'booking_provider' => ['nullable', \Illuminate\Validation\Rule::in(['calcom', 'google', 'other'])],
            'booking_url' => ['nullable', 'url', 'max:500'],

            // Estado de publicación (Activa/Inactiva en AlterEstate)
            'is_published' => ['sometimes', 'boolean'],
        ];
    }
}
