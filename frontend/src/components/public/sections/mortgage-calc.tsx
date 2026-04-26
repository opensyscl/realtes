"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { formatCurrency } from "@/lib/utils";

export function MortgageCalc({ price }: { price: number }) {
  const [downPct, setDownPct] = useState(20);
  const [years, setYears] = useState(30);
  const [rate, setRate] = useState(3.5);

  const monthly = useMemo(() => {
    const principal = price * (1 - downPct / 100);
    const r = rate / 100 / 12;
    const n = years * 12;
    if (r === 0) return principal / n;
    return (principal * r) / (1 - Math.pow(1 + r, -n));
  }, [price, downPct, years, rate]);

  return (
    <Card className="p-5">
      <h3 className="text-sm font-semibold">Calculadora hipotecaria</h3>
      <p className="mt-1 text-xs text-foreground-muted">
        Estimación informativa. Consulta con tu banco.
      </p>
      <div className="mt-4 grid grid-cols-3 gap-3">
        <Field label="Entrada %">
          <Input
            type="number"
            value={downPct}
            onChange={(e) => setDownPct(Number(e.target.value))}
          />
        </Field>
        <Field label="Años">
          <Input
            type="number"
            value={years}
            onChange={(e) => setYears(Number(e.target.value))}
          />
        </Field>
        <Field label="Interés %">
          <Input
            type="number"
            step="0.1"
            value={rate}
            onChange={(e) => setRate(Number(e.target.value))}
          />
        </Field>
      </div>
      <div className="mt-5 rounded-2xl bg-surface-muted p-4 text-center">
        <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Cuota estimada
        </div>
        <div className="mt-1 text-2xl font-bold tabular-numbers tracking-tight">
          {formatCurrency(monthly)}
          <span className="ml-1 text-xs font-medium text-foreground-muted">/mes</span>
        </div>
      </div>
    </Card>
  );
}
