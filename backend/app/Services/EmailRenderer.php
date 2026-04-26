<?php

namespace App\Services;

use App\Models\Agency;
use App\Models\Charge;
use App\Models\Contract;
use App\Models\EmailTemplate;
use App\Models\Lead;
use App\Models\Person;
use Illuminate\Support\Carbon;

/**
 * Renderiza plantillas con merge tags estilo Mustache simple: {{ tag }}.
 * Tags soportados:
 *   {{ agency.name }} {{ agency.phone }} {{ agency.email }}
 *   {{ person.first_name }} {{ person.full_name }} {{ person.email }} {{ person.phone }}
 *   {{ contract.code }} {{ contract.monthly_rent }} {{ contract.start_date }} {{ contract.end_date }}
 *   {{ contract.property_title }} {{ contract.property_address }}
 *   {{ charge.code }} {{ charge.amount }} {{ charge.due_date }} {{ charge.concept }}
 *   {{ lead.code }} {{ lead.title }} {{ lead.contact_name }}
 *   {{ today }}
 */
class EmailRenderer
{
    public static function render(EmailTemplate $tpl, array $context = []): array
    {
        $vars = self::buildVars($tpl, $context);

        return [
            'subject' => self::interpolate($tpl->subject, $vars),
            'body' => self::interpolate($tpl->body, $vars),
        ];
    }

    public static function availableTags(): array
    {
        return [
            'Agencia' => ['agency.name', 'agency.phone', 'agency.email'],
            'Persona' => ['person.first_name', 'person.full_name', 'person.email', 'person.phone'],
            'Contrato' => [
                'contract.code', 'contract.monthly_rent', 'contract.start_date', 'contract.end_date',
                'contract.property_title', 'contract.property_address',
            ],
            'Cargo' => ['charge.code', 'charge.amount', 'charge.due_date', 'charge.concept'],
            'Lead' => ['lead.code', 'lead.title', 'lead.contact_name'],
            'Otros' => ['today'],
        ];
    }

    private static function buildVars(EmailTemplate $tpl, array $context): array
    {
        $vars = ['today' => Carbon::now()->translatedFormat('d \d\e F \d\e Y')];

        $agency = Agency::find($tpl->agency_id);
        if ($agency) {
            $vars['agency.name'] = $agency->name;
            $vars['agency.phone'] = $agency->phone ?? '—';
            $vars['agency.email'] = $agency->email ?? '—';
        }

        if (! empty($context['person_id'])) {
            $person = Person::find($context['person_id']);
            if ($person) {
                $vars['person.first_name'] = $person->first_name;
                $vars['person.full_name'] = trim($person->first_name.' '.$person->last_name);
                $vars['person.email'] = $person->email ?? '';
                $vars['person.phone'] = $person->phone ?? '';
            }
        }

        if (! empty($context['contract_id'])) {
            $contract = Contract::with('property:id,title,address,city')->find($context['contract_id']);
            if ($contract) {
                $vars['contract.code'] = $contract->code;
                $vars['contract.monthly_rent'] = self::money($contract->monthly_rent);
                $vars['contract.start_date'] = optional($contract->start_date)->translatedFormat('d M Y');
                $vars['contract.end_date'] = optional($contract->end_date)->translatedFormat('d M Y');
                $vars['contract.property_title'] = optional($contract->property)->title ?? '';
                $vars['contract.property_address'] = optional($contract->property)->address ?? '';
            }
        }

        if (! empty($context['charge_id'])) {
            $charge = Charge::find($context['charge_id']);
            if ($charge) {
                $vars['charge.code'] = $charge->code;
                $vars['charge.amount'] = self::money($charge->amount);
                $vars['charge.due_date'] = optional($charge->due_date)->translatedFormat('d M Y');
                $vars['charge.concept'] = $charge->concept;
            }
        }

        if (! empty($context['lead_id'])) {
            $lead = Lead::find($context['lead_id']);
            if ($lead) {
                $vars['lead.code'] = $lead->code;
                $vars['lead.title'] = $lead->title;
                $vars['lead.contact_name'] = $lead->contact_name ?? '';
            }
        }

        return $vars;
    }

    private static function interpolate(string $template, array $vars): string
    {
        return preg_replace_callback(
            '/\{\{\s*([a-z_.]+)\s*\}\}/i',
            fn ($m) => $vars[$m[1]] ?? "[{$m[1]}]",
            $template,
        );
    }

    private static function money($value): string
    {
        return '€'.number_format((float) $value, 2, ',', '.');
    }
}
