<?php

namespace Database\Seeders;

use App\Models\Agency;
use App\Models\EmailTemplate;
use Illuminate\Database\Seeder;

class EmailTemplatesSeeder extends Seeder
{
    public function run(): void
    {
        $templates = [
            [
                'code' => 'recordatorio_cobro',
                'name' => 'Recordatorio de cobro',
                'subject' => 'Recordatorio: cargo {{ charge.code }} vence el {{ charge.due_date }}',
                'audience' => 'tenant',
                'body' => "Hola {{ person.first_name }},\n\nTe recordamos que tienes un cargo pendiente de {{ charge.amount }} ({{ charge.concept }}) que vence el {{ charge.due_date }}.\n\nReferencia: {{ charge.code }}\nContrato: {{ contract.code }} — {{ contract.property_title }}\n\nSi ya lo has pagado, ignora este mensaje.\n\nUn saludo,\n{{ agency.name }}\n{{ agency.phone }}",
            ],
            [
                'code' => 'aviso_mora',
                'name' => 'Aviso de mora',
                'subject' => 'URGENTE: cargo {{ charge.code }} vencido',
                'audience' => 'tenant',
                'body' => "Hola {{ person.first_name }},\n\nEl cargo {{ charge.code }} por importe de {{ charge.amount }} ha vencido el {{ charge.due_date }} y aún no consta su pago.\n\nPor favor regulariza la situación a la mayor brevedad posible para evitar recargos adicionales o el inicio de procesos legales.\n\nContrato: {{ contract.code }} — {{ contract.property_title }}\n\nSi ya has realizado el pago o tienes algún problema, contáctanos respondiendo a este email o llamando al {{ agency.phone }}.\n\n{{ agency.name }}",
            ],
            [
                'code' => 'bienvenida_arrendatario',
                'name' => 'Bienvenida arrendatario',
                'subject' => 'Bienvenido/a a tu nueva vivienda — {{ contract.property_title }}',
                'audience' => 'tenant',
                'body' => "¡Hola {{ person.first_name }}!\n\nNos alegra tenerte como nuevo/a arrendatario/a de {{ contract.property_title }} ({{ contract.property_address }}).\n\nDatos de tu contrato:\n• Referencia: {{ contract.code }}\n• Renta mensual: {{ contract.monthly_rent }}\n• Inicio: {{ contract.start_date }}\n• Fin: {{ contract.end_date }}\n\nSi tienes cualquier incidencia con la propiedad o duda administrativa, escríbenos a {{ agency.email }} o llama al {{ agency.phone }}.\n\nBienvenido/a y mucha suerte en tu nueva casa.\n\n{{ agency.name }}",
            ],
            [
                'code' => 'fin_contrato',
                'name' => 'Aviso fin de contrato',
                'subject' => 'Tu contrato {{ contract.code }} vence el {{ contract.end_date }}',
                'audience' => 'tenant',
                'body' => "Hola {{ person.first_name }},\n\nTe informamos que tu contrato de alquiler {{ contract.code }} sobre {{ contract.property_title }} finaliza el {{ contract.end_date }}.\n\nSi deseas renovar o tienes intención de no continuar, por favor contáctanos antes de los próximos 30 días para gestionar la documentación correspondiente.\n\n{{ agency.name }}\n{{ agency.email }} · {{ agency.phone }}",
            ],
            [
                'code' => 'visita_confirmada',
                'name' => 'Confirmación de visita',
                'subject' => 'Confirmada tu visita a {{ contract.property_title }}',
                'audience' => 'lead',
                'body' => "Hola {{ lead.contact_name }},\n\nTe confirmamos la visita que solicitaste. Nuestro agente te recibirá en la propiedad y resolverá todas tus dudas.\n\nSi necesitas reagendar o tienes alguna duda, responde a este email o llámanos.\n\n{{ agency.name }}\n{{ agency.phone }}",
            ],
            [
                'code' => 'captacion_seguimiento',
                'name' => 'Seguimiento de captación',
                'subject' => 'Seguimiento sobre {{ lead.title }}',
                'audience' => 'owner',
                'body' => "Hola {{ lead.contact_name }},\n\nFue un placer charlar contigo sobre la posible cesión en exclusiva de la propiedad. Como hablamos, te enviamos una valoración detallada con condiciones de mercado.\n\nQuedamos a tu disposición para resolver cualquier duda y avanzar con la firma cuando lo consideres oportuno.\n\nUn saludo,\n{{ agency.name }}\n{{ agency.phone }}",
            ],
        ];

        foreach (Agency::all() as $agency) {
            foreach ($templates as $tpl) {
                EmailTemplate::firstOrCreate(
                    ['agency_id' => $agency->id, 'code' => $tpl['code']],
                    [...$tpl, 'is_active' => true, 'is_system' => true],
                );
            }
        }

        $this->command->info('✓ '.count($templates).' plantillas de email creadas por agency.');
    }
}
