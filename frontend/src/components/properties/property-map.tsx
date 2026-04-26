"use client";

import "leaflet/dist/leaflet.css";

import { useMemo, useState } from "react";
import Link from "next/link";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import {
  Search01Icon,
  PropertyNewIcon,
  BedSingle01Icon,
  Bathtub01Icon,
  RulerIcon,
} from "@hugeicons/core-free-icons";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { useMapProperties, type MapProperty } from "@/lib/queries";
import { cn, formatCurrency } from "@/lib/utils";

const VALENCIA_CENTER: [number, number] = [39.469, -0.376];

const STATUS_COLOR: Record<string, string> = {
  disponible: "var(--color-positive)",
  ocupada: "var(--color-info)",
  mantenimiento: "var(--color-warning)",
  fuera_mercado: "var(--color-foreground-muted)",
};

const STATUS_FILTERS = [
  { value: "", label: "Todos" },
  { value: "disponible", label: "Disponibles" },
  { value: "arrendada", label: "Arrendadas" },
  { value: "reservada", label: "Reservadas" },
];

function priceIcon(price: number | null, status: string, isSelected: boolean) {
  const color = STATUS_COLOR[status] ?? "var(--color-foreground)";
  const label = price ? `${Math.round(price / 1000)}K€` : "—";
  const html = `
    <div style="
      transform: translate(-50%, -100%);
      display: inline-flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
      pointer-events: auto;
    ">
      <div style="
        background: ${isSelected ? "var(--color-foreground)" : "white"};
        color: ${isSelected ? "white" : color};
        border: 1.5px solid ${color};
        border-radius: 999px;
        padding: 4px 10px;
        font-size: 11px;
        font-weight: 600;
        font-variant-numeric: tabular-nums;
        white-space: nowrap;
        box-shadow: 0 2px 8px rgba(0,0,0,0.12);
        font-family: 'Euclid Circular B', system-ui, sans-serif;
      ">${label}</div>
      <div style="
        width: 0;
        height: 0;
        border-left: 5px solid transparent;
        border-right: 5px solid transparent;
        border-top: 6px solid ${color};
      "></div>
    </div>
  `;
  return L.divIcon({
    html,
    className: "rsv-marker",
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
}

function FlyTo({ position }: { position: [number, number] | null }) {
  const map = useMap();
  if (position) {
    map.flyTo(position, 16, { duration: 0.6 });
  }
  return null;
}

export default function PropertyMap() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const { data, isLoading } = useMapProperties({ status: status || undefined });

  const filtered = useMemo(() => {
    if (!search.trim()) return data ?? [];
    const term = search.toLowerCase();
    return (data ?? []).filter(
      (p) =>
        p.title.toLowerCase().includes(term) ||
        p.address.toLowerCase().includes(term) ||
        p.code.toLowerCase().includes(term),
    );
  }, [data, search]);

  const selected = filtered.find((p) => p.id === selectedId) ?? null;

  return (
    <div className="grid h-[calc(100vh-4rem)] grid-cols-1 lg:grid-cols-[380px_1fr]">
      {/* Sidebar lista */}
      <aside className="flex h-full flex-col overflow-hidden border-r border-border bg-surface">
        <div className="space-y-3 border-b border-border-subtle p-4">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Mapa de propiedades</h1>
            <p className="mt-0.5 text-xs text-foreground-muted">
              {isLoading
                ? "Cargando..."
                : `${filtered.length} propiedad${filtered.length !== 1 ? "es" : ""} con ubicación`}
            </p>
          </div>
          <Input
            placeholder="Buscar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leading={<Icon icon={Search01Icon} size={15} />}
          />
          <div className="flex gap-1">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.value || "all"}
                onClick={() => setStatus(f.value)}
                className={cn(
                  "h-8 flex-1 rounded-full border px-3 text-xs font-medium transition-colors",
                  status === f.value
                    ? "border-accent bg-accent text-accent-foreground"
                    : "border-border bg-surface text-foreground-muted hover:bg-surface-muted",
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <ul className="flex-1 overflow-y-auto p-2">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <li key={i} className="mb-2 h-20 animate-pulse rounded-2xl bg-surface-muted/50" />
            ))
          ) : filtered.length === 0 ? (
            <li className="py-12 text-center text-sm text-foreground-muted">
              Sin resultados.
            </li>
          ) : (
            filtered.map((p) => (
              <li key={p.id} className="mb-2">
                <button
                  type="button"
                  onClick={() => setSelectedId(p.id)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-2xl border bg-surface p-2 text-left transition-colors",
                    selectedId === p.id
                      ? "border-foreground"
                      : "border-border hover:bg-surface-muted/50",
                  )}
                >
                  <span
                    className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl"
                    style={{ background: STATUS_COLOR[p.status] + "22" }}
                  >
                    {p.cover_image_url ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={p.cover_image_url}
                        alt={p.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Icon icon={PropertyNewIcon} size={18} className="text-foreground-muted" />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="truncate text-sm font-medium">{p.title}</span>
                      <span className="shrink-0 text-sm font-semibold tabular-numbers">
                        {p.price_rent ? formatCurrency(p.price_rent) : "—"}
                      </span>
                    </div>
                    <div className="truncate text-[11px] text-foreground-muted">
                      {p.address}
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-[10px] text-muted-foreground tabular-numbers">
                      <span>{p.bedrooms} hab</span>·<span>{p.area_sqm}m²</span>
                    </div>
                  </div>
                </button>
              </li>
            ))
          )}
        </ul>
      </aside>

      {/* Mapa */}
      <div className="relative h-full">
        <MapContainer
          center={VALENCIA_CENTER}
          zoom={14}
          minZoom={11}
          scrollWheelZoom
          className="h-full w-full"
          style={{ background: "var(--color-background)" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {filtered.map((p) => (
            <Marker
              key={p.id}
              position={[p.lat, p.lng]}
              icon={priceIcon(p.price_rent, p.status, selectedId === p.id)}
              eventHandlers={{
                click: () => setSelectedId(p.id),
              }}
            >
              <Popup closeButton={false} className="rsv-popup">
                <PopupContent property={p} />
              </Popup>
            </Marker>
          ))}

          <FlyTo position={selected ? [selected.lat, selected.lng] : null} />
        </MapContainer>

        {/* Card flotante derecha cuando hay selección */}
        {selected && (
          <div className="pointer-events-auto absolute right-4 top-4 z-[400] w-72">
            <Card className="overflow-hidden shadow-xl">
              <div className="aspect-[16/9] w-full bg-surface-muted">
                {selected.cover_image_url ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={selected.cover_image_url}
                    alt={selected.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-foreground-muted">
                    <Icon icon={PropertyNewIcon} size={32} />
                  </div>
                )}
              </div>
              <div className="space-y-2 p-4">
                <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  <span className="tabular-numbers">{selected.code}</span>·
                  <Badge
                    variant={
                      selected.status === "disponible"
                        ? "positive"
                        : selected.status === "arrendada"
                          ? "info"
                          : selected.status === "vendida"
                            ? "negative"
                            : selected.status === "reservada"
                              ? "warning"
                              : "neutral"
                    }
                    className="text-[10px]"
                  >
                    {selected.status}
                  </Badge>
                </div>
                <h3 className="font-semibold leading-tight">{selected.title}</h3>
                <div className="text-xs text-foreground-muted">{selected.address}</div>
                <div className="flex items-baseline justify-between border-t border-border-subtle pt-2">
                  <div className="text-lg font-semibold tabular-numbers">
                    {selected.price_rent ? formatCurrency(selected.price_rent) : "—"}
                    <span className="ml-1 text-[10px] font-normal text-muted-foreground">
                      /mes
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-foreground-muted tabular-numbers">
                    <span className="inline-flex items-center gap-0.5">
                      <Icon icon={BedSingle01Icon} size={11} />
                      {selected.bedrooms}
                    </span>
                    <span className="inline-flex items-center gap-0.5">
                      <Icon icon={Bathtub01Icon} size={11} />
                      {selected.bathrooms}
                    </span>
                    <span className="inline-flex items-center gap-0.5">
                      <Icon icon={RulerIcon} size={11} />
                      {selected.area_sqm}m²
                    </span>
                  </div>
                </div>
                <Link
                  href={`/propiedades/${selected.id}`}
                  className="block rounded-full bg-accent px-3 py-2 text-center text-xs font-semibold text-accent-foreground hover:bg-accent/90"
                >
                  Ver detalle
                </Link>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

function PopupContent({ property: p }: { property: MapProperty }) {
  return (
    <div className="text-xs" style={{ fontFamily: "Euclid Circular B, system-ui" }}>
      <div className="mb-1 font-semibold">{p.title}</div>
      <div className="mb-2 text-[11px] opacity-70">{p.address}</div>
      <div className="font-bold">
        {p.price_rent ? formatCurrency(p.price_rent) : "—"}/mes
      </div>
      <Link
        href={`/propiedades/${p.id}`}
        className="mt-2 inline-block text-[11px] font-medium underline"
      >
        Ver detalle →
      </Link>
    </div>
  );
}
