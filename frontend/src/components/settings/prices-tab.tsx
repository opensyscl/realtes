"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ChartLineData01Icon,
  Calculator01Icon,
  ArrowRight01Icon,
  InformationCircleIcon,
  Mail01Icon,
  RocketIcon,
  PropertyNewIcon,
} from "@hugeicons/core-free-icons";

import { toast } from "@/lib/toast";
import { useContracts, useBulkRentAdjust } from "@/lib/queries";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { NativeSelect } from "@/components/ui/native-select";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

const MONTHS = [
  { v: 1, label: "Enero" },
  { v: 2, label: "Febrero" },
  { v: 3, label: "Marzo" },
  { v: 4, label: "Abril" },
  { v: 5, label: "Mayo" },
  { v: 6, label: "Junio" },
  { v: 7, label: "Julio" },
  { v: 8, label: "Agosto" },
  { v: 9, label: "Septiembre" },
  { v: 10, label: "Octubre" },
  { v: 11, label: "Noviembre" },
  { v: 12, label: "Diciembre" },
];

interface IpcSerie {
  fecha: string; // ISO
  valor: number;
}

async function fetchIpcYear(year: number): Promise<IpcSerie[]> {
  const res = await fetch(`https://mindicador.cl/api/ipc/${year}`);
  if (!res.ok) throw new Error("No se pudo cargar IPC");
  const json = await res.json();
  return json.serie ?? [];
}

async function fetchUf(): Promise<number | null> {
  try {
    const res = await fetch("https://mindicador.cl/api/uf");
    const json = await res.json();
    return json?.serie?.[0]?.valor ?? null;
  } catch {
    return null;
  }
}

function findIpcValue(series: IpcSerie[], year: number, month: number) {
  return series.find((s) => {
    const d = new Date(s.fecha);
    return d.getUTCFullYear() === year && d.getUTCMonth() + 1 === month;
  });
}

/**
 * mindicador.cl devuelve IPC como **variación mensual %** (no como índice).
 * Para calcular la variación acumulada entre dos meses se hace compounding:
 *   prod(1 + valor_mensual_i / 100) - 1
 *
 * Convención: variación "DE start A end" usa los meses estrictamente
 * posteriores a start y hasta end inclusive (los meses que efectivamente
 * "ocurrieron" entre los dos puntos).
 */
function compoundIpc(
  series: IpcSerie[],
  startYear: number,
  startMonth: number,
  endYear: number,
  endMonth: number,
): number | null {
  const startTs = Date.UTC(startYear, startMonth - 1, 1);
  const endTs = Date.UTC(endYear, endMonth - 1, 1);
  if (endTs < startTs) return null;
  const between = series.filter((s) => {
    const t = new Date(s.fecha).getTime();
    return t > startTs && t <= endTs;
  });
  if (between.length === 0) return null;
  let prod = 1;
  for (const m of between) prod *= 1 + m.valor / 100;
  return (prod - 1) * 100;
}

/**
 * Calcula el período IPC para reajustar un arriendo siguiendo la regla
 * "un mes antes" (porque el IPC del mes en curso se publica recién a mitad
 * del siguiente, así que se usa el último publicado).
 *
 * Ejemplo: Contrato firmado en enero 2025, reajuste semestral en julio 2025:
 *   Inicio = diciembre 2024 (enero - 1)
 *   Término = junio 2025 (julio - 1)
 *
 * @param contractMonth Mes original del contrato (1-12)
 * @param contractYear Año original del contrato
 * @param periodMonths Periodicidad (6 = semestral, 12 = anual)
 * @param adjustmentDate Fecha objetivo del reajuste (default: hoy)
 */
function computeContractPeriod(
  contractMonth: number,
  contractYear: number,
  periodMonths: number,
  adjustmentDate = new Date(),
) {
  // Mes del reajuste (alineado con el aniversario del contrato más cercano)
  const adjMonth = adjustmentDate.getMonth() + 1;
  const adjYear = adjustmentDate.getFullYear();

  // Inicio: mes anterior al contrato. Si contrato es enero → diciembre del año anterior.
  const startMonth = contractMonth === 1 ? 12 : contractMonth - 1;
  const startYearBase =
    contractMonth === 1 ? contractYear - 1 : contractYear;

  // Sumar periodMonths al inicio para encontrar el "término" propuesto del período.
  // Si el resultado supera la fecha actual menos 1 mes, ajustamos al último mes
  // disponible (mes actual − 1).
  let endMonth = startMonth + periodMonths;
  let endYear = startYearBase;
  while (endMonth > 12) {
    endMonth -= 12;
    endYear += 1;
  }

  // Cap: no podemos calcular más allá del último mes con IPC publicado
  // (= mes actual − 1)
  const maxEndMonth = adjMonth === 1 ? 12 : adjMonth - 1;
  const maxEndYear = adjMonth === 1 ? adjYear - 1 : adjYear;
  if (
    endYear > maxEndYear ||
    (endYear === maxEndYear && endMonth > maxEndMonth)
  ) {
    endMonth = maxEndMonth;
    endYear = maxEndYear;
  }

  return {
    startMonth,
    startYear: startYearBase,
    endMonth,
    endYear,
  };
}

export function PricesTab() {
  const now = new Date();
  const [startYear, setStartYear] = useState(now.getFullYear() - 1);
  const [startMonth, setStartMonth] = useState(now.getMonth() + 1);
  const [endYear, setEndYear] = useState(now.getFullYear());
  const [endMonth, setEndMonth] = useState(now.getMonth() + 1);
  const [valueToAdjust, setValueToAdjust] = useState<string>("");
  const [calculated, setCalculated] = useState<{
    variation: number;
    adjustedValue: number | null;
    startIndex: number;
    endIndex: number;
  } | null>(null);

  // Estado del reajuste por contrato
  const [contractMonth, setContractMonth] = useState(1);
  const [contractYear, setContractYear] = useState(now.getFullYear() - 1);
  const [contractPeriod, setContractPeriod] = useState<6 | 12>(6);
  const [contractRent, setContractRent] = useState<string>("");

  const yearsToFetch = Array.from(
    new Set([
      startYear,
      endYear,
      startYear - 1,
      endYear - 1,
      contractYear,
      now.getFullYear(),
      now.getFullYear() - 1,
    ]),
  );
  const ipcQueries = useQuery({
    queryKey: ["ipc", yearsToFetch.sort().join(",")],
    queryFn: async () => {
      const all = await Promise.all(yearsToFetch.map((y) => fetchIpcYear(y)));
      return all.flat();
    },
    staleTime: 60 * 60_000,
  });

  const ufQuery = useQuery({
    queryKey: ["uf-current"],
    queryFn: fetchUf,
    staleTime: 30 * 60_000,
  });

  // Presets — autoseleccionan el período según el tipo de variación
  const applyPreset = (preset: "mensual" | "acumulada" | "anual") => {
    const curMonth = now.getMonth() + 1;
    const curYear = now.getFullYear();
    setEndMonth(curMonth);
    setEndYear(curYear);
    if (preset === "mensual") {
      // Mes anterior
      const prevMonth = curMonth === 1 ? 12 : curMonth - 1;
      const prevYear = curMonth === 1 ? curYear - 1 : curYear;
      setStartMonth(prevMonth);
      setStartYear(prevYear);
    } else if (preset === "acumulada") {
      // Diciembre del año anterior
      setStartMonth(12);
      setStartYear(curYear - 1);
    } else if (preset === "anual") {
      // Mismo mes del año anterior
      setStartMonth(curMonth);
      setStartYear(curYear - 1);
    }
    setCalculated(null);
  };

  const handleCalculate = () => {
    if (!ipcQueries.data) return;
    const variation = compoundIpc(
      ipcQueries.data,
      startYear,
      startMonth,
      endYear,
      endMonth,
    );
    if (variation == null) {
      setCalculated(null);
      return;
    }
    const startV = findIpcValue(ipcQueries.data, startYear, startMonth);
    const endV = findIpcValue(ipcQueries.data, endYear, endMonth);
    const baseValue = parseFloat(
      valueToAdjust.replace(/[^0-9.,-]/g, "").replace(",", "."),
    );
    const adjustedValue =
      !isNaN(baseValue) && baseValue > 0
        ? baseValue * (1 + variation / 100)
        : null;
    setCalculated({
      variation,
      adjustedValue,
      startIndex: startV?.valor ?? 0,
      endIndex: endV?.valor ?? 0,
    });
  };

  // ── Reajuste por contrato ─────────────────────────────────────
  const contractPeriodCalc = computeContractPeriod(
    contractMonth,
    contractYear,
    contractPeriod,
  );
  const contractCalc = (() => {
    if (!ipcQueries.data) return null;
    const variation = compoundIpc(
      ipcQueries.data,
      contractPeriodCalc.startYear,
      contractPeriodCalc.startMonth,
      contractPeriodCalc.endYear,
      contractPeriodCalc.endMonth,
    );
    if (variation == null) return null;
    const rent = parseFloat(
      contractRent.replace(/[^0-9.,-]/g, "").replace(",", "."),
    );
    const newRent =
      !isNaN(rent) && rent > 0 ? rent * (1 + variation / 100) : null;
    return { variation, newRent };
  })();

  // ── Tabla histórica IPC (últimos 24 meses) ───────────────────
  // mindicador.cl entrega cada `valor` como variación mensual % oficial,
  // así que la columna "Mensual" es directamente ese número. La columna
  // "Anual / 12 meses" se compone con los 12 meses anteriores (compound).
  const historyRows = (() => {
    if (!ipcQueries.data) return [];
    const sorted = [...ipcQueries.data].sort(
      (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime(),
    );
    const last = sorted.slice(0, 24);
    return last.map((row) => {
      const d = new Date(row.fecha);
      const m = d.getUTCMonth() + 1;
      const y = d.getUTCFullYear();
      // Variación 12 meses: desde el mismo mes del año anterior hasta este mes.
      const yearVar = compoundIpc(sorted, y - 1, m, y, m);
      return {
        year: y,
        month: m,
        monthVar: row.valor,
        yearVar,
      };
    });
  })();

  return (
    <div className="space-y-5">
      {/* Indicadores rápidos */}
      <Card className="flex flex-wrap items-center gap-4 p-4">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-warning-soft text-warning">
            <Icon icon={ChartLineData01Icon} size={16} />
          </span>
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              UF hoy
            </div>
            <div className="text-base font-bold tabular-numbers">
              {ufQuery.data
                ? `$${Math.round(ufQuery.data).toLocaleString("es-CL")}`
                : "…"}
            </div>
          </div>
        </div>
        <div className="text-[11px] text-foreground-muted">
          Datos del Banco Central de Chile vía mindicador.cl, actualizados
          diariamente.
        </div>
      </Card>

      {/* Calculadora de variación IPC */}
      <Card className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold">
              Calculadora de variación IPC
            </h3>
            <p className="mt-0.5 text-[13px] text-foreground-muted">
              Calcula la variación porcentual del IPC entre dos fechas y aplica
              el ajuste a un valor (ideal para reajustar arriendos por
              inflación).
            </p>
          </div>
          <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-primary-soft text-primary">
            <Icon icon={Calculator01Icon} size={16} />
          </span>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1fr]">
          <div className="space-y-3 rounded-2xl border border-border-subtle bg-surface-muted/40 p-4">
            <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Período de cálculo
            </h4>

            <Field label="Inicio">
              <div className="flex gap-2">
                <NativeSelect
                  value={startMonth}
                  onChange={(e) => setStartMonth(Number(e.target.value))}
                >
                  {MONTHS.map((m) => (
                    <option key={m.v} value={m.v}>
                      {m.label}
                    </option>
                  ))}
                </NativeSelect>
                <Input
                  type="number"
                  value={startYear}
                  onChange={(e) => setStartYear(Number(e.target.value) || now.getFullYear())}
                  min={2000}
                  max={now.getFullYear() + 1}
                  className="w-24"
                />
              </div>
            </Field>

            <Field label="Término">
              <div className="flex gap-2">
                <NativeSelect
                  value={endMonth}
                  onChange={(e) => setEndMonth(Number(e.target.value))}
                >
                  {MONTHS.map((m) => (
                    <option key={m.v} value={m.v}>
                      {m.label}
                    </option>
                  ))}
                </NativeSelect>
                <Input
                  type="number"
                  value={endYear}
                  onChange={(e) => setEndYear(Number(e.target.value) || now.getFullYear())}
                  min={2000}
                  max={now.getFullYear() + 1}
                  className="w-24"
                />
              </div>
            </Field>

            <Field label="Valor a ajustar (CLP)" hint="Opcional">
              <Input
                type="text"
                value={valueToAdjust}
                onChange={(e) => setValueToAdjust(e.target.value)}
                placeholder="Ej: 500000"
              />
            </Field>

            <Button
              onClick={handleCalculate}
              loading={ipcQueries.isLoading}
              className="w-full"
            >
              <Icon icon={ArrowRight01Icon} size={14} />
              Calcular variación
            </Button>
          </div>

          {/* Resultado */}
          <div className="rounded-2xl border border-border-subtle bg-surface p-4">
            <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Variación del período
            </h4>

            {!calculated ? (
              <div className="mt-6 text-center text-foreground-muted">
                <Icon
                  icon={Calculator01Icon}
                  size={32}
                  className="mx-auto opacity-30"
                />
                <p className="mt-2 text-[12px]">
                  Selecciona el período y presiona Calcular.
                </p>
              </div>
            ) : (
              <div className="mt-4">
                <div
                  className={cn(
                    "text-center text-5xl font-bold tabular-numbers tracking-tight",
                    Math.abs(calculated.variation) < 0.05
                      ? "text-foreground-muted"
                      : calculated.variation > 0
                        ? "text-positive"
                        : "text-negative",
                  )}
                >
                  {Math.abs(calculated.variation) < 0.05
                    ? "Sin variación"
                    : `${calculated.variation > 0 ? "+" : ""}${calculated.variation.toFixed(2)}%`}
                </div>
                <div className="mt-3 rounded-xl bg-surface-muted/50 p-2 text-center text-[11px]">
                  <span className="text-foreground-muted">
                    Variación acumulada de{" "}
                    <strong className="text-foreground">
                      {MONTHS[startMonth - 1]?.label} {startYear}
                    </strong>
                    {" "}a{" "}
                    <strong className="text-foreground">
                      {MONTHS[endMonth - 1]?.label} {endYear}
                    </strong>
                  </span>
                </div>

                {calculated.adjustedValue != null && (
                  <div className="mt-4 rounded-2xl border border-primary/30 bg-primary-soft/30 p-3 text-center">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-primary">
                      Valor ajustado
                    </div>
                    <div className="mt-1 text-2xl font-bold tabular-numbers text-primary">
                      $
                      {Math.round(
                        calculated.adjustedValue,
                      ).toLocaleString("es-CL")}
                    </div>
                    <div className="mt-1 text-[11px] text-foreground-muted">
                      Diferencia: $
                      {Math.round(
                        calculated.adjustedValue -
                          parseFloat(
                            valueToAdjust.replace(",", ".").replace(/[^0-9.-]/g, ""),
                          ),
                      ).toLocaleString("es-CL")}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Presets clickables: aplican el período automáticamente */}
        <div className="mt-5">
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Atajos
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <PresetCard
              title="Mensual"
              description="Mes actual vs mes anterior"
              onClick={() => applyPreset("mensual")}
            />
            <PresetCard
              title="Acumulada en el año"
              description="Mes actual vs diciembre del año anterior"
              onClick={() => applyPreset("acumulada")}
            />
            <PresetCard
              title="Anual / 12 meses"
              description="Mes actual vs mismo mes del año anterior"
              onClick={() => applyPreset("anual")}
            />
          </div>
        </div>

        <div className="mt-3 flex items-start gap-2 rounded-2xl border border-info/20 bg-info-soft/20 p-3 text-[11px] text-foreground-muted">
          <Icon
            icon={InformationCircleIcon}
            size={13}
            className="mt-0.5 shrink-0 text-info"
          />
          <span>
            Internamente los cálculos se hacen con los índices oficiales
            empalmados que publica el Banco Central de Chile. El resultado se
            presenta a 2 decimales aunque el oficial tiene mayor precisión.
          </span>
        </div>
      </Card>

      {/* ───── Reajuste por contrato ───── */}
      <Card className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold">
              Reajuste de arriendo por contrato
            </h3>
            <p className="mt-0.5 text-[13px] text-foreground-muted">
              Calcula el reajuste según la fecha del contrato siguiendo la
              regla &ldquo;un mes antes&rdquo;: si el contrato es de enero, el
              período toma desde diciembre del año anterior hasta el último
              IPC publicado.
            </p>
          </div>
          <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-positive-soft text-positive">
            <Icon icon={Mail01Icon} size={16} />
          </span>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1fr]">
          <div className="space-y-3 rounded-2xl border border-border-subtle bg-surface-muted/40 p-4">
            <Field label="Mes y año del contrato">
              <div className="flex gap-2">
                <NativeSelect
                  value={contractMonth}
                  onChange={(e) => setContractMonth(Number(e.target.value))}
                >
                  {MONTHS.map((m) => (
                    <option key={m.v} value={m.v}>
                      {m.label}
                    </option>
                  ))}
                </NativeSelect>
                <Input
                  type="number"
                  value={contractYear}
                  onChange={(e) =>
                    setContractYear(Number(e.target.value) || now.getFullYear() - 1)
                  }
                  min={2000}
                  max={now.getFullYear()}
                  className="w-24"
                />
              </div>
            </Field>

            <Field label="Periodicidad de reajuste">
              <div className="inline-flex rounded-full border border-border p-1">
                {[
                  { v: 6, label: "Semestral" },
                  { v: 12, label: "Anual" },
                ].map((p) => (
                  <button
                    key={p.v}
                    type="button"
                    onClick={() => setContractPeriod(p.v as 6 | 12)}
                    className={cn(
                      "rounded-full px-3 py-1 text-[12px] font-semibold transition-colors",
                      contractPeriod === p.v
                        ? "bg-foreground text-accent-foreground"
                        : "text-foreground-muted hover:bg-surface-muted",
                    )}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </Field>

            <Field label="Arriendo actual (CLP)">
              <Input
                type="text"
                value={contractRent}
                onChange={(e) => setContractRent(e.target.value)}
                placeholder="500000"
              />
            </Field>

            <div className="rounded-xl bg-surface px-3 py-2 text-[11px] text-foreground-muted">
              <span className="font-semibold text-foreground">Período: </span>
              {MONTHS[contractPeriodCalc.startMonth - 1]?.label}{" "}
              {contractPeriodCalc.startYear} →{" "}
              {MONTHS[contractPeriodCalc.endMonth - 1]?.label}{" "}
              {contractPeriodCalc.endYear}
            </div>
          </div>

          <div className="rounded-2xl border border-border-subtle bg-surface p-4">
            <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Resultado del reajuste
            </h4>
            {!contractCalc ? (
              <p className="mt-4 text-center text-[12px] text-foreground-muted">
                {ipcQueries.isLoading
                  ? "Cargando IPC…"
                  : "No hay datos IPC para el período seleccionado."}
              </p>
            ) : (
              <div className="mt-3 space-y-3">
                <div
                  className={cn(
                    "text-center text-3xl font-bold tabular-numbers",
                    contractCalc.variation > 0
                      ? "text-positive"
                      : contractCalc.variation < 0
                        ? "text-negative"
                        : "text-foreground-muted",
                  )}
                >
                  {contractCalc.variation > 0 ? "+" : ""}
                  {contractCalc.variation.toFixed(2)}%
                </div>
                {contractCalc.newRent != null && (
                  <div className="rounded-2xl border border-positive/30 bg-positive-soft/30 p-3 text-center">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-positive">
                      Nuevo arriendo
                    </div>
                    <div className="mt-1 text-2xl font-bold tabular-numbers text-positive">
                      $
                      {Math.round(contractCalc.newRent).toLocaleString("es-CL")}
                    </div>
                    <div className="mt-1 text-[11px] text-foreground-muted">
                      Diferencia: +$
                      {Math.round(
                        contractCalc.newRent -
                          parseFloat(
                            contractRent
                              .replace(",", ".")
                              .replace(/[^0-9.-]/g, ""),
                          ),
                      ).toLocaleString("es-CL")}
                    </div>
                  </div>
                )}
                <Button
                  className="w-full"
                  disabled={contractCalc.newRent == null}
                  onClick={() => {
                    toast.confirm({
                      title: "¿Notificar al inquilino?",
                      description: `Se enviará un email con el detalle del reajuste y el nuevo monto de $${contractCalc.newRent ? Math.round(contractCalc.newRent).toLocaleString("es-CL") : "—"}.`,
                      confirmLabel: "Enviar email",
                    }).then((ok) => {
                      if (ok) {
                        toast.success({
                          title: "Email programado",
                          description:
                            "Conecta esto con un Contract real para enviar el email automáticamente.",
                        });
                      }
                    });
                  }}
                >
                  <Icon icon={Mail01Icon} size={13} />
                  Notificar al inquilino por email
                </Button>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* ───── Reajuste masivo de propiedades en arriendo ───── */}
      <BulkContractAdjustment ipcData={ipcQueries.data ?? null} />

      {/* ───── Tabla histórica de IPC ───── */}
      <Card className="overflow-hidden p-0">
        <div className="border-b border-border-subtle p-5">
          <h3 className="text-base font-semibold">
            Tabla de variación IPC (últimos 24 meses)
          </h3>
          <p className="mt-0.5 text-[13px] text-foreground-muted">
            Variación oficial publicada por el Banco Central. &ldquo;Mensual&rdquo;
            es el cambio vs. el mes anterior; &ldquo;Anual / 12 m&rdquo; es la
            inflación acumulada de los 12 meses anteriores.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-subtle bg-surface-muted/50 text-xs font-medium text-muted-foreground">
                <th className="h-10 px-5 text-left">Mes</th>
                <th className="h-10 px-5 text-right">Mensual</th>
                <th className="h-10 px-5 text-right">Anual / 12 m</th>
              </tr>
            </thead>
            <tbody>
              {ipcQueries.isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={3} className="h-12 px-5">
                      <div className="h-4 animate-pulse rounded bg-surface-muted" />
                    </td>
                  </tr>
                ))
              ) : historyRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    className="px-5 py-10 text-center text-foreground-muted"
                  >
                    Sin datos disponibles.
                  </td>
                </tr>
              ) : (
                historyRows.map((row, i) => (
                  <tr
                    key={`${row.year}-${row.month}`}
                    className={cn(
                      "border-b border-border-subtle last:border-b-0",
                      i === 0 && "bg-primary-soft/15",
                    )}
                  >
                    <td className="h-12 px-5 capitalize">
                      {MONTHS[row.month - 1]?.label} {row.year}
                    </td>
                    <td
                      className={cn(
                        "h-12 px-5 text-right tabular-numbers",
                        row.monthVar > 0
                          ? "text-positive"
                          : row.monthVar < 0
                            ? "text-negative"
                            : "text-foreground-muted",
                      )}
                    >
                      {`${row.monthVar > 0 ? "+" : ""}${row.monthVar.toFixed(2)}%`}
                    </td>
                    <td
                      className={cn(
                        "h-12 px-5 text-right tabular-numbers",
                        row.yearVar == null
                          ? "text-foreground-muted"
                          : row.yearVar > 0
                            ? "text-positive"
                            : row.yearVar < 0
                              ? "text-negative"
                              : "text-foreground-muted",
                      )}
                    >
                      {row.yearVar == null
                        ? "—"
                        : `${row.yearVar > 0 ? "+" : ""}${row.yearVar.toFixed(2)}%`}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function BulkContractAdjustment({
  ipcData,
}: {
  ipcData: IpcSerie[] | null;
}) {
  const { data, isLoading } = useContracts({ status: "vigente", per_page: 200 });
  const adjust = useBulkRentAdjust();
  const [period, setPeriod] = useState<6 | 12>(6);
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const contracts = data?.data ?? [];

  // Para cada contrato, calcula la variación según su start_date + periodicidad.
  const rows = contracts.map((c) => {
    const startDate = c.start_date ? new Date(c.start_date) : null;
    if (!startDate || !ipcData) {
      return {
        contract: c,
        variation: null as number | null,
        newRent: null as number | null,
        period: null,
      };
    }
    const cm = startDate.getUTCMonth() + 1;
    const cy = startDate.getUTCFullYear();
    const calc = computeContractPeriod(cm, cy, period);
    const variation = compoundIpc(
      ipcData,
      calc.startYear,
      calc.startMonth,
      calc.endYear,
      calc.endMonth,
    );
    const rent = Number(c.monthly_rent);
    const newRent =
      variation != null && rent > 0 ? rent * (1 + variation / 100) : null;
    return { contract: c, variation, newRent, period: calc };
  });

  const adjustable = rows.filter(
    (r) => r.variation != null && r.newRent != null && Math.abs(r.variation) > 0.05,
  );

  const toggle = (id: number) => {
    setSelected((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  };

  const toggleAll = () => {
    if (selected.size === adjustable.length) setSelected(new Set());
    else setSelected(new Set(adjustable.map((r) => r.contract.id)));
  };

  const applySelected = async () => {
    const adjustments = rows
      .filter((r) => selected.has(r.contract.id) && r.newRent != null)
      .map((r) => ({
        contract_id: r.contract.id,
        new_rent: Math.round(r.newRent as number),
      }));
    if (adjustments.length === 0) return;

    const ok = await toast.confirm({
      title: `¿Aplicar reajuste a ${adjustments.length} contrato${adjustments.length === 1 ? "" : "s"}?`,
      description: `Se actualizará la renta mensual y los splits de comisión se recalcularán automáticamente. Esta acción no envía emails — usa el botón individual para notificar.`,
      confirmLabel: "Aplicar reajuste",
    });
    if (!ok) return;

    try {
      const res = await toast.promise(
        adjust.mutateAsync({ adjustments, reason: `Reajuste IPC ${period}m` }),
        {
          loading: { title: "Aplicando reajustes…" },
          success: (r: { updated: number; total: number }) => ({
            title: `${r.updated} contratos actualizados`,
            description:
              r.updated < r.total
                ? `${r.total - r.updated} sin cambio (variación nula).`
                : undefined,
          }),
          error: (e: unknown) => ({
            title: "Error",
            description: e instanceof Error ? e.message : "",
          }),
        },
      );
      setSelected(new Set());
      void res;
    } catch {
      // toast ya muestra error
    }
  };

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold">
            Reajuste masivo de contratos vigentes
          </h3>
          <p className="mt-0.5 text-[13px] text-foreground-muted">
            Variación IPC calculada para cada contrato según su fecha de inicio
            (regla &ldquo;un mes antes&rdquo;). Selecciona los que quieres
            actualizar y aplica.
          </p>
        </div>
        <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-primary-soft text-primary">
          <Icon icon={PropertyNewIcon} size={16} />
        </span>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <div className="inline-flex rounded-full border border-border p-1">
          {[
            { v: 6, label: "Semestral" },
            { v: 12, label: "Anual" },
          ].map((p) => (
            <button
              key={p.v}
              type="button"
              onClick={() => {
                setPeriod(p.v as 6 | 12);
                setSelected(new Set());
              }}
              className={cn(
                "rounded-full px-3 py-1 text-[12px] font-semibold transition-colors",
                period === p.v
                  ? "bg-foreground text-accent-foreground"
                  : "text-foreground-muted hover:bg-surface-muted",
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
        <div className="text-[12px] text-foreground-muted">
          {adjustable.length} contrato{adjustable.length === 1 ? "" : "s"} con
          variación aplicable · {selected.size} seleccionado
          {selected.size === 1 ? "" : "s"}
        </div>
        <div className="ml-auto">
          <Button
            onClick={applySelected}
            disabled={selected.size === 0 || adjust.isPending}
            loading={adjust.isPending}
          >
            <Icon icon={RocketIcon} size={13} />
            Aplicar a {selected.size} contrato{selected.size === 1 ? "" : "s"}
          </Button>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto rounded-2xl border border-border-subtle">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border-subtle bg-surface-muted/50 text-xs font-medium text-muted-foreground">
              <th className="h-10 px-3 text-left">
                <button
                  type="button"
                  onClick={toggleAll}
                  className={cn(
                    "flex h-5 w-5 items-center justify-center rounded border transition-colors",
                    selected.size === adjustable.length && adjustable.length > 0
                      ? "border-foreground bg-foreground text-accent-foreground"
                      : "border-border bg-surface hover:bg-surface-muted",
                  )}
                >
                  {selected.size === adjustable.length &&
                    adjustable.length > 0 && (
                      <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                        <path
                          d="M2 6.5L4.5 9L10 3.5"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                </button>
              </th>
              <th className="h-10 px-3 text-left">Contrato</th>
              <th className="h-10 px-3 text-left">Inicio</th>
              <th className="h-10 px-3 text-right">Renta actual</th>
              <th className="h-10 px-3 text-right">Variación IPC</th>
              <th className="h-10 px-3 text-right">Nueva renta</th>
              <th className="h-10 px-3 text-right">Diferencia</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i}>
                  <td colSpan={7} className="h-12 px-3">
                    <div className="h-4 animate-pulse rounded bg-surface-muted" />
                  </td>
                </tr>
              ))
            ) : rows.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-3 py-10 text-center text-foreground-muted"
                >
                  No hay contratos vigentes.
                </td>
              </tr>
            ) : (
              rows.map((r) => {
                const checked = selected.has(r.contract.id);
                const canSelect =
                  r.variation != null &&
                  r.newRent != null &&
                  Math.abs(r.variation) > 0.05;
                const diff =
                  r.newRent != null
                    ? r.newRent - Number(r.contract.monthly_rent)
                    : null;
                return (
                  <tr
                    key={r.contract.id}
                    className={cn(
                      "border-b border-border-subtle last:border-b-0",
                      checked && "bg-primary-soft/15",
                    )}
                  >
                    <td className="h-12 px-3">
                      <button
                        type="button"
                        onClick={() => toggle(r.contract.id)}
                        disabled={!canSelect}
                        className={cn(
                          "flex h-5 w-5 items-center justify-center rounded border transition-colors",
                          !canSelect
                            ? "border-border-subtle bg-surface-muted/40 opacity-40"
                            : checked
                              ? "border-foreground bg-foreground text-accent-foreground"
                              : "border-border bg-surface hover:bg-surface-muted",
                        )}
                      >
                        {checked && (
                          <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                            <path
                              d="M2 6.5L4.5 9L10 3.5"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </button>
                    </td>
                    <td className="h-12 px-3">
                      <div className="font-mono text-[12px] tabular-numbers">
                        {r.contract.code}
                      </div>
                      <div className="text-[11px] text-foreground-muted">
                        {r.contract.property?.title ?? "—"}
                      </div>
                    </td>
                    <td className="h-12 px-3 text-[12px] tabular-numbers text-foreground-muted">
                      {r.contract.start_date ?? "—"}
                    </td>
                    <td className="h-12 px-3 text-right tabular-numbers">
                      ${Number(r.contract.monthly_rent).toLocaleString("es-CL")}
                    </td>
                    <td
                      className={cn(
                        "h-12 px-3 text-right tabular-numbers font-semibold",
                        r.variation == null
                          ? "text-foreground-muted"
                          : Math.abs(r.variation) < 0.05
                            ? "text-foreground-muted"
                            : r.variation > 0
                              ? "text-positive"
                              : "text-negative",
                      )}
                    >
                      {r.variation == null
                        ? "—"
                        : Math.abs(r.variation) < 0.05
                          ? "—"
                          : `${r.variation > 0 ? "+" : ""}${r.variation.toFixed(2)}%`}
                    </td>
                    <td className="h-12 px-3 text-right tabular-numbers">
                      {r.newRent == null
                        ? "—"
                        : `$${Math.round(r.newRent).toLocaleString("es-CL")}`}
                    </td>
                    <td
                      className={cn(
                        "h-12 px-3 text-right tabular-numbers",
                        diff == null
                          ? "text-foreground-muted"
                          : diff > 0
                            ? "text-positive"
                            : diff < 0
                              ? "text-negative"
                              : "text-foreground-muted",
                      )}
                    >
                      {diff == null
                        ? "—"
                        : `${diff > 0 ? "+" : ""}$${Math.round(diff).toLocaleString("es-CL")}`}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function PresetCard({
  title,
  description,
  onClick,
}: {
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex flex-col rounded-2xl border border-border-subtle bg-surface p-3 text-left transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-card"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-[12px] font-semibold">{title}</span>
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-surface-muted text-foreground-muted transition-colors group-hover:bg-primary group-hover:text-white">
          <Icon icon={ArrowRight01Icon} size={11} />
        </span>
      </div>
      <p className="mt-0.5 text-[11px] text-foreground-muted">{description}</p>
    </button>
  );
}
