<?php

namespace Database\Seeders;

use App\Models\Plan;
use Illuminate\Database\Seeder;

class PlansSeeder extends Seeder
{
    public function run(): void
    {
        $plans = [
            [
                'code' => 'starter',
                'name' => 'Starter',
                'tagline' => 'Perfecto para arrancar tu primera cartera',
                'price_monthly' => 0,
                'price_yearly' => 0,
                'limits' => [
                    'max_properties' => 10,
                    'max_users' => 1,
                    'max_active_leads' => 25,
                    'max_pipelines' => 1,
                    'max_email_sends_month' => 50,
                ],
                'features' => [
                    ['code' => 'erp_core', 'name' => 'ERP completo (propiedades, contratos, cargos, pagos)', 'included' => true],
                    ['code' => 'crm', 'name' => 'CRM con pipeline kanban', 'included' => true],
                    ['code' => 'public_listing', 'name' => 'Escaparate público', 'included' => true],
                    ['code' => 'maps', 'name' => 'Mapa con pins de precio', 'included' => true],
                    ['code' => 'photos', 'name' => 'Galería de fotos', 'included' => true],
                    ['code' => 'documents', 'name' => 'Documentos por contrato', 'included' => true],
                    ['code' => 'notifications', 'name' => 'Notificaciones in-app', 'included' => true],
                    ['code' => 'email_automation', 'name' => 'Plantillas de email automáticas', 'included' => false],
                    ['code' => 'commissions', 'name' => 'Sistema de comisiones / splits', 'included' => false],
                    ['code' => 'marketplace', 'name' => 'Marketplace cross-broker', 'included' => false],
                    ['code' => 'feeds', 'name' => 'Feeds XML/JSON para Idealista', 'included' => false],
                    ['code' => 'tour_360', 'name' => 'Tour 360° y vídeo embebido', 'included' => false],
                    ['code' => 'reports', 'name' => 'Reportes avanzados', 'included' => false],
                    ['code' => 'priority_support', 'name' => 'Soporte prioritario + onboarding', 'included' => false],
                ],
                'is_recommended' => false,
                'position' => 0,
                'active' => true,
            ],
            [
                'code' => 'pro',
                'name' => 'Pro',
                'tagline' => 'Para agencias que crecen rápido',
                'price_monthly' => 29,
                'price_yearly' => 290,
                'limits' => [
                    'max_properties' => 200,
                    'max_users' => 5,
                    'max_active_leads' => 500,
                    'max_pipelines' => 3,
                    'max_email_sends_month' => 2000,
                ],
                'features' => [
                    ['code' => 'erp_core', 'name' => 'ERP completo', 'included' => true],
                    ['code' => 'crm', 'name' => 'CRM con pipeline kanban', 'included' => true],
                    ['code' => 'public_listing', 'name' => 'Escaparate público', 'included' => true],
                    ['code' => 'maps', 'name' => 'Mapa con pins de precio', 'included' => true],
                    ['code' => 'photos', 'name' => 'Galería de fotos', 'included' => true],
                    ['code' => 'documents', 'name' => 'Documentos por contrato', 'included' => true],
                    ['code' => 'notifications', 'name' => 'Notificaciones in-app', 'included' => true],
                    ['code' => 'email_automation', 'name' => 'Plantillas de email automáticas', 'included' => true],
                    ['code' => 'commissions', 'name' => 'Sistema de comisiones / splits', 'included' => true],
                    ['code' => 'marketplace', 'name' => 'Marketplace cross-broker', 'included' => true],
                    ['code' => 'tour_360', 'name' => 'Tour 360° y vídeo embebido', 'included' => true],
                    ['code' => 'reports', 'name' => 'Reportes avanzados', 'included' => true],
                    ['code' => 'feeds', 'name' => 'Feeds XML/JSON para Idealista', 'included' => false],
                    ['code' => 'priority_support', 'name' => 'Soporte prioritario + onboarding', 'included' => false],
                ],
                'is_recommended' => true,
                'position' => 1,
                'active' => true,
            ],
            [
                'code' => 'business',
                'name' => 'Business',
                'tagline' => 'Sin límites para agencias consolidadas',
                'price_monthly' => 79,
                'price_yearly' => 790,
                'limits' => [
                    'max_properties' => -1,
                    'max_users' => -1,
                    'max_active_leads' => -1,
                    'max_pipelines' => -1,
                    'max_email_sends_month' => -1,
                ],
                'features' => [
                    ['code' => 'erp_core', 'name' => 'ERP completo', 'included' => true],
                    ['code' => 'crm', 'name' => 'CRM con pipeline kanban', 'included' => true],
                    ['code' => 'public_listing', 'name' => 'Escaparate público', 'included' => true],
                    ['code' => 'maps', 'name' => 'Mapa con pins de precio', 'included' => true],
                    ['code' => 'photos', 'name' => 'Galería de fotos', 'included' => true],
                    ['code' => 'documents', 'name' => 'Documentos por contrato', 'included' => true],
                    ['code' => 'notifications', 'name' => 'Notificaciones in-app', 'included' => true],
                    ['code' => 'email_automation', 'name' => 'Plantillas de email automáticas', 'included' => true],
                    ['code' => 'commissions', 'name' => 'Sistema de comisiones / splits', 'included' => true],
                    ['code' => 'marketplace', 'name' => 'Marketplace cross-broker', 'included' => true],
                    ['code' => 'tour_360', 'name' => 'Tour 360° y vídeo embebido', 'included' => true],
                    ['code' => 'reports', 'name' => 'Reportes avanzados', 'included' => true],
                    ['code' => 'feeds', 'name' => 'Feeds XML/JSON para Idealista', 'included' => true],
                    ['code' => 'priority_support', 'name' => 'Soporte prioritario + onboarding', 'included' => true],
                ],
                'is_recommended' => false,
                'position' => 2,
                'active' => true,
            ],
        ];

        foreach ($plans as $p) {
            Plan::updateOrCreate(['code' => $p['code']], $p);
        }

        // Asignar Pro trial 14 días a las agencies existentes (demo)
        \App\Models\Agency::query()->update([
            'current_plan_code' => 'pro',
            'subscription_status' => 'trialing',
            'subscription_started_at' => now(),
            'trial_ends_at' => now()->addDays(14),
            'current_period_end' => now()->addDays(14),
            'billing_cycle' => 'monthly',
        ]);

        $this->command->info('✓ 3 planes creados (Starter, Pro, Business) y agencies con trial 14 días en Pro.');
    }
}
