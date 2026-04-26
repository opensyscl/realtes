"use client";

import { useMemo, useState } from "react";
import {
  Cancel01Icon,
  CheckmarkCircle02Icon,
  Delete02Icon,
  Download01Icon,
  PropertyNewIcon,
  ArrowUp01Icon,
} from "@hugeicons/core-free-icons";

import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { usePropertySelection } from "@/store/selection";
import { useBulkProperties, type Property } from "@/lib/queries";
import { cn, formatCurrency } from "@/lib/utils";
import { CompareDialog } from "./compare-dialog";

const STATUS_OPTIONS = [
  { value: "disponible", label: "Disponible" },
  { value: "arrendada", label: "Arrendada" },
  { value: "vendida", label: "Vendida" },
  { value: "reservada", label: "Reservada" },
  { value: "mantenimiento", label: "En mantenimiento" },
];

export function SelectionBar({ allProperties }: { allProperties: Property[] }) {
  // Importante: el selector devuelve la referencia estable del Set.
  // Derivamos el array con useMemo para no crear uno nuevo en cada render
  // (lo que dispararía el bug "getSnapshot should be cached" de Zustand v5).
  const idsSet = usePropertySelection((s) => s.ids);
  const ids = useMemo(() => Array.from(idsSet), [idsSet]);
  const clear = usePropertySelection((s) => s.clear);
  const bulk = useBulkProperties();

  const [statusOpen, setStatusOpen] = useState(false);
  const [compareOpen, setCompareOpen] = useState(false);

  if (ids.length === 0) return null;

  const selectedProps = allProperties.filter((p) => ids.includes(p.id));

  const handleStatusChange = async (status: string) => {
    setStatusOpen(false);
    await bulk.mutateAsync({
      action: "change_status",
      ids,
      payload: { status },
    });
    clear();
  };

  const handleArchive = async () => {
    if (!confirm(`¿Archivar ${ids.length} propiedad(es)?`)) return;
    await bulk.mutateAsync({ action: "archive", ids });
    clear();
  };

  const handleExportCsv = () => {
    const rows = selectedProps.map((p) => ({
      codigo: p.code,
      titulo: p.title,
      tipo: p.type,
      estado: p.status,
      operacion: p.listing_type,
      direccion: p.address,
      ciudad: p.city,
      hab: p.bedrooms,
      banos: p.bathrooms,
      m2: p.area_sqm ?? "",
      renta_mes: p.price_rent ?? "",
      precio_venta: p.price_sale ?? "",
      cuota_comunidad: p.community_fee ?? "",
    }));
    const headers = Object.keys(rows[0] ?? {});
    const csv = [
      headers.join(","),
      ...rows.map((r) =>
        headers
          .map((h) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const v = (r as any)[h];
            const s = String(v ?? "").replace(/"/g, '""');
            return s.includes(",") || s.includes('"') ? `"${s}"` : s;
          })
          .join(","),
      ),
    ].join("\n");

    const blob = new Blob([`﻿${csv}`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `propiedades-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const totalRent = selectedProps.reduce((s, p) => s + (p.price_rent ?? 0), 0);
  const canCompare = ids.length >= 2 && ids.length <= 4;

  return (
    <>
      <div className="fixed bottom-4 left-1/2 z-40 -translate-x-1/2">
        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-foreground py-2 pl-4 pr-2 text-accent-foreground shadow-2xl ring-1 ring-black/5">
          <span className="text-sm font-medium">
            <span className="tabular-numbers">{ids.length}</span> seleccionada
            {ids.length !== 1 && "s"}
          </span>
          <span className="text-xs opacity-60">·</span>
          <span className="text-xs opacity-80 tabular-numbers">
            {formatCurrency(totalRent)}/mes
          </span>

          <div className="mx-2 h-5 w-px bg-accent-foreground/20" />

          {/* Cambiar estado */}
          <div className="relative">
            <button
              onClick={() => setStatusOpen((o) => !o)}
              className="inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-xs font-medium hover:bg-accent-foreground/10"
            >
              <Icon icon={PropertyNewIcon} size={13} />
              Estado
              <Icon icon={ArrowUp01Icon} size={11} />
            </button>
            {statusOpen && (
              <div className="absolute bottom-full left-0 mb-2 w-44 rounded-2xl border border-border bg-surface p-1 text-foreground shadow-xl">
                {STATUS_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => handleStatusChange(opt.value)}
                    className="flex w-full items-center rounded-xl px-3 py-2 text-left text-sm hover:bg-surface-muted"
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Comparar */}
          <button
            onClick={() => setCompareOpen(true)}
            disabled={!canCompare}
            title={canCompare ? "Comparar lado a lado" : "Selecciona entre 2 y 4 propiedades"}
            className={cn(
              "inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-xs font-medium",
              canCompare
                ? "hover:bg-accent-foreground/10"
                : "cursor-not-allowed opacity-40",
            )}
          >
            <Icon icon={CheckmarkCircle02Icon} size={13} />
            Comparar
          </button>

          {/* Export */}
          <button
            onClick={handleExportCsv}
            className="inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-xs font-medium hover:bg-accent-foreground/10"
          >
            <Icon icon={Download01Icon} size={13} />
            CSV
          </button>

          {/* Archive */}
          <button
            onClick={handleArchive}
            className="inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-xs font-medium hover:bg-negative-soft/10 hover:text-negative"
          >
            <Icon icon={Delete02Icon} size={13} />
            Archivar
          </button>

          <div className="mx-1 h-5 w-px bg-accent-foreground/20" />

          {/* Cancel */}
          <button
            onClick={clear}
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-accent-foreground/10"
            aria-label="Deseleccionar todo"
          >
            <Icon icon={Cancel01Icon} size={14} />
          </button>
        </div>
      </div>

      <CompareDialog
        open={compareOpen}
        onClose={() => setCompareOpen(false)}
        properties={selectedProps}
      />
    </>
  );
}

// Suprime warning Button no usado
void Button;
