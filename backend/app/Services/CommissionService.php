<?php

namespace App\Services;

use App\Models\CommissionSplit;
use App\Models\Contract;

class CommissionService
{
    /**
     * Genera los splits de comisión por defecto para un contrato.
     * Si solo hay un agente asignado: 100% para él como captador.
     * Si hay captador y vendedor distintos: 50/50.
     * Por ahora usamos solo agent_user_id => captador 100%.
     * Esta lógica es punto de extensión.
     */
    public static function generateDefaultSplits(Contract $contract): void
    {
        // Si ya tiene splits, no rehacemos
        if ($contract->commissionSplits()->exists()) {
            return;
        }

        $total = CommissionSplit::calculateTotalForContract($contract);
        if ($total <= 0) {
            return;
        }

        $userId = $contract->agent_user_id;
        if (! $userId) {
            return;
        }

        CommissionSplit::create([
            'agency_id' => $contract->agency_id,
            'contract_id' => $contract->id,
            'user_id' => $userId,
            'role' => CommissionSplit::ROLE_LISTING,
            'pct' => 100,
            'amount' => $total,
            'status' => CommissionSplit::STATUS_PENDING,
        ]);
    }

    /**
     * Recalcula los amounts cuando cambia monthly_rent o commission_pct del contrato.
     */
    public static function recalculateAmounts(Contract $contract): void
    {
        $total = CommissionSplit::calculateTotalForContract($contract);
        foreach ($contract->commissionSplits as $split) {
            if ($split->status === CommissionSplit::STATUS_PAID) {
                continue;
            }
            $split->update([
                'amount' => round($total * (float) $split->pct / 100, 2),
            ]);
        }
    }
}
