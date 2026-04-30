<?php

namespace Database\Seeders;

use App\Models\Plan;
use Illuminate\Database\Seeder;

class PlansSeeder extends Seeder
{
    public function run(): void
    {
        // Estructura: 4 tiers + add-on overage por propiedad/user.
        // Margen objetivo: 57% sobre costo (precio = costo × 2.326).
        // Anual = 10× mensual (descuento 20% / paga 10 meses recibe 12).
        $features = [
            'core' => [
                ['code' => 'erp_core', 'name' => 'ERP completo (propiedades, contratos, cargos, pagos)', 'included' => true],
                ['code' => 'crm', 'name' => 'CRM con pipeline kanban', 'included' => true],
                ['code' => 'public_listing', 'name' => 'Escaparate público con dominio realtes.cl', 'included' => true],
                ['code' => 'maps', 'name' => 'Mapa interactivo con pins de precio', 'included' => true],
                ['code' => 'photos', 'name' => 'Galería de fotos con watermark', 'included' => true],
                ['code' => 'documents', 'name' => 'Documentos por contrato y propiedad', 'included' => true],
                ['code' => 'notifications', 'name' => 'Notificaciones in-app', 'included' => true],
                ['code' => 'inbox', 'name' => 'Bandeja de entrada unificada', 'included' => true],
            ],
            'pro_only' => [
                ['code' => 'email_automation', 'name' => 'Plantillas de email automáticas', 'included' => true],
                ['code' => 'commissions', 'name' => 'Sistema de comisiones y splits', 'included' => true],
                ['code' => 'marketplace', 'name' => 'Marketplace cross-broker', 'included' => true],
                ['code' => 'tour_360', 'name' => 'Tour 360° y vídeo embebido', 'included' => true],
                ['code' => 'reports', 'name' => 'Reportes avanzados', 'included' => true],
                ['code' => 'ipc_calculator', 'name' => 'Reajuste IPC automático de contratos', 'included' => true],
                ['code' => 'qr_branded', 'name' => 'QR con logo y colores propios', 'included' => true],
            ],
            'business_only' => [
                ['code' => 'feeds', 'name' => 'Feeds para Portal Inmobiliario y Toctoc', 'included' => true],
                ['code' => 'priority_support', 'name' => 'Soporte prioritario por WhatsApp', 'included' => true],
                ['code' => 'custom_subdomain', 'name' => 'Subdominio personalizado (tuagencia.realtes.cl)', 'included' => true],
                ['code' => 'multi_pipeline', 'name' => 'Múltiples pipelines y embudos', 'included' => true],
            ],
            'enterprise_only' => [
                ['code' => 'sso', 'name' => 'SSO / SAML', 'included' => true],
                ['code' => 'sla', 'name' => 'SLA con uptime garantizado', 'included' => true],
                ['code' => 'dedicated_csm', 'name' => 'Customer Success Manager dedicado', 'included' => true],
                ['code' => 'custom_dev', 'name' => 'Horas de desarrollo a medida', 'included' => true],
            ],
        ];

        // Helper: marca como excluido todo lo de tiers superiores
        $compose = function (array $included, array $excluded) {
            $out = [];
            foreach ($included as $f) {
                $out[] = $f;
            }
            foreach ($excluded as $f) {
                $out[] = ['code' => $f['code'], 'name' => $f['name'], 'included' => false];
            }
            return $out;
        };

        $plans = [
            [
                'code' => 'lite',
                'name' => 'Lite',
                'tagline' => 'Para corredores independientes que arrancan',
                'price_monthly' => 19990,
                'price_yearly' => 199900, // 10× mensual
                'overage_per_property' => 799,
                'overage_per_user' => 4990,
                'limits' => [
                    'max_properties' => 25,
                    'max_users' => 2,
                    'max_active_leads' => 100,
                    'max_pipelines' => 1,
                    'max_email_sends_month' => 500,
                ],
                'features' => $compose(
                    $features['core'],
                    array_merge($features['pro_only'], $features['business_only'], $features['enterprise_only'])
                ),
                'is_recommended' => false,
                'position' => 0,
                'active' => true,
            ],
            [
                'code' => 'pro',
                'name' => 'Pro',
                'tagline' => 'El sweet spot para corredoras en crecimiento',
                'price_monthly' => 39990,
                'price_yearly' => 399900,
                'overage_per_property' => 599,
                'overage_per_user' => 4990,
                'limits' => [
                    'max_properties' => 100,
                    'max_users' => 8,
                    'max_active_leads' => 500,
                    'max_pipelines' => 3,
                    'max_email_sends_month' => 5000,
                ],
                'features' => $compose(
                    array_merge($features['core'], $features['pro_only']),
                    array_merge($features['business_only'], $features['enterprise_only'])
                ),
                'is_recommended' => true,
                'position' => 1,
                'active' => true,
            ],
            [
                'code' => 'business',
                'name' => 'Business',
                'tagline' => 'Para corredoras consolidadas con cartera grande',
                'price_monthly' => 89990,
                'price_yearly' => 899900,
                'overage_per_property' => 399,
                'overage_per_user' => 4990,
                'limits' => [
                    'max_properties' => 400,
                    'max_users' => 25,
                    'max_active_leads' => 2500,
                    'max_pipelines' => 10,
                    'max_email_sends_month' => 25000,
                ],
                'features' => $compose(
                    array_merge($features['core'], $features['pro_only'], $features['business_only']),
                    $features['enterprise_only']
                ),
                'is_recommended' => false,
                'position' => 2,
                'active' => true,
            ],
            [
                'code' => 'enterprise',
                'name' => 'Enterprise',
                'tagline' => 'Sin límites, soporte dedicado, SLA',
                'price_monthly' => 0, // a medida
                'price_yearly' => 0,
                'overage_per_property' => 0,
                'overage_per_user' => 0,
                'limits' => [
                    'max_properties' => -1,
                    'max_users' => -1,
                    'max_active_leads' => -1,
                    'max_pipelines' => -1,
                    'max_email_sends_month' => -1,
                ],
                'features' => array_merge(
                    $features['core'],
                    $features['pro_only'],
                    $features['business_only'],
                    $features['enterprise_only']
                ),
                'is_recommended' => false,
                'position' => 3,
                'active' => true,
            ],
        ];

        foreach ($plans as $p) {
            Plan::updateOrCreate(['code' => $p['code']], $p);
        }

        // Limpia el plan starter viejo si existe (lo reemplazamos por lite)
        Plan::where('code', 'starter')->delete();

        // Si la Agency 1 (sorni) está en starter, migrarla a pro trial
        \App\Models\Agency::where('current_plan_code', 'starter')->update([
            'current_plan_code' => 'pro',
            'subscription_status' => 'trialing',
            'subscription_started_at' => now(),
            'current_period_end' => now()->addDays(14),
            'billing_cycle' => 'monthly',
        ]);

        $this->command->info('✓ 4 planes (Lite, Pro, Business, Enterprise) con margen 57% y overage configurado.');
    }
}
