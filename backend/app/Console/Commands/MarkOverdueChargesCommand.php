<?php

namespace App\Console\Commands;

use App\Models\Charge;
use Illuminate\Console\Command;

class MarkOverdueChargesCommand extends Command
{
    protected $signature = 'charges:mark-overdue';

    protected $description = 'Mark pending charges past due date as overdue';

    public function handle(): int
    {
        $count = Charge::query()
            ->whereIn('status', ['pendiente', 'parcial'])
            ->whereDate('due_date', '<', now()->toDateString())
            ->update(['status' => 'vencido']);

        $this->info("Marked {$count} charges as overdue.");

        return self::SUCCESS;
    }
}
