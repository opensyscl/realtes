"use client";

import {
  WhatsappIcon,
  InstagramIcon,
  MessengerIcon,
  ArrowRight01Icon,
  CheckmarkCircle02Icon,
} from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";

import { Icon } from "@/components/ui/icon";

interface Channel {
  name: string;
  icon: IconSvgElement;
  iconBg: string;
  leads: string;
  preview: { author: string; avatar: string; text: string; ago: string };
}

const CHANNELS: Channel[] = [
  {
    name: "WhatsApp Business",
    icon: WhatsappIcon,
    iconBg:
      "bg-[#25D366] text-white shadow-[0_8px_20px_-6px_rgba(37,211,102,0.55)]",
    leads: "+128 leads / mes",
    preview: {
      author: "Camila Reyes",
      avatar: "https://i.pravatar.cc/72?img=49",
      text: "Hola, quiero coordinar una visita para el departamento de Las Condes",
      ago: "hace 2 min",
    },
  },
  {
    name: "Instagram DM",
    icon: InstagramIcon,
    iconBg:
      "bg-[linear-gradient(135deg,#f58529_0%,#dd2a7b_45%,#8134af_85%)] text-white shadow-[0_8px_20px_-6px_rgba(221,42,123,0.5)]",
    leads: "+87 leads / mes",
    preview: {
      author: "Tomás Ibáñez",
      avatar: "https://i.pravatar.cc/72?img=14",
      text: "Vi tu reel de la casa en Chicureo, ¿sigue disponible?",
      ago: "hace 9 min",
    },
  },
  {
    name: "Facebook Messenger",
    icon: MessengerIcon,
    iconBg:
      "bg-[linear-gradient(135deg,#00b2ff_0%,#006aff_100%)] text-white shadow-[0_8px_20px_-6px_rgba(0,106,255,0.5)]",
    leads: "+54 leads / mes",
    preview: {
      author: "Andrea Soto",
      avatar: "https://i.pravatar.cc/72?img=44",
      text: "Quería preguntar por el arriendo en Providencia",
      ago: "hace 22 min",
    },
  },
];

export function LandingChannels() {
  return (
    <section
      id="canales"
      className="relative py-28 text-[#1a1612]"
    >
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(180deg, #fbf6ec 0%, #f4ecdc 100%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          backgroundImage:
            "radial-gradient(45% 45% at 80% 25%, rgba(37,211,102,0.10), transparent 70%), radial-gradient(40% 45% at 15% 75%, rgba(221,42,123,0.10), transparent 70%), radial-gradient(35% 35% at 50% 50%, rgba(0,106,255,0.08), transparent 70%)",
        }}
      />

      <div className="mx-auto max-w-[1280px] px-6">
        <div className="grid grid-cols-1 items-start gap-14 lg:grid-cols-[1fr_1.05fr]">
          <CopyColumn />
          <InboxMock />
        </div>
      </div>
    </section>
  );
}

function CopyColumn() {
  return (
    <div className="max-w-xl">
      <span className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/55 px-3 py-1 text-[11px] font-medium text-[#1a1612]/75 backdrop-blur-xl">
        <span className="h-1.5 w-1.5 rounded-full bg-[var(--gold)]" />
        Captación multicanal
      </span>

      <h2 className="mt-5 font-serif text-[42px] font-medium leading-[1.05] tracking-[-0.02em] sm:text-[52px]">
        Tus leads ya están
        <br />
        en <span className="italic text-[var(--gold)]">redes</span>.
      </h2>

      <p className="mt-6 text-[16px] leading-relaxed text-[#1a1612]/65">
        WhatsApp, Instagram y Messenger conectados a una sola bandeja. Ningún
        mensaje se pierde, ningún lead se enfría.
      </p>

      <div className="mt-8 space-y-3">
        {CHANNELS.map((c) => (
          <ChannelRow key={c.name} channel={c} />
        ))}
      </div>

      <ul className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-[12.5px] text-[#1a1612]/70">
        {[
          "Auto-asignación al agente",
          "Plantillas y respuestas rápidas",
          "Lead creado automáticamente",
        ].map((t) => (
          <li key={t} className="flex items-center gap-1.5">
            <Icon
              icon={CheckmarkCircle02Icon}
              size={13}
              className="text-[var(--gold)]"
            />
            {t}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ChannelRow({ channel }: { channel: Channel }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-white/70 bg-white/55 p-3 shadow-[0_10px_30px_-15px_rgba(80,60,30,0.18)] backdrop-blur-2xl">
      <span
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${channel.iconBg}`}
      >
        <Icon icon={channel.icon} size={20} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-[14px] font-semibold text-[#1a1612]">
          {channel.name}
        </div>
        <div className="text-[12px] text-[#1a1612]/55">{channel.leads}</div>
      </div>
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/60 text-[#1a1612]/65 backdrop-blur-xl">
        <Icon icon={ArrowRight01Icon} size={12} />
      </span>
    </div>
  );
}

function InboxMock() {
  return (
    <div className="relative">
      <div className="rounded-[28px] border border-white/70 bg-white/55 p-2 shadow-[0_30px_80px_-30px_rgba(80,60,30,0.3)] backdrop-blur-2xl">
        <div className="overflow-hidden rounded-[22px] bg-white/80">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#1a1612]/[0.06] px-5 py-4">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#1a1612] text-white">
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 12h-6l-2 3h-4l-2-3H2" />
                  <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11Z" />
                </svg>
              </span>
              <div>
                <div className="text-[13px] font-semibold leading-tight text-[#1a1612]">
                  Bandeja unificada
                </div>
                <div className="text-[11px] text-[#1a1612]/55">
                  269 conversaciones · 12 sin leer
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                Live
              </span>
            </div>
          </div>

          {/* Conversations */}
          <ul className="divide-y divide-[#1a1612]/[0.06]">
            {CHANNELS.map((c, i) => (
              <li
                key={c.name}
                className={`flex items-start gap-3 px-5 py-4 transition-colors hover:bg-[#1a1612]/[0.025] ${
                  i === 0 ? "bg-[var(--gold)]/[0.06]" : ""
                }`}
              >
                <div className="relative">
                  <span className="block h-10 w-10 overflow-hidden rounded-full">
                    <img
                      src={c.preview.avatar}
                      alt={c.preview.author}
                      className="h-full w-full object-cover"
                    />
                  </span>
                  <span
                    className={`absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full ring-2 ring-white ${c.iconBg}`}
                  >
                    <Icon icon={c.icon} size={9} />
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-[13px] font-semibold text-[#1a1612]">
                      {c.preview.author}
                    </span>
                    <span className="shrink-0 text-[10.5px] text-[#1a1612]/50">
                      {c.preview.ago}
                    </span>
                  </div>
                  <p className="mt-0.5 line-clamp-2 text-[12.5px] leading-snug text-[#1a1612]/65">
                    {c.preview.text}
                  </p>
                  <div className="mt-1.5 flex items-center gap-2">
                    <span className="rounded-full border border-[#1a1612]/[0.08] bg-white/60 px-2 py-0.5 text-[10px] text-[#1a1612]/65">
                      Asignado: María P.
                    </span>
                    {i === 0 && (
                      <span className="rounded-full bg-[var(--gold)]/15 px-2 py-0.5 text-[10px] font-medium text-[#7a5b1f]">
                        Nuevo lead
                      </span>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-[#1a1612]/[0.06] bg-[#1a1612]/[0.015] px-5 py-3 text-[11.5px] text-[#1a1612]/60">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Sincronizado en tiempo real
            </span>
            <span>3 sin asignar</span>
          </div>
        </div>
      </div>

      {/* Floating notif */}
      <div className="absolute -right-3 -top-3 hidden items-center gap-2 rounded-full border border-white/70 bg-white/80 py-1.5 pl-1.5 pr-3 text-[11.5px] font-medium text-[#1a1612] shadow-[0_10px_28px_-10px_rgba(50,40,25,0.25)] backdrop-blur-xl sm:flex">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#25D366] text-white">
          <Icon icon={WhatsappIcon} size={11} />
        </span>
        Nuevo mensaje
      </div>
    </div>
  );
}
