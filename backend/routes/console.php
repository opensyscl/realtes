<?php

use App\Jobs\GenerateMonthlyChargesJob;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Cron mensual: el día 1 a las 06:00 genera la renta del mes para todos los contratos vigentes
Schedule::job(new GenerateMonthlyChargesJob())
    ->monthlyOn(1, '06:00')
    ->name('generate-monthly-charges')
    ->onOneServer();

// Diario a las 00:30 marca los cargos pasados de fecha como vencidos
Schedule::command('charges:mark-overdue')
    ->dailyAt('00:30')
    ->name('mark-overdue-charges')
    ->onOneServer();
