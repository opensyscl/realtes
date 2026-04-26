<?php

use App\Http\Controllers\Api\AgencySettingsController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CalendarController;
use App\Http\Controllers\Api\ChargeController;
use App\Http\Controllers\Api\CommissionController;
use App\Http\Controllers\Api\ContractController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\DocumentController;
use App\Http\Controllers\Api\EmailController;
use App\Http\Controllers\Api\FeedController;
use App\Http\Controllers\Api\LeadController;
use App\Http\Controllers\Api\MaintenanceController;
use App\Http\Controllers\Api\MarketplaceController;
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
    ->middleware('throttle:6,1');
Route::post('/auth/register', [AuthController::class, 'register'])
    ->middleware('throttle:3,10');

// Escaparate público de cada agencia (sin auth)
Route::prefix('public/{slug}')->group(function () {
    Route::get('/', [PublicController::class, 'agency']);
    Route::get('/properties', [PublicController::class, 'index']);
    Route::get('/properties/{id}', [PublicController::class, 'show'])->whereNumber('id');
    // Throttle por IP (no global) para evitar bloquear escaparates con tráfico legítimo
    Route::post('/leads', [PublicController::class, 'storeLead'])
        ->middleware('throttle:public-leads');
});

// Property feeds públicos para portales (Idealista, etc.)
Route::prefix('feeds/{slug}')->group(function () {
    Route::get('/properties.json', [FeedController::class, 'json']);
    Route::get('/idealista.xml', [FeedController::class, 'idealistaXml']);
});

// Planes públicos (página de precios)
Route::get('/plans', [PlanController::class, 'index']);

// ---------- Autenticadas ----------
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::patch('/auth/profile', [AuthController::class, 'updateProfile']);

    // Agency settings
    Route::get('/agency', [AgencySettingsController::class, 'showAgency']);
    Route::patch('/agency', [AgencySettingsController::class, 'updateAgency']);
    Route::get('/agency/members', [AgencySettingsController::class, 'members']);
    Route::get('/agency/template', [AgencySettingsController::class, 'showTemplate']);
    Route::patch('/agency/template', [AgencySettingsController::class, 'updateTemplate']);
    Route::get('/agency/watermark', [AgencySettingsController::class, 'showWatermark']);
    Route::patch('/agency/watermark', [AgencySettingsController::class, 'updateWatermark']);
    Route::post('/agency/watermark/image', [AgencySettingsController::class, 'uploadWatermarkImage']);
    Route::delete('/agency/watermark/image', [AgencySettingsController::class, 'deleteWatermarkImage']);

    // Uploads directos a R2 (cover image, etc.)
    Route::post('/uploads/property-cover', [UploadController::class, 'propertyCover']);

    // Personal Access Tokens (API keys para uso externo)
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
    Route::apiResource('properties', PropertyController::class);

    // Property lease (gestión inline del contrato vigente)
    Route::get('/properties/{property}/lease', [PropertyLeaseController::class, 'show']);
    Route::post('/properties/{property}/lease', [PropertyLeaseController::class, 'store']);
    Route::delete('/properties/{property}/lease', [PropertyLeaseController::class, 'destroy']);

    // Persons
    Route::apiResource('persons', PersonController::class);

    // Contracts
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
    Route::post('/photos/{media}/set-cover', [DocumentController::class, 'setCover']);
    Route::post('/photos/{media}/replace', [DocumentController::class, 'replacePhoto']);

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
