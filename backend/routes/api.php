<?php

use App\Http\Controllers\Api\AgencySettingsController;
use App\Http\Controllers\Api\AllianceController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CalendarController;
use App\Http\Controllers\Api\ChargeController;
use App\Http\Controllers\Api\CommissionController;
use App\Http\Controllers\Api\ContractController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\DocumentController;
use App\Http\Controllers\Api\PropertyInspectionController;
use App\Http\Controllers\Api\EmailController;
use App\Http\Controllers\Api\FeedController;
use App\Http\Controllers\Api\LeadController;
use App\Http\Controllers\Api\MaintenanceController;
use App\Http\Controllers\Api\MarketplaceController;
use App\Http\Controllers\Api\MlAuthController;
use App\Http\Controllers\Api\MlPropertyController;
use App\Http\Controllers\Api\MlWebhookController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\PlanController;
use App\Http\Controllers\Api\BillingController;
use App\Http\Controllers\Api\PersonController;
use App\Http\Controllers\Api\PipelineController;
use App\Http\Controllers\Api\PropertyController;
use App\Http\Controllers\Api\PropertyLeaseController;
use App\Http\Controllers\Api\PublicController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\SearchController;
use App\Http\Controllers\Api\TokenController;
use App\Http\Controllers\Api\UploadController;
use Illuminate\Support\Facades\Route;

// ---------- Públicas ----------
Route::post('/auth/login', [AuthController::class, 'login'])
    ->middleware('throttle:20,1');
Route::post('/auth/register', [AuthController::class, 'register'])
    ->middleware('throttle:3,10');
Route::post('/auth/forgot', [AuthController::class, 'forgotPassword'])
    ->middleware('throttle:5,15');
Route::post('/auth/reset', [AuthController::class, 'resetPassword'])
    ->middleware('throttle:5,15');

// Lista pública de agencias indexables (para el sitemap del marketing site)
Route::get('/public/_agencies', [PublicController::class, 'agencies']);

// Escaparate público de cada agencia (sin auth)
Route::prefix('public/{slug}')->group(function () {
    Route::get('/', [PublicController::class, 'agency']);
    Route::get('/properties', [PublicController::class, 'index']);
    Route::get('/properties/{id}', [PublicController::class, 'show'])->whereNumber('id');
    // Throttle por IP (no global) para evitar bloquear escaparates con tráfico legítimo
    Route::post('/leads', [PublicController::class, 'storeLead'])
        ->middleware('throttle:public-leads');
    Route::get('/alliances', [PublicController::class, 'alliances']);
});

// Proxy de imágenes (sirve archivos remotos con headers CORS para
// canvas/QR generators que requieren `crossOrigin: anonymous`).
Route::get('/proxy/image', function (\Illuminate\Http\Request $request) {
    $url = $request->string('url')->toString();
    $allowed = [
        'https://pub-96ad29ee143e4d6fb46941738de3daaf.r2.dev/',
    ];
    $ok = false;
    foreach ($allowed as $prefix) {
        if (str_starts_with($url, $prefix)) {
            $ok = true;
            break;
        }
    }
    if (! $ok) {
        abort(400, 'URL no permitida');
    }
    $body = @file_get_contents($url);
    if ($body === false) abort(502, 'No se pudo descargar la imagen');
    $type = (new \finfo(FILEINFO_MIME_TYPE))->buffer($body) ?: 'image/png';
    return response($body, 200)
        ->header('Content-Type', $type)
        ->header('Access-Control-Allow-Origin', '*')
        ->header('Cache-Control', 'public, max-age=86400');
});

// Property feeds públicos para portales (Idealista, etc.)
Route::prefix('feeds/{slug}')->group(function () {
    Route::get('/properties.json', [FeedController::class, 'json']);
    Route::get('/idealista.xml', [FeedController::class, 'idealistaXml']);
});

// Planes públicos (página de precios)
Route::get('/plans', [PlanController::class, 'index']);

// ---------- Mercado Libre: callback OAuth + webhook (públicos) ----------
// Callback: público porque ML redirige al navegador del usuario sin Bearer token.
// Validación va por `state` firmado con Crypt::encryptString (ver MlOAuth::decodeState).
Route::get('/integrations/mercadolibre/callback', [MlAuthController::class, 'callback']);

// Webhook ML: público, validado por IP whitelist (config/services.php → allowed_ips).
// Encola el procesamiento porque ML exige 200 en <500ms.
Route::post('/webhooks/mercadolibre', [MlWebhookController::class, 'handle']);

// ---------- Autenticadas ----------
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::patch('/auth/profile', [AuthController::class, 'updateProfile']);

    // Agency settings
    Route::get('/agency', [AgencySettingsController::class, 'showAgency']);
    Route::patch('/agency', [AgencySettingsController::class, 'updateAgency']);
    Route::post('/agency/onboarding/complete', [AgencySettingsController::class, 'completeOnboarding']);
    Route::get('/agency/members', [AgencySettingsController::class, 'members']);
    Route::get('/agency/template', [AgencySettingsController::class, 'showTemplate']);
    Route::patch('/agency/template', [AgencySettingsController::class, 'updateTemplate']);
    Route::get('/agency/watermark', [AgencySettingsController::class, 'showWatermark']);
    Route::patch('/agency/watermark', [AgencySettingsController::class, 'updateWatermark']);
    Route::post('/agency/watermark/image', [AgencySettingsController::class, 'uploadWatermarkImage']);
    Route::delete('/agency/watermark/image', [AgencySettingsController::class, 'deleteWatermarkImage']);
    Route::get('/agency/qr', [AgencySettingsController::class, 'showQr']);
    Route::patch('/agency/qr', [AgencySettingsController::class, 'updateQr']);
    Route::post('/agency/qr/logo', [AgencySettingsController::class, 'uploadQrLogo']);

    // Uploads directos a R2 (cover image, etc.)
    Route::post('/uploads/property-cover', [UploadController::class, 'propertyCover']);

    // Personal Access Tokens (API keys para uso externo)
    // Alianzas
    Route::get('/alliances', [AllianceController::class, 'index']);
    Route::post('/alliances', [AllianceController::class, 'store']);
    Route::get('/alliances/{alliance}', [AllianceController::class, 'show']);
    Route::patch('/alliances/{alliance}', [AllianceController::class, 'update']);
    Route::delete('/alliances/{alliance}', [AllianceController::class, 'destroy']);
    Route::post('/alliances/_image', [AllianceController::class, 'uploadImage']);
    Route::post('/alliances/_reorder', [AllianceController::class, 'reorder']);

    Route::get('/tokens', [TokenController::class, 'index']);
    Route::post('/tokens', [TokenController::class, 'store']);
    Route::delete('/tokens/{id}', [TokenController::class, 'destroy'])->whereNumber('id');

    // Calendar
    Route::get('/calendar/upcoming', [CalendarController::class, 'upcoming']);

    // Dashboard
    Route::get('/dashboard/overview', [DashboardController::class, 'overview']);
    Route::get('/dashboard/activity-volume', [DashboardController::class, 'activityVolume']);
    Route::get('/dashboard/activity-feed', [DashboardController::class, 'activityFeed']);

    // Properties
    Route::get('/properties/stats', [PropertyController::class, 'stats']);
    Route::get('/properties/map', [PropertyController::class, 'map']);
    Route::post('/properties/bulk', [PropertyController::class, 'bulk']);
    Route::post('/properties/{property}/duplicate', [PropertyController::class, 'duplicate']);
    Route::apiResource('properties', PropertyController::class);

    // Property lease (gestión inline del contrato vigente)
    Route::get('/properties/{property}/lease', [PropertyLeaseController::class, 'show']);
    Route::post('/properties/{property}/lease', [PropertyLeaseController::class, 'store']);
    Route::delete('/properties/{property}/lease', [PropertyLeaseController::class, 'destroy']);

    // Persons
    Route::apiResource('persons', PersonController::class);

    // Contracts
    Route::post('/contracts/bulk-rent-adjust', [ContractController::class, 'bulkRentAdjust']);
    Route::apiResource('contracts', ContractController::class);

    // Charges
    Route::get('/charges/stats', [ChargeController::class, 'stats']);
    Route::post('/charges/generate', [ReportController::class, 'generateCharges']);
    Route::apiResource('charges', ChargeController::class)->only(['index', 'show']);

    // Payments
    Route::post('/payments', [PaymentController::class, 'store']);
    Route::delete('/payments/{payment}', [PaymentController::class, 'destroy']);

    // CRM
    Route::get('/pipelines', [PipelineController::class, 'index']);
    Route::post('/pipelines', [PipelineController::class, 'store']);
    Route::patch('/pipelines/{pipeline}', [PipelineController::class, 'update']);
    Route::delete('/pipelines/{pipeline}', [PipelineController::class, 'destroy']);
    Route::post('/pipelines/{pipeline}/stages', [PipelineController::class, 'storeStage']);
    Route::post('/pipelines/{pipeline}/stages/reorder', [PipelineController::class, 'reorderStages']);
    Route::patch('/stages/{stage}', [PipelineController::class, 'updateStage']);
    Route::delete('/stages/{stage}', [PipelineController::class, 'destroyStage']);
    Route::post('/leads/{lead}/move', [LeadController::class, 'move']);
    Route::post('/leads/{lead}/convert', [LeadController::class, 'convert']);
    Route::post('/leads/{lead}/convert-to-property', [LeadController::class, 'convertToProperty']);
    Route::get('/leads/{lead}/activities', [LeadController::class, 'activities']);
    Route::post('/leads/{lead}/activities', [LeadController::class, 'storeActivity']);
    Route::apiResource('leads', LeadController::class);

    // Reports
    Route::get('/reports/financial', [ReportController::class, 'financial']);
    Route::get('/reports/aging', [ReportController::class, 'aging']);
    Route::get('/reports/properties-revenue', [ReportController::class, 'propertiesRevenue']);
    Route::get('/reports/pipeline-conversion', [ReportController::class, 'pipelineConversion']);
    Route::get('/reports/agents-performance', [ReportController::class, 'agentsPerformance']);

    // Maintenance
    Route::get('/maintenance/stats', [MaintenanceController::class, 'stats']);
    Route::get('/maintenance/{ticket}/comments', [MaintenanceController::class, 'comments']);
    Route::post('/maintenance/{ticket}/comments', [MaintenanceController::class, 'storeComment']);
    Route::apiResource('maintenance', MaintenanceController::class)
        ->parameters(['maintenance' => 'ticket']);

    // Global search (⌘K)
    Route::get('/search', [SearchController::class, 'index']);

    // Commissions
    Route::get('/commissions/stats', [CommissionController::class, 'stats']);
    Route::post('/commissions/backfill', [CommissionController::class, 'backfill']);
    Route::get('/commissions', [CommissionController::class, 'index']);
    Route::get('/contracts/{contract}/commissions', [CommissionController::class, 'listForContract']);
    Route::post('/contracts/{contract}/commissions', [CommissionController::class, 'store']);
    Route::patch('/commissions/{commission}', [CommissionController::class, 'update']);
    Route::post('/commissions/{commission}/pay', [CommissionController::class, 'pay']);
    Route::delete('/commissions/{commission}', [CommissionController::class, 'destroy']);

    // Property inspections (actas de entrega/recepción/inspección)
    Route::get('/properties/{property}/inspections', [PropertyInspectionController::class, 'index']);
    Route::post('/properties/{property}/inspections', [PropertyInspectionController::class, 'store']);
    Route::patch('/inspections/{inspection}', [PropertyInspectionController::class, 'update']);
    Route::delete('/inspections/{inspection}', [PropertyInspectionController::class, 'destroy']);
    Route::post('/inspections/{inspection}/photos', [PropertyInspectionController::class, 'uploadPhoto']);
    Route::patch('/inspections/photos/{media}', [PropertyInspectionController::class, 'updatePhoto']);
    Route::delete('/inspections/photos/{media}', [PropertyInspectionController::class, 'destroyPhoto']);

    // Documents (Spatie media library)
    Route::get('/properties/{property}/documents', [DocumentController::class, 'indexProperty']);
    Route::post('/properties/{property}/documents', [DocumentController::class, 'storeProperty']);
    Route::get('/contracts/{contract}/documents', [DocumentController::class, 'indexContract']);
    Route::post('/contracts/{contract}/documents', [DocumentController::class, 'storeContract']);
    Route::delete('/documents/{media}', [DocumentController::class, 'destroy']);

    // Photos
    Route::get('/properties/{property}/photos', [DocumentController::class, 'indexPhotos']);
    Route::post('/properties/{property}/photos', [DocumentController::class, 'storePhoto']);
    Route::post('/properties/{property}/photos/reorder', [DocumentController::class, 'reorderPhotos']);
    Route::post('/properties/{property}/photos/apply-watermark', [DocumentController::class, 'applyWatermarkBulk']);
    Route::post('/photos/{media}/set-cover', [DocumentController::class, 'setCover']);
    Route::post('/photos/{media}/replace', [DocumentController::class, 'replacePhoto']);
    Route::post('/photos/{media}/apply-watermark', [DocumentController::class, 'applyWatermark']);

    // Property analytics + history
    Route::get('/properties/{property}/analytics', [PropertyController::class, 'analytics']);
    Route::get('/properties/{property}/history', [PropertyController::class, 'history']);

    // Notifications
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::get('/notifications/unread-count', [NotificationController::class, 'unreadCount']);
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllRead']);
    Route::post('/notifications/{notification}/read', [NotificationController::class, 'markRead']);
    Route::delete('/notifications/{notification}', [NotificationController::class, 'destroy']);

    // Marketplace cross-broker
    Route::get('/marketplace', [MarketplaceController::class, 'index']);
    Route::get('/marketplace/stats', [MarketplaceController::class, 'stats']);
    Route::post('/properties/{property}/share', [MarketplaceController::class, 'toggleShare']);

    // Billing / suscripción
    Route::get('/billing/me', [BillingController::class, 'me']);
    Route::post('/billing/upgrade', [BillingController::class, 'upgrade']);
    Route::post('/billing/cancel', [BillingController::class, 'cancel']);
    Route::post('/billing/reactivate', [BillingController::class, 'reactivate']);

    // ---------- Mercado Libre: gestión per-agency ----------
    Route::prefix('integrations/mercadolibre')->group(function () {
        Route::get('/connect', [MlAuthController::class, 'connect']);
        Route::get('/me', [MlAuthController::class, 'me']);
        Route::delete('/disconnect', [MlAuthController::class, 'disconnect']);

        Route::get('/properties/{property}', [MlPropertyController::class, 'show']);
        Route::post('/properties/{property}/publish', [MlPropertyController::class, 'publish']);
        Route::put('/properties/{property}', [MlPropertyController::class, 'update']);
        Route::patch('/properties/{property}/status', [MlPropertyController::class, 'setStatus']);
        Route::delete('/properties/{property}', [MlPropertyController::class, 'destroy']);
    });

    // Email templates + logs
    Route::get('/email-templates', [EmailController::class, 'indexTemplates']);
    Route::get('/email-templates/recipients', [EmailController::class, 'searchRecipients']);
    Route::post('/email-templates', [EmailController::class, 'storeTemplate']);
    Route::get('/email-templates/{template}', [EmailController::class, 'showTemplate']);
    Route::patch('/email-templates/{template}', [EmailController::class, 'updateTemplate']);
    Route::delete('/email-templates/{template}', [EmailController::class, 'destroyTemplate']);
    Route::post('/email-templates/{template}/preview', [EmailController::class, 'preview']);
    Route::post('/email-templates/{template}/send', [EmailController::class, 'send']);
    Route::get('/email-logs', [EmailController::class, 'logs']);
    Route::get('/email-logs/{log}', [EmailController::class, 'showLog']);
});
