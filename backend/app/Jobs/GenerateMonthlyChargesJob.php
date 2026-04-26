<?php

namespace App\Jobs;

use App\Models\Charge;
use App\Models\Contract;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Carbon;

class GenerateMonthlyChargesJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public ?int $agencyId = null,
        public ?string $forMonth = null, // YYYY-MM, default: current month
    ) {}

    public function handle(): array
    {
        $month = $this->forMonth
            ? Carbon::createFromFormat('Y-m', $this->forMonth)->startOfMonth()
            : Carbon::now()->startOfMonth();

        $q = Contract::query()
            ->where('status', 'vigente')
            ->where('start_date', '<=', $month->copy()->endOfMonth())
            ->where('end_date', '>=', $month);

        if ($this->agencyId) {
            $q->where('agency_id', $this->agencyId);
        }

        $created = 0;
        $skipped = 0;

        $q->chunkById(100, function ($contracts) use ($month, &$created, &$skipped) {
            foreach ($contracts as $contract) {
                $existing = Charge::where('contract_id', $contract->id)
                    ->where('concept', 'renta')
                    ->whereYear('issued_at', $month->year)
                    ->whereMonth('issued_at', $month->month)
                    ->exists();

                if ($existing) {
                    $skipped++;
                    continue;
                }

                $due = $month->copy()->setDay($contract->payment_day);
                $code = 'CG-'.str_pad(
                    (string) ($contract->id * 1000 + $month->month),
                    7, '0', STR_PAD_LEFT,
                );

                Charge::create([
                    'agency_id' => $contract->agency_id,
                    'contract_id' => $contract->id,
                    'person_id' => $contract->tenant_id,
                    'code' => $code,
                    'concept' => 'renta',
                    'description' => 'Renta '.$month->translatedFormat('F Y'),
                    'amount' => $contract->monthly_rent,
                    'paid_amount' => 0,
                    'issued_at' => $month->copy()->startOfMonth(),
                    'due_date' => $due,
                    'status' => 'pendiente',
                    'recurring' => true,
                ]);

                $created++;
            }
        });

        return ['created' => $created, 'skipped' => $skipped, 'month' => $month->format('Y-m')];
    }
}
