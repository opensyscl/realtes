"use client";

import Link from "next/link";
import {
  Home05Icon,
  KanbanIcon,
  WhatsappIcon,
  InstagramIcon,
  MessengerIcon,
  InvoiceIcon,
  ChartBarLineIcon,
  ChartLineData01Icon,
  Mail01Icon,
  QrCodeIcon,
  MegaphoneIcon,
  Camera01Icon,
  Location01Icon,
  FilePinIcon,
  Settings02Icon,
  LockKeyIcon,
  UserMultiple02Icon,
  CreditCardIcon,
  BellDotIcon,
  CheckmarkCircle02Icon,
  ArrowRight01Icon,
  ArrowUpRight01Icon,
  Building03Icon,
  Calendar03Icon,
  DollarCircleIcon,
} from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";

import { Icon } from "@/components/ui/icon";
import { LandingNavbar } from "@/components/landing/landing-navbar";
import { LandingCta } from "@/components/landing/landing-cta";
import { LandingFooter } from "@/components/landing/landing-footer";

export function FuncionalidadesClient() {
  return (
    <main className="min-h-screen text-[#1a1612]">
      <LandingNavbar />
      <FunctionsHero />
      <FeatureSection
        anchor="cartera"
        eyebrow="01 — Cartera"
        icon={Home05Icon}
        title={
          <>
            Tu cartera, perfectamente
            <br />
            <span className="italic text-[var(--gold)]">ordenada</span>.
          </>
        }
        body="Captación, ficha completa, fotos, documentos, mapa y publicación. Todo en un solo lugar, sin pestañas extras."
        bullets={[
          "Ficha con 50+ campos: interior, exterior, edificio, deudas",
          "Galería de fotos con cover automática y reorden drag & drop",
          "Tour 360° y vídeo embebido en cada propiedad",
          "Mapa con pins de precio y geolocalización",
          "Watermark automático con tu marca",
          "Estados: disponible · reservado · vendido · arrendado",
        ]}
        mock={<PropertyMock />}
      />
      <FeatureSection
        anchor="crm"
        eyebrow="02 — CRM"
        icon={KanbanIcon}
        title={
          <>
            Cada lead, un cierre
            <br />
            <span className="italic text-[var(--gold)]">potencial</span>.
          </>
        }
        body="Pipeline visual, actividades, recordatorios. Desde el primer contacto hasta la firma del contrato."
        bullets={[
          "Pipeline kanban configurable por proyecto",
          "Etapas a medida: prospecto → visita → oferta → cierre",
          "Actividades: llamadas, emails, reuniones, tareas",
          "Recordatorios automáticos antes de vencimientos",
          "Conversión 1-click de lead a contrato + cargo",
          "Tracking de origen para medir ROI por canal",
        ]}
        mock={<KanbanMock />}
        reverse
      />
      <FeatureSection
        anchor="captacion"
        eyebrow="03 — Captación multicanal"
        icon={WhatsappIcon}
        title={
          <>
            Tus leads ya están
            <br />
            en <span className="italic text-[var(--gold)]">redes</span>.
          </>
        }
        body="WhatsApp Business, Instagram y Messenger conectados a una bandeja unificada. Ningún mensaje se pierde."
        bullets={[
          "WhatsApp Business — leads directos a tu inbox",
          "Instagram DM — captación desde reels y stories",
          "Facebook Messenger — conversaciones desde tu fanpage",
          "Auto-asignación al agente correcto por reglas",
          "Plantillas y respuestas rápidas por canal",
          "Lead creado automáticamente en el CRM al primer mensaje",
        ]}
        mock={<ChannelsMock />}
      />
      <FeatureSection
        anchor="cobros"
        eyebrow="04 — Contratos & cobros"
        icon={InvoiceIcon}
        title={
          <>
            Cargos, pagos, comisiones —
            <br />
            sin <span className="italic text-[var(--gold)]">Excel</span>.
          </>
        }
        body="Generación automática de cargos mensuales, control de mora y splits de comisión multi-agente."
        bullets={[
          "Plantillas de contrato + generación PDF",
          "Cargos mensuales automáticos en el día que elijas",
          "Reajuste IPC/UF aplicado solo",
          "Control de mora con aging por antigüedad",
          "Conciliación de pagos uno-a-muchos",
          "Splits de comisión entre captador, vendedor y oficina",
        ]}
        mock={<ChargesMock />}
        reverse
      />
      <FeatureSection
        anchor="reportes"
        eyebrow="05 — Reportes"
        icon={ChartBarLineIcon}
        title={
          <>
            Decide con datos,
            <br />
            no con <span className="italic text-[var(--gold)]">sensaciones</span>.
          </>
        }
        body="Dashboards limpios: morosidad, aging, ingresos por propiedad, performance por agente. Siempre al día."
        bullets={[
          "Dashboard de operaciones en tiempo real",
          "Reporte financiero mensual por oficina",
          "Aging de cuentas por cobrar",
          "Ingresos por propiedad y por propietario",
          "Performance de agentes: conversión, tiempo de cierre",
          "Exportación a Excel y CSV",
        ]}
        mock={<ReportsMock />}
      />
      <MoreFeaturesGrid />
      <LandingCta />
      <LandingFooter />
    </main>
  );
}

/* ============ HERO ============ */

const NAV = [
  { href: "/funcionalidades/cartera", label: "Cartera" },
  { href: "/funcionalidades/crm", label: "CRM" },
  { href: "/funcionalidades/captacion", label: "Captación" },
  { href: "/funcionalidades/cobros", label: "Cobros" },
  { href: "/funcionalidades/reportes", label: "Reportes" },
];

function FunctionsHero() {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 text-center">
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(180deg, #f6f1e8 0%, #fbf7ef 50%, #f3ecdf 100%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          backgroundImage:
            "radial-gradient(45% 40% at 25% 25%, rgba(201,169,110,0.20), transparent 70%), radial-gradient(40% 40% at 80% 70%, rgba(201,169,110,0.16), transparent 70%)",
        }}
      />

      <div className="mx-auto max-w-[920px] px-6">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/55 px-3.5 py-1.5 text-[11px] font-medium text-[#1a1612]/80 shadow-[0_4px_16px_-6px_rgba(80,60,30,0.18)] backdrop-blur-xl">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--gold)] opacity-50" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--gold)]" />
          </span>
          Todas las funcionalidades
        </span>

        <h1 className="mt-7 font-serif text-[52px] font-medium leading-[1.02] tracking-[-0.02em] sm:text-[68px] lg:text-[78px]">
          Todo lo que tu corredora
          <br />
          necesita, <span className="italic text-[var(--gold)]">en un sitio</span>.
        </h1>

        <p className="mx-auto mt-6 max-w-xl text-[16px] leading-relaxed text-[#1a1612]/65">
          ERP, CRM, captación multicanal, contratos, comisiones, reportes y
          publicación a portales. Una sola plataforma, cero pestañas extras.
        </p>

        {/* Sub-nav */}
        <nav className="mt-10 inline-flex flex-wrap items-center justify-center gap-1 rounded-full border border-white/70 bg-white/55 p-1 shadow-[0_8px_28px_-12px_rgba(50,40,25,0.18)] backdrop-blur-xl">
          {NAV.map((n) => (
            <a
              key={n.href}
              href={n.href}
              className="rounded-full px-4 py-2 text-[13px] font-medium text-[#1a1612]/70 transition-colors hover:bg-white/70 hover:text-[#1a1612]"
            >
              {n.label}
            </a>
          ))}
        </nav>
      </div>
    </section>
  );
}

/* ============ FEATURE SECTION (alternada) ============ */

interface FeatureSectionProps {
  anchor: string;
  eyebrow: string;
  icon: IconSvgElement;
  title: React.ReactNode;
  body: string;
  bullets: string[];
  mock: React.ReactNode;
  reverse?: boolean;
}

function FeatureSection({
  anchor,
  eyebrow,
  icon,
  title,
  body,
  bullets,
  mock,
  reverse,
}: FeatureSectionProps) {
  return (
    <section
      id={anchor}
      className="relative scroll-mt-24 py-24 text-[#1a1612]"
    >
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(180deg, #f3ecdf 0%, #fbf6ec 50%, #f3ecdf 100%)",
        }}
      />

      <div className="mx-auto max-w-[1280px] px-6">
        <div
          className={`grid grid-cols-1 items-center gap-12 lg:gap-20 ${
            reverse ? "lg:grid-cols-[1.05fr_0.95fr]" : "lg:grid-cols-[0.95fr_1.05fr]"
          }`}
        >
          {/* Copy */}
          <div className={reverse ? "lg:order-2" : ""}>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/55 px-3 py-1 text-[11px] font-medium text-[#1a1612]/75 backdrop-blur-xl">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--gold)]/20 text-[#7a5b1f]">
                <Icon icon={icon} size={11} />
              </span>
              {eyebrow}
            </span>
            <h2 className="mt-5 font-serif text-[42px] font-medium leading-[1.05] tracking-[-0.02em] sm:text-[52px]">
              {title}
            </h2>
            <p className="mt-5 max-w-lg text-[16px] leading-relaxed text-[#1a1612]/65">
              {body}
            </p>
            <ul className="mt-7 space-y-2.5">
              {bullets.map((b) => (
                <li
                  key={b}
                  className="flex items-start gap-2.5 text-[14px] leading-relaxed text-[#1a1612]/85"
                >
                  <Icon
                    icon={CheckmarkCircle02Icon}
                    size={14}
                    className="mt-0.5 shrink-0 text-[var(--gold)]"
                  />
                  {b}
                </li>
              ))}
            </ul>
            <Link
              href={`/funcionalidades/${anchor}`}
              className="group mt-8 inline-flex items-center gap-2 rounded-full bg-[#1a1612] py-3 pl-5 pr-2 text-[13px] font-medium text-white shadow-[0_12px_30px_-10px_rgba(26,22,18,0.4)] transition-all hover:bg-black"
            >
              Ver detalle
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-[#1a1612] transition-transform group-hover:translate-x-0.5">
                <Icon icon={ArrowRight01Icon} size={11} />
              </span>
            </Link>
          </div>

          {/* Mock */}
          <div className={reverse ? "lg:order-1" : ""}>
            <div className="relative">{mock}</div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============ MOCKS ============ */

function MockShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-[28px] border border-white/70 bg-white/45 p-2 shadow-[0_30px_80px_-30px_rgba(80,60,30,0.3)] backdrop-blur-2xl">
      <div className="overflow-hidden rounded-[22px] bg-white/80">
        {children}
      </div>
    </div>
  );
}

function PropertyMock() {
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

function KanbanMock() {
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

function ChannelsMock() {
  const msgs = [
    {
      who: "Camila R.",
      img: 49,
      ago: "2m",
      text: "Hola, ¿el departamento sigue disponible?",
      icon: WhatsappIcon,
      iconBg: "bg-[#25D366]",
      tag: "WhatsApp",
    },
    {
      who: "Tomás I.",
      img: 14,
      ago: "9m",
      text: "Vi tu reel, me interesa la casa de Chicureo",
      icon: InstagramIcon,
      iconBg: "bg-[linear-gradient(135deg,#f58529,#dd2a7b,#8134af)]",
      tag: "Instagram",
    },
    {
      who: "Andrea S.",
      img: 44,
      ago: "22m",
      text: "Quería preguntar por el arriendo en Providencia",
      icon: MessengerIcon,
      iconBg: "bg-[linear-gradient(135deg,#00b2ff,#006aff)]",
      tag: "Messenger",
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

function ChargesMock() {
  const rows = [
    { name: "Marzo 2026 · Las Condes", amount: "$2.400.000", status: "Pagado", tone: "ok" },
    { name: "Marzo 2026 · Providencia", amount: "$1.450.000", status: "Pagado", tone: "ok" },
    { name: "Marzo 2026 · Reñaca", amount: "$1.890.000", status: "Pendiente", tone: "warn" },
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
          <li key={r.name} className="flex items-center justify-between gap-3 px-5 py-3">
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

function ReportsMock() {
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

/* ============ MORE GRID ============ */

const MORE: { icon: IconSvgElement; title: string; text: string }[] = [
  {
    icon: MegaphoneIcon,
    title: "Escaparate público",
    text: "Tu sitio web inmobiliario bajo tu marca, sin tocar código.",
  },
  {
    icon: QrCodeIcon,
    title: "QR para folletería",
    text: "Genera QR de cada propiedad para vitrinas y folletos.",
  },
  {
    icon: Camera01Icon,
    title: "Watermark automático",
    text: "Marca de agua en cada foto subida, configurable.",
  },
  {
    icon: Mail01Icon,
    title: "Email automatizado",
    text: "Plantillas para visitas, ofertas, recordatorios y más.",
  },
  {
    icon: BellDotIcon,
    title: "Notificaciones",
    text: "In-app y por email. Cada agente, lo que le importa.",
  },
  {
    icon: FilePinIcon,
    title: "Documentos por contrato",
    text: "Subida de PDFs, contratos firmados y comprobantes.",
  },
  {
    icon: UserMultiple02Icon,
    title: "Roles y permisos",
    text: "Cada agente ve solo lo suyo. Multi-oficina y multi-marca.",
  },
  {
    icon: LockKeyIcon,
    title: "2FA y auditoría",
    text: "Acceso seguro y trazabilidad de cada acción.",
  },
  {
    icon: Settings02Icon,
    title: "Personal Access Tokens",
    text: "API keys para integrar con tus herramientas externas.",
  },
  {
    icon: CreditCardIcon,
    title: "Pagos por transferencia",
    text: "Registra pagos parciales y conciliación uno-a-muchos.",
  },
  {
    icon: Calendar03Icon,
    title: "Calendario de visitas",
    text: "Agenda visitas con leads y compártelas con el equipo.",
  },
  {
    icon: Building03Icon,
    title: "Mantenciones",
    text: "Tickets de mantención por propiedad con costos y fotos.",
  },
];

function MoreFeaturesGrid() {
  return (
    <section className="relative py-28 text-[#1a1612]">
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(180deg, #f3ecdf 0%, #faf4e8 50%, #f3ecdf 100%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          backgroundImage:
            "radial-gradient(50% 40% at 50% 30%, rgba(201,169,110,0.16), transparent 70%)",
        }}
      />

      <div className="mx-auto max-w-[1280px] px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/55 px-3 py-1 text-[11px] font-medium text-[#1a1612]/75 backdrop-blur-xl">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--gold)]" />
            Y mucho más
          </span>
          <h2 className="mt-5 font-serif text-[42px] font-medium leading-[1.05] tracking-[-0.02em] sm:text-[52px]">
            12 herramientas más que
            <br />
            <span className="italic text-[var(--gold)]">marcan diferencia</span>.
          </h2>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {MORE.map((m) => (
            <div
              key={m.title}
              className="rounded-3xl border border-white/70 bg-white/45 p-5 shadow-[0_12px_40px_-20px_rgba(80,60,30,0.15)] backdrop-blur-2xl transition-all hover:bg-white/65"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/70 bg-white/70 text-[var(--gold)] backdrop-blur-xl">
                <Icon icon={m.icon} size={17} />
              </span>
              <div className="mt-5 text-[15px] font-semibold leading-tight tracking-tight text-[#1a1612]">
                {m.title}
              </div>
              <p className="mt-2 text-[13px] leading-relaxed text-[#1a1612]/60">
                {m.text}
              </p>
            </div>
          ))}
        </div>

        {/* Quick links to plans */}
        <div className="mt-14 flex flex-col items-center justify-center gap-4 rounded-[28px] border border-white/70 bg-white/45 p-7 shadow-[0_20px_60px_-25px_rgba(80,60,30,0.18)] backdrop-blur-2xl sm:flex-row sm:gap-6">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--gold)]/20 text-[#7a5b1f]">
              <Icon icon={DollarCircleIcon} size={18} />
            </span>
            <div>
              <div className="text-[14px] font-semibold text-[#1a1612]">
                ¿Cuál plan tiene qué?
              </div>
              <div className="text-[12.5px] text-[#1a1612]/55">
                Compara las funcionalidades por plan en detalle.
              </div>
            </div>
          </div>
          <Link
            href="/planes"
            className="group inline-flex items-center gap-2 rounded-full bg-[#1a1612] py-3 pl-5 pr-2 text-[13px] font-medium text-white shadow-[0_10px_28px_-10px_rgba(26,22,18,0.4)] hover:bg-black sm:ml-auto"
          >
            Ver planes y precios
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-[#1a1612] transition-transform group-hover:translate-x-0.5">
              <Icon icon={ArrowRight01Icon} size={11} />
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
