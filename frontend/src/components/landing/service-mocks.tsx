"use client";

import {
  Location01Icon,
  WhatsappIcon,
  InstagramIcon,
  MessengerIcon,
} from "@hugeicons/core-free-icons";

import { Icon } from "@/components/ui/icon";

export function MockShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-[28px] border border-white/70 bg-white/45 p-2 shadow-[0_30px_80px_-30px_rgba(80,60,30,0.3)] backdrop-blur-2xl">
      <div className="overflow-hidden rounded-[22px] bg-white/80">
        {children}
      </div>
    </div>
  );
}

export function PropertyMock() {
  return (
    <MockShell>
      <div className="relative">
        <img
          src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=900&q=85&auto=format&fit=crop"
          alt=""
          className="h-[260px] w-full object-cover"
        />
        <div className="absolute inset-x-3 top-3 flex items-start justify-between">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/40 bg-black/40 px-3 py-1 text-[11px] font-medium text-white backdrop-blur-md">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Disponible
          </span>
          <span className="rounded-full border border-white/70 bg-white/95 px-3 py-1 text-[12px] font-semibold text-[#1a1612] backdrop-blur-md">
            UF 35.000
          </span>
        </div>
      </div>
      <div className="space-y-4 p-5">
        <div>
          <div className="font-serif text-[20px] font-medium tracking-tight text-[#1a1612]">
            Villa Mirador
          </div>
          <div className="mt-1 inline-flex items-center gap-1.5 text-[12px] text-[#1a1612]/55">
            <Icon icon={Location01Icon} size={11} />
            Concón, Viña del Mar
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            ["4", "Hab."],
            ["3", "Baños"],
            ["285", "m²"],
          ].map(([v, l]) => (
            <div
              key={l}
              className="rounded-xl border border-[#1a1612]/[0.08] bg-white/60 px-3 py-2 backdrop-blur-xl"
            >
              <div className="font-serif text-[16px] font-semibold tabular-numbers text-[#1a1612]">
                {v}
              </div>
              <div className="text-[10px] uppercase tracking-[0.1em] text-[#1a1612]/50">
                {l}
              </div>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {["Vista al mar", "Piscina", "Tour 360°", "Quincho"].map((t) => (
            <span
              key={t}
              className="rounded-full border border-[#1a1612]/[0.08] bg-white/60 px-2.5 py-1 text-[11px] text-[#1a1612]/70 backdrop-blur-xl"
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    </MockShell>
  );
}

export function KanbanMock() {
  const cols = [
    { name: "Prospecto", color: "bg-sky-500", count: 12 },
    { name: "Visita", color: "bg-amber-500", count: 7 },
    { name: "Oferta", color: "bg-violet-500", count: 4 },
  ];
  const cards = [
    { who: "Camila R.", note: "Depto Las Condes", img: 49, tone: 0 },
    { who: "Tomás I.", note: "Casa Chicureo", img: 14, tone: 1 },
    { who: "Andrea S.", note: "Loft Providencia", img: 44, tone: 2 },
    { who: "Felipe B.", note: "Casa Vitacura", img: 8, tone: 0 },
    { who: "Daniela M.", note: "Depto Ñuñoa", img: 36, tone: 1 },
    { who: "Rodrigo V.", note: "Penthouse Reñaca", img: 55, tone: 2 },
  ];
  return (
    <MockShell>
      <div className="border-b border-[#1a1612]/[0.06] px-5 py-3 text-[12px] font-semibold text-[#1a1612]">
        Pipeline · Q2 2026
      </div>
      <div className="grid grid-cols-3 gap-2 p-3">
        {cols.map((c, i) => (
          <div
            key={c.name}
            className="rounded-2xl border border-[#1a1612]/[0.06] bg-white/40 p-2 backdrop-blur-xl"
          >
            <div className="mb-2 flex items-center justify-between px-1.5">
              <div className="flex items-center gap-1.5">
                <span className={`h-1.5 w-1.5 rounded-full ${c.color}`} />
                <span className="text-[11px] font-semibold text-[#1a1612]">
                  {c.name}
                </span>
              </div>
              <span className="text-[10px] tabular-numbers text-[#1a1612]/50">
                {c.count}
              </span>
            </div>
            <div className="space-y-1.5">
              {cards
                .filter((card) => card.tone === i)
                .map((card) => (
                  <div
                    key={card.who}
                    className="rounded-xl border border-white/70 bg-white/85 p-2 shadow-[0_4px_12px_-4px_rgba(80,60,30,0.15)] backdrop-blur-xl"
                  >
                    <div className="flex items-center gap-1.5">
                      <img
                        src={`https://i.pravatar.cc/48?img=${card.img}`}
                        alt=""
                        className="h-5 w-5 rounded-full object-cover"
                      />
                      <span className="text-[10.5px] font-semibold text-[#1a1612]">
                        {card.who}
                      </span>
                    </div>
                    <div className="mt-1 truncate text-[10px] text-[#1a1612]/55">
                      {card.note}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </MockShell>
  );
}

export function ChannelsMock() {
  const msgs = [
    {
      who: "Camila R.",
      img: 49,
      ago: "2m",
      text: "Hola, ¿el departamento sigue disponible?",
      icon: WhatsappIcon,
      iconBg: "bg-[#25D366]",
    },
    {
      who: "Tomás I.",
      img: 14,
      ago: "9m",
      text: "Vi tu reel, me interesa la casa de Chicureo",
      icon: InstagramIcon,
      iconBg: "bg-[linear-gradient(135deg,#f58529,#dd2a7b,#8134af)]",
    },
    {
      who: "Andrea S.",
      img: 44,
      ago: "22m",
      text: "Quería preguntar por el arriendo en Providencia",
      icon: MessengerIcon,
      iconBg: "bg-[linear-gradient(135deg,#00b2ff,#006aff)]",
    },
  ];
  return (
    <MockShell>
      <div className="flex items-center justify-between border-b border-[#1a1612]/[0.06] px-5 py-3">
        <div className="text-[12px] font-semibold text-[#1a1612]">
          Bandeja unificada
        </div>
        <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
          Live
        </span>
      </div>
      <ul className="divide-y divide-[#1a1612]/[0.06]">
        {msgs.map((m, i) => (
          <li
            key={m.who}
            className={`flex items-start gap-3 px-5 py-3.5 ${
              i === 0 ? "bg-[var(--gold)]/[0.06]" : ""
            }`}
          >
            <div className="relative">
              <img
                src={`https://i.pravatar.cc/64?img=${m.img}`}
                alt=""
                className="h-9 w-9 rounded-full object-cover"
              />
              <span
                className={`absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full text-white ring-2 ring-white ${m.iconBg}`}
              >
                <Icon icon={m.icon} size={9} />
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[13px] font-semibold text-[#1a1612]">
                  {m.who}
                </span>
                <span className="text-[10.5px] text-[#1a1612]/50">{m.ago}</span>
              </div>
              <p className="mt-0.5 line-clamp-1 text-[12px] text-[#1a1612]/65">
                {m.text}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </MockShell>
  );
}

export function ChargesMock() {
  const rows = [
    { name: "Marzo · Las Condes", amount: "$2.400.000", status: "Pagado", tone: "ok" },
    { name: "Marzo · Providencia", amount: "$1.450.000", status: "Pagado", tone: "ok" },
    { name: "Marzo · Reñaca", amount: "$1.890.000", status: "Pendiente", tone: "warn" },
    { name: "Febrero · Las Condes", amount: "$2.400.000", status: "Atrasado", tone: "bad" },
  ];
  return (
    <MockShell>
      <div className="flex items-center justify-between border-b border-[#1a1612]/[0.06] px-5 py-3">
        <div className="text-[12px] font-semibold text-[#1a1612]">
          Cargos · Marzo 2026
        </div>
        <span className="rounded-full bg-[var(--gold)]/15 px-2 py-0.5 text-[10px] font-semibold text-[#7a5b1f]">
          Auto-generados
        </span>
      </div>
      <ul className="divide-y divide-[#1a1612]/[0.06] text-[12.5px]">
        {rows.map((r) => (
          <li
            key={r.name}
            className="flex items-center justify-between gap-3 px-5 py-3"
          >
            <span className="truncate text-[#1a1612]">{r.name}</span>
            <div className="flex items-center gap-3">
              <span className="font-semibold tabular-numbers text-[#1a1612]">
                {r.amount}
              </span>
              <span
                className={`rounded-full px-2 py-0.5 text-[10.5px] font-semibold ${
                  r.tone === "ok"
                    ? "bg-emerald-500/15 text-emerald-700"
                    : r.tone === "warn"
                      ? "bg-amber-500/15 text-amber-700"
                      : "bg-rose-500/15 text-rose-700"
                }`}
              >
                {r.status}
              </span>
            </div>
          </li>
        ))}
      </ul>
      <div className="flex items-center justify-between border-t border-[#1a1612]/[0.06] bg-[#1a1612]/[0.015] px-5 py-3 text-[12px]">
        <span className="text-[#1a1612]/60">Total cobrado · Marzo</span>
        <span className="font-serif text-[18px] font-semibold tabular-numbers text-[#1a1612]">
          $5.740.000
        </span>
      </div>
    </MockShell>
  );
}

export function ReportsMock() {
  const months = ["Oct", "Nov", "Dic", "Ene", "Feb", "Mar"];
  const heights = [42, 58, 70, 64, 82, 95];
  return (
    <MockShell>
      <div className="flex items-center justify-between border-b border-[#1a1612]/[0.06] px-5 py-3">
        <div className="text-[12px] font-semibold text-[#1a1612]">
          Ingresos por mes
        </div>
        <span className="text-[10.5px] text-[#1a1612]/50">Últimos 6 meses</span>
      </div>
      <div className="px-5 pb-5 pt-4">
        <div className="flex items-baseline gap-2">
          <span className="font-serif text-[32px] font-semibold leading-none tabular-numbers text-[#1a1612]">
            UF 3.250
          </span>
          <span className="text-[11px] font-semibold text-emerald-600">
            +34% vs mes pasado
          </span>
        </div>
        <div className="mt-5 flex h-[120px] items-end gap-2">
          {heights.map((h, i) => (
            <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
              <div
                className={`w-full rounded-t-md ${
                  i === heights.length - 1
                    ? "bg-[var(--gold)]"
                    : "bg-[#1a1612]/15"
                }`}
                style={{ height: `${h}%` }}
              />
              <span className="text-[9.5px] text-[#1a1612]/45">
                {months[i]}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-3 divide-x divide-[#1a1612]/[0.06] border-t border-[#1a1612]/[0.06] bg-[#1a1612]/[0.015] text-center">
        {[
          ["UF 12.4k", "Acumulado"],
          ["48", "Operaciones"],
          ["2.1%", "Mora"],
        ].map(([v, l]) => (
          <div key={l} className="px-3 py-2.5">
            <div className="font-serif text-[14px] font-semibold tabular-numbers text-[#1a1612]">
              {v}
            </div>
            <div className="text-[9.5px] uppercase tracking-[0.1em] text-[#1a1612]/50">
              {l}
            </div>
          </div>
        ))}
      </div>
    </MockShell>
  );
}
