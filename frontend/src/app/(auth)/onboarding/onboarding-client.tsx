"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight01Icon,
  ArrowLeft01Icon,
  CheckmarkCircle02Icon,
  Building03Icon,
  CallIcon,
  Location01Icon,
  Home05Icon,
  KanbanIcon,
  WhatsappIcon,
  ChartBarLineIcon,
  GiftIcon,
  AlertCircleIcon,
} from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";

import { Icon } from "@/components/ui/icon";
import { RealtesLogo } from "@/components/landing/realtes-logo";
import {
  useAgencySettings,
  useUpdateAgencySettings,
  useCompleteOnboarding,
  useSaveProperty,
} from "@/lib/queries";
import { useAuthStore } from "@/store/auth";

const STEPS = [
  { num: 1, label: "Bienvenida" },
  { num: 2, label: "Tu corredora" },
  { num: 3, label: "Primera propiedad" },
  { num: 4, label: "Listo" },
];

export function OnboardingClient() {
  const router = useRouter();
  const isAuthed = useAuthStore((s) => !!s.token);
  const [step, setStep] = useState(1);

  // Auth guard simple
  useEffect(() => {
    if (!isAuthed) router.push("/login");
  }, [isAuthed, router]);

  return (
    <main className="relative min-h-screen overflow-hidden text-[#1a1612]">
      <PageBackground />

      <div className="mx-auto flex min-h-screen max-w-[640px] flex-col px-6 py-10">
        <header className="flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-1.5">
            <RealtesLogo variant="full" className="h-7" />
            <span className="text-[var(--gold)]">*</span>
          </Link>
          <Link
            href="/dashboard"
            className="text-[12.5px] font-medium text-[#1a1612]/55 underline-offset-2 hover:text-[#1a1612] hover:underline"
          >
            Saltar todo
          </Link>
        </header>

        <Stepper current={step} />

        <div className="my-auto flex flex-col py-8">
          {step === 1 && <StepWelcome onNext={() => setStep(2)} />}
          {step === 2 && (
            <StepAgency
              onNext={() => setStep(3)}
              onBack={() => setStep(1)}
              onSkip={() => setStep(3)}
            />
          )}
          {step === 3 && (
            <StepProperty
              onNext={() => setStep(4)}
              onBack={() => setStep(2)}
              onSkip={() => setStep(4)}
            />
          )}
          {step === 4 && <StepDone />}
        </div>
      </div>
    </main>
  );
}

/* ============ Stepper ============ */

function Stepper({ current }: { current: number }) {
  const total = STEPS.length;
  return (
    <div className="mt-10">
      <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.18em] text-[#1a1612]/55">
        <span>
          Paso {current} de {total}
        </span>
        <span>{STEPS[current - 1]?.label}</span>
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/55 backdrop-blur-xl">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[var(--gold)] to-[#7a5b1f] transition-[width] duration-500"
          style={{ width: `${(current / total) * 100}%` }}
        />
      </div>
    </div>
  );
}

/* ============ Step 1 — Welcome ============ */

function StepWelcome({ onNext }: { onNext: () => void }) {
  const user = useAuthStore((s) => s.user);
  const benefits = [
    { icon: Home05Icon, title: "Cartera ordenada", text: "Fichas, fotos, mapa, estados." },
    { icon: KanbanIcon, title: "CRM kanban", text: "Pipeline visual de leads." },
    { icon: WhatsappIcon, title: "Captación multicanal", text: "WhatsApp, Instagram, Messenger." },
    { icon: ChartBarLineIcon, title: "Reportes", text: "KPIs en tiempo real." },
  ];

  return (
    <div>
      <span className="inline-flex w-fit items-center gap-2 rounded-full border border-[var(--gold)]/40 bg-[var(--gold)]/15 px-3 py-1 text-[11px] font-medium text-[#7a5b1f] backdrop-blur-xl">
        <Icon icon={GiftIcon} size={11} />
        Plan Starter activado · gratis para siempre
      </span>

      <h1 className="mt-6 font-serif text-[44px] font-medium leading-[1.05] tracking-[-0.02em] sm:text-[52px]">
        Bienvenido, {user?.name?.split(" ")[0] ?? "amigo"}
        <br />
        a <span className="italic text-[var(--gold)]">Realtes</span>.
      </h1>
      <p className="mt-4 text-[15px] leading-relaxed text-[#1a1612]/65">
        Tu corredora ya está creada. Configurémosla en 3 pasos cortos para
        que empieces a operar de inmediato.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {benefits.map((b) => (
          <div
            key={b.title}
            className="flex items-start gap-3 rounded-2xl border border-white/70 bg-white/45 p-4 backdrop-blur-2xl"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/70 bg-white/70 text-[var(--gold)]">
              <Icon icon={b.icon} size={15} />
            </span>
            <div>
              <div className="text-[13.5px] font-semibold text-[#1a1612]">
                {b.title}
              </div>
              <div className="text-[12px] text-[#1a1612]/55">{b.text}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex items-center gap-3">
        <button
          type="button"
          onClick={onNext}
          className="group inline-flex items-center gap-2 rounded-full bg-[#1a1612] py-3.5 pl-6 pr-2 text-[14px] font-medium text-white shadow-[0_14px_34px_-12px_rgba(26,22,18,0.45)] hover:bg-black"
        >
          Empezar
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#1a1612] transition-transform group-hover:translate-x-0.5">
            <Icon icon={ArrowRight01Icon} size={13} />
          </span>
        </button>
        <Link
          href="/dashboard"
          className="text-[13px] font-medium text-[#1a1612]/55 underline-offset-2 hover:text-[#1a1612] hover:underline"
        >
          Ya quiero ver el dashboard
        </Link>
      </div>
    </div>
  );
}

/* ============ Step 2 — Agency details ============ */

function StepAgency({
  onNext,
  onBack,
  onSkip,
}: {
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}) {
  const { data: agency } = useAgencySettings();
  const update = useUpdateAgencySettings();

  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (agency) {
      setPhone(agency.phone ?? "");
      setCity(agency.city ?? "");
      setAddress(agency.address ?? "");
    }
  }, [agency]);

  const submit = async () => {
    setError(null);
    try {
      await update.mutateAsync({
        phone: phone || null,
        city: city || null,
        address: address || null,
        country: "CL",
        currency: "CLP",
        locale: "es-CL",
      });
      onNext();
    } catch {
      setError("No pudimos guardar los datos. Intenta de nuevo.");
    }
  };

  return (
    <div>
      <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/70 bg-white/55 px-3 py-1 text-[11px] font-medium text-[#1a1612]/75 backdrop-blur-xl">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--gold)]/20 text-[#7a5b1f]">
          <Icon icon={Building03Icon} size={11} />
        </span>
        Tu corredora
      </span>

      <h2 className="mt-5 font-serif text-[40px] font-medium leading-[1.05] tracking-[-0.02em] sm:text-[48px]">
        Cuéntanos de
        <br />
        <span className="italic text-[var(--gold)]">{agency?.name ?? "tu corredora"}</span>.
      </h2>
      <p className="mt-4 text-[15px] leading-relaxed text-[#1a1612]/65">
        Datos básicos para que aparezcan en tu escaparate público y en tus
        contratos.
      </p>

      <div className="mt-8 rounded-[28px] border border-white/70 bg-white/45 p-6 shadow-[0_30px_80px_-30px_rgba(80,60,30,0.25)] backdrop-blur-2xl">
        <div className="flex flex-col gap-4">
          <Field label="Teléfono">
            <GlassInput
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+56 9 XXXX XXXX"
              leading={<Icon icon={CallIcon} size={15} />}
            />
          </Field>

          <Field label="Ciudad">
            <GlassInput
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Santiago, Viña del Mar, Concón…"
              leading={<Icon icon={Location01Icon} size={15} />}
            />
          </Field>

          <Field label="Dirección" hint="Opcional — solo aparece si la añades">
            <GlassInput
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Av. Apoquindo 4501, Las Condes"
              leading={<Icon icon={Building03Icon} size={15} />}
            />
          </Field>
        </div>

        {error && (
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-rose-300/50 bg-rose-50/70 px-3 py-2 text-[12.5px] text-rose-800">
            <Icon icon={AlertCircleIcon} size={13} className="mt-0.5" />
            {error}
          </div>
        )}
      </div>

      <FooterButtons
        onBack={onBack}
        onSkip={onSkip}
        primaryLabel={update.isPending ? "Guardando…" : "Continuar"}
        primaryDisabled={update.isPending}
        onPrimary={submit}
      />
    </div>
  );
}

/* ============ Step 3 — First property ============ */

function StepProperty({
  onNext,
  onBack,
  onSkip,
}: {
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}) {
  const create = useSaveProperty();

  const [title, setTitle] = useState("");
  const [type, setType] = useState<
    "apartamento" | "casa" | "oficina" | "local"
  >("apartamento");
  const [bedrooms, setBedrooms] = useState("");
  const [area, setArea] = useState("");
  const [price, setPrice] = useState("");
  const [listing, setListing] = useState<"venta" | "alquiler">("venta");
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setError(null);
    if (!title.trim()) {
      setError("Pon un título a la propiedad.");
      return;
    }
    try {
      await create.mutateAsync({
        title: title.trim(),
        type,
        listing_type: listing,
        bedrooms: bedrooms ? Number(bedrooms) : undefined,
        area_sqm: area ? Number(area) : undefined,
        price_sale: listing === "venta" && price ? Number(price) : undefined,
        price_rent: listing === "alquiler" && price ? Number(price) : undefined,
        status: "disponible",
      });
      onNext();
    } catch {
      setError("No pudimos crear la propiedad. Intenta de nuevo.");
    }
  };

  return (
    <div>
      <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/70 bg-white/55 px-3 py-1 text-[11px] font-medium text-[#1a1612]/75 backdrop-blur-xl">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--gold)]/20 text-[#7a5b1f]">
          <Icon icon={Home05Icon} size={11} />
        </span>
        Tu primera propiedad
      </span>

      <h2 className="mt-5 font-serif text-[40px] font-medium leading-[1.05] tracking-[-0.02em] sm:text-[48px]">
        Crea tu primera
        <br />
        <span className="italic text-[var(--gold)]">ficha</span>.
      </h2>
      <p className="mt-4 text-[15px] leading-relaxed text-[#1a1612]/65">
        Sólo lo básico — después podrás añadir fotos, documentos, tour 360 y
        más desde el dashboard.
      </p>

      <div className="mt-8 rounded-[28px] border border-white/70 bg-white/45 p-6 shadow-[0_30px_80px_-30px_rgba(80,60,30,0.25)] backdrop-blur-2xl">
        <div className="flex flex-col gap-4">
          <Field label="Título *">
            <GlassInput
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Departamento amoblado en Las Condes"
              autoFocus
            />
          </Field>

          <Field label="Operación">
            <div className="inline-flex items-center gap-1 rounded-full border border-white/70 bg-white/55 p-1 backdrop-blur-xl">
              {(["venta", "alquiler"] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setListing(v)}
                  className={`rounded-full px-4 py-1.5 text-[12.5px] font-medium capitalize transition-all ${
                    listing === v
                      ? "bg-[#1a1612] text-white"
                      : "text-[#1a1612]/65 hover:text-[#1a1612]"
                  }`}
                >
                  {v === "alquiler" ? "Arriendo" : "Venta"}
                </button>
              ))}
            </div>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Tipo">
              <GlassSelect
                value={type}
                onChange={(e) =>
                  setType(
                    e.target.value as
                      | "apartamento"
                      | "casa"
                      | "oficina"
                      | "local",
                  )
                }
              >
                <option value="apartamento">Departamento</option>
                <option value="casa">Casa</option>
                <option value="oficina">Oficina</option>
                <option value="local">Local</option>
              </GlassSelect>
            </Field>
            <Field
              label={
                listing === "venta" ? "Precio venta (CLP)" : "Arriendo / mes (CLP)"
              }
            >
              <GlassInput
                type="number"
                inputMode="numeric"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder={listing === "venta" ? "180000000" : "850000"}
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Habitaciones">
              <GlassInput
                type="number"
                inputMode="numeric"
                value={bedrooms}
                onChange={(e) => setBedrooms(e.target.value)}
                placeholder="3"
              />
            </Field>
            <Field label="Superficie (m²)">
              <GlassInput
                type="number"
                inputMode="numeric"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder="80"
              />
            </Field>
          </div>
        </div>

        {error && (
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-rose-300/50 bg-rose-50/70 px-3 py-2 text-[12.5px] text-rose-800">
            <Icon icon={AlertCircleIcon} size={13} className="mt-0.5" />
            {error}
          </div>
        )}
      </div>

      <FooterButtons
        onBack={onBack}
        onSkip={onSkip}
        primaryLabel={create.isPending ? "Creando…" : "Crear propiedad"}
        primaryDisabled={create.isPending}
        onPrimary={submit}
      />
    </div>
  );
}

/* ============ Step 4 — Done ============ */

function StepDone() {
  const router = useRouter();
  const complete = useCompleteOnboarding();

  useEffect(() => {
    complete.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checks = [
    "Tu corredora está activa con el plan Starter",
    "Datos básicos guardados",
    "Tu primera propiedad lista (o pendiente, según prefieras)",
    "Pipeline kanban con etapas default ya creado",
  ];

  return (
    <div>
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-300/50 bg-emerald-50/70 text-emerald-700 backdrop-blur-xl">
        <Icon icon={CheckmarkCircle02Icon} size={20} />
      </span>

      <h2 className="mt-6 font-serif text-[44px] font-medium leading-[1.02] tracking-[-0.02em] sm:text-[52px]">
        Todo <span className="italic text-[var(--gold)]">listo</span>.
      </h2>
      <p className="mt-4 max-w-md text-[15px] leading-relaxed text-[#1a1612]/65">
        Tu corredora ya está operando. Cuando crezcas y necesites más usuarios,
        comisiones automáticas o captación multicanal, súbete a Pro o Business
        en un click.
      </p>

      <ul className="mt-7 space-y-2.5">
        {checks.map((c) => (
          <li
            key={c}
            className="flex items-start gap-2.5 text-[14px] leading-relaxed text-[#1a1612]/85"
          >
            <Icon
              icon={CheckmarkCircle02Icon}
              size={14}
              className="mt-0.5 shrink-0 text-[var(--gold)]"
            />
            {c}
          </li>
        ))}
      </ul>

      <div className="mt-9 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => router.push("/dashboard")}
          className="group inline-flex items-center gap-2 rounded-full bg-[#1a1612] py-3.5 pl-6 pr-2 text-[14px] font-medium text-white shadow-[0_14px_34px_-12px_rgba(26,22,18,0.45)] hover:bg-black"
        >
          Ir a mi dashboard
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#1a1612] transition-transform group-hover:translate-x-0.5">
            <Icon icon={ArrowRight01Icon} size={13} />
          </span>
        </button>
        <Link
          href="/planes"
          className="text-[13px] font-medium text-[#1a1612]/55 underline-offset-2 hover:text-[#1a1612] hover:underline"
        >
          Comparar planes
        </Link>
      </div>
    </div>
  );
}

/* ============ helpers ============ */

function PageBackground() {
  return (
    <>
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
            "radial-gradient(45% 40% at 18% 22%, rgba(201,169,110,0.22), transparent 70%), radial-gradient(40% 50% at 85% 80%, rgba(201,169,110,0.18), transparent 70%)",
        }}
      />
    </>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[12.5px] font-medium text-[#1a1612]/85">
        {label}
      </span>
      {children}
      {hint && (
        <span className="text-[11.5px] text-[#1a1612]/50">{hint}</span>
      )}
    </label>
  );
}

function GlassInput({
  leading,
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { leading?: React.ReactNode }) {
  return (
    <span className="relative inline-flex w-full">
      {leading && (
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#1a1612]/45">
          {leading}
        </span>
      )}
      <input
        {...props}
        className={[
          "w-full rounded-full border border-white/70 bg-white/55 py-3 pl-4 pr-4 text-[14px] text-[#1a1612] placeholder:text-[#1a1612]/40 backdrop-blur-xl transition-all",
          "focus:border-[var(--gold)]/45 focus:bg-white/80 focus:outline-none focus:ring-2 focus:ring-[var(--gold)]/15",
          leading ? "pl-10" : "",
          className ?? "",
        ].join(" ")}
      />
    </span>
  );
}

function GlassSelect(
  props: React.SelectHTMLAttributes<HTMLSelectElement>,
) {
  return (
    <select
      {...props}
      className="w-full appearance-none rounded-full border border-white/70 bg-white/55 px-4 py-3 text-[14px] text-[#1a1612] backdrop-blur-xl transition-all focus:border-[var(--gold)]/45 focus:bg-white/80 focus:outline-none focus:ring-2 focus:ring-[var(--gold)]/15"
    />
  );
}

function FooterButtons({
  onBack,
  onSkip,
  onPrimary,
  primaryLabel,
  primaryDisabled,
}: {
  onBack: () => void;
  onSkip: () => void;
  onPrimary: () => void;
  primaryLabel: string;
  primaryDisabled?: boolean;
}) {
  return (
    <div className="mt-7 flex flex-wrap items-center justify-between gap-3">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1.5 rounded-full border border-white/70 bg-white/55 px-5 py-3 text-[13px] font-medium text-[#1a1612]/85 backdrop-blur-xl hover:bg-white/75 hover:text-[#1a1612]"
      >
        <Icon icon={ArrowLeft01Icon} size={11} />
        Atrás
      </button>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onSkip}
          className="text-[13px] font-medium text-[#1a1612]/55 underline-offset-2 hover:text-[#1a1612] hover:underline"
        >
          Saltar este paso
        </button>
        <button
          type="button"
          onClick={onPrimary}
          disabled={primaryDisabled}
          className="group inline-flex items-center gap-2 rounded-full bg-[#1a1612] py-3 pl-5 pr-2 text-[13px] font-medium text-white shadow-[0_12px_30px_-10px_rgba(26,22,18,0.4)] hover:bg-black disabled:opacity-60"
        >
          {primaryLabel}
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-[#1a1612] transition-transform group-hover:translate-x-0.5">
            <Icon icon={ArrowRight01Icon} size={11} />
          </span>
        </button>
      </div>
    </div>
  );
}
