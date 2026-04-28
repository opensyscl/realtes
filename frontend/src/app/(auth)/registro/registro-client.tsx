"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Mail01Icon,
  LockPasswordIcon,
  ViewIcon,
  ViewOffSlashIcon,
  Building03Icon,
  AlertCircleIcon,
  UserIcon,
  CallIcon,
  ArrowRight01Icon,
  CheckmarkCircle02Icon,
  StarIcon,
} from "@hugeicons/core-free-icons";

import { Icon } from "@/components/ui/icon";
import { useRegister } from "@/lib/queries";
import { RealtesLogo } from "@/components/landing/realtes-logo";

const schema = z
  .object({
    agency_name: z.string().min(2, "Mínimo 2 caracteres").max(120),
    agency_slug: z
      .string()
      .min(3, "Mínimo 3 caracteres")
      .max(60)
      .regex(/^[a-z0-9-]+$/, "Solo minúsculas, números y guiones"),
    agency_phone: z.string().max(30).optional().or(z.literal("")),
    name: z.string().min(2).max(120),
    email: z.string().email("Email inválido"),
    password: z.string().min(8, "Mínimo 8 caracteres"),
    password_confirmation: z.string(),
  })
  .refine((d) => d.password === d.password_confirmation, {
    message: "Las contraseñas no coinciden",
    path: ["password_confirmation"],
  });

type FormData = z.infer<typeof schema>;

const PLANS_INFO: Record<
  string,
  { label: string; price: string; trial: string; tone: "gold" | "neutral" }
> = {
  starter: {
    label: "Plan Starter",
    price: "Gratis",
    trial: "Para siempre",
    tone: "neutral",
  },
  pro: {
    label: "Plan Pro",
    price: "$29.990 CLP/mes",
    trial: "14 días gratis",
    tone: "gold",
  },
  business: {
    label: "Plan Business",
    price: "$79.990 CLP/mes",
    trial: "14 días gratis",
    tone: "neutral",
  },
};

function extractError(err: unknown): string | null {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const r = (err as any)?.response?.data;
  if (!r) return null;
  if (typeof r.message === "string" && r.message) return r.message;
  if (r.errors && typeof r.errors === "object") {
    const firstKey = Object.keys(r.errors)[0];
    if (firstKey && Array.isArray(r.errors[firstKey])) {
      return r.errors[firstKey][0] as string;
    }
  }
  return "Error al crear la corredora.";
}

export function RegistroClient() {
  return (
    <Suspense fallback={<RegisterFallback />}>
      <RegisterScreen />
    </Suspense>
  );
}

function RegisterFallback() {
  return (
    <main className="relative min-h-screen text-[#1a1612]">
      <PageBackground />
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#1a1612]/20 border-t-[#1a1612]" />
      </div>
    </main>
  );
}

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
            "radial-gradient(45% 40% at 18% 22%, rgba(201,169,110,0.22), transparent 70%), radial-gradient(40% 50% at 85% 80%, rgba(201,169,110,0.18), transparent 70%), radial-gradient(35% 35% at 65% 15%, rgba(255,255,255,0.7), transparent 70%)",
        }}
      />
    </>
  );
}

function RegisterScreen() {
  const params = useSearchParams();
  const planCode = params.get("plan") ?? "starter";
  const planInfo = PLANS_INFO[planCode] ?? PLANS_INFO.starter;

  const [show, setShow] = useState(false);
  const router = useRouter();
  const register_ = useRegister();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = handleSubmit(async (data) => {
    try {
      await register_.mutateAsync({
        ...data,
        agency_phone: data.agency_phone || undefined,
      });
      router.push("/onboarding");
    } catch {
      /* error abajo */
    }
  });

  const apiError = register_.error ? extractError(register_.error) : null;

  return (
    <main className="relative min-h-screen overflow-hidden text-[#1a1612]">
      <PageBackground />

      <div className="mx-auto grid min-h-screen max-w-[1280px] grid-cols-1 gap-10 px-6 py-10 lg:grid-cols-[1.1fr_1fr] lg:gap-16 lg:py-16">
        {/* === Left: form === */}
        <div className="flex flex-col">
          <Link href="/" className="inline-flex w-fit items-center gap-1.5">
            <RealtesLogo variant="full" className="h-7" />
            <span className="text-[var(--gold)]">*</span>
          </Link>

          <div className="my-auto flex flex-col py-8">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/70 bg-white/55 px-3 py-1 text-[11px] font-medium text-[#1a1612]/75 backdrop-blur-xl">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--gold)]" />
              {planInfo.label} · {planInfo.trial}
            </span>

            <h1 className="mt-5 font-serif text-[44px] font-medium leading-[1.05] tracking-[-0.02em] sm:text-[56px]">
              Crea tu corredora
              <br />
              en <span className="italic text-[var(--gold)]">2 minutos</span>.
            </h1>
            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-[#1a1612]/65">
              Configuramos pipeline, dashboard y escaparate público. Cuando
              termines este formulario, ya estás operando.
            </p>

            {apiError && (
              <div className="mt-6 flex items-start gap-2 rounded-2xl border border-rose-300/50 bg-rose-50/70 px-3 py-2.5 text-[13px] text-rose-800 backdrop-blur-xl">
                <Icon icon={AlertCircleIcon} size={14} className="mt-0.5" />
                <span>{apiError}</span>
              </div>
            )}

            <form
              onSubmit={onSubmit}
              className="mt-7 rounded-[28px] border border-white/70 bg-white/45 p-7 shadow-[0_30px_80px_-30px_rgba(80,60,30,0.25)] backdrop-blur-2xl"
              noValidate
            >
              <SectionLabel>Datos de tu corredora</SectionLabel>

              <div className="mt-3 flex flex-col gap-3">
                <Field label="Nombre de la corredora *" error={errors.agency_name?.message}>
                  <GlassInput
                    {...register("agency_name")}
                    placeholder="Corredora Aurora"
                    leading={<Icon icon={Building03Icon} size={15} />}
                    onChange={(e) => {
                      register("agency_name").onChange(e);
                      const slug = e.target.value
                        .toLowerCase()
                        .normalize("NFD")
                        .replace(/[̀-ͯ]/g, "")
                        .replace(/[^a-z0-9]+/g, "-")
                        .replace(/^-|-$/g, "")
                        .slice(0, 40);
                      if (slug) setValue("agency_slug", slug);
                    }}
                  />
                </Field>

                <Field
                  label="Identificador (slug) *"
                  hint="Tu escaparate público será realtes.cl/p/<slug>"
                  error={errors.agency_slug?.message}
                >
                  <GlassInput {...register("agency_slug")} placeholder="aurora" />
                </Field>

                <Field label="Teléfono" error={errors.agency_phone?.message}>
                  <GlassInput
                    {...register("agency_phone")}
                    placeholder="+56 9 XXXX XXXX"
                    leading={<Icon icon={CallIcon} size={15} />}
                  />
                </Field>
              </div>

              <div className="my-6 h-px bg-[#1a1612]/[0.08]" />

              <SectionLabel>Tu cuenta de propietario</SectionLabel>

              <div className="mt-3 flex flex-col gap-3">
                <Field label="Tu nombre *" error={errors.name?.message}>
                  <GlassInput
                    {...register("name")}
                    placeholder="María Hernández"
                    leading={<Icon icon={UserIcon} size={15} />}
                  />
                </Field>

                <Field label="Email *" error={errors.email?.message}>
                  <GlassInput
                    type="email"
                    {...register("email")}
                    placeholder="tu@corredora.cl"
                    leading={<Icon icon={Mail01Icon} size={15} />}
                  />
                </Field>

                <Field label="Contraseña *" error={errors.password?.message}>
                  <GlassInput
                    type={show ? "text" : "password"}
                    {...register("password")}
                    leading={<Icon icon={LockPasswordIcon} size={15} />}
                    trailing={
                      <button
                        type="button"
                        onClick={() => setShow((s) => !s)}
                        className="text-[#1a1612]/55 hover:text-[#1a1612]"
                      >
                        <Icon
                          icon={show ? ViewOffSlashIcon : ViewIcon}
                          size={15}
                        />
                      </button>
                    }
                  />
                </Field>

                <Field
                  label="Confirma contraseña *"
                  error={errors.password_confirmation?.message}
                >
                  <GlassInput
                    type="password"
                    {...register("password_confirmation")}
                    leading={<Icon icon={LockPasswordIcon} size={15} />}
                  />
                </Field>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || register_.isPending}
                className="group mt-7 inline-flex w-full items-center justify-between gap-2 rounded-full bg-[#1a1612] py-3.5 pl-6 pr-2 text-[14px] font-medium text-white shadow-[0_14px_34px_-12px_rgba(26,22,18,0.45)] transition-all hover:bg-black disabled:opacity-60"
              >
                {register_.isPending
                  ? "Creando corredora…"
                  : "Crear corredora"}
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#1a1612] transition-transform group-hover:translate-x-0.5">
                  <Icon icon={ArrowRight01Icon} size={13} />
                </span>
              </button>

              <p className="mt-5 text-center text-[12.5px] text-[#1a1612]/55">
                ¿Ya tienes cuenta?{" "}
                <Link
                  href="/login"
                  className="font-medium text-[#1a1612] underline-offset-2 hover:underline"
                >
                  Iniciar sesión
                </Link>
              </p>
            </form>
          </div>
        </div>

        {/* === Right: side panel === */}
        <SidePanel planCode={planCode} planInfo={planInfo} />
      </div>
    </main>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#1a1612]/45">
      {children}
    </div>
  );
}

function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[12.5px] font-medium text-[#1a1612]/85">
        {label}
      </span>
      {children}
      {hint && !error && (
        <span className="text-[11.5px] text-[#1a1612]/50">{hint}</span>
      )}
      {error && (
        <span className="text-[11.5px] font-medium text-rose-700">
          {error}
        </span>
      )}
    </label>
  );
}

function GlassInput({
  leading,
  trailing,
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
}) {
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
          "disabled:opacity-60",
          leading ? "pl-10" : "",
          trailing ? "pr-10" : "",
          className ?? "",
        ].join(" ")}
      />
      {trailing && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2">
          {trailing}
        </span>
      )}
    </span>
  );
}

/* ============ SIDE PANEL ============ */

function SidePanel({
  planCode,
  planInfo,
}: {
  planCode: string;
  planInfo: (typeof PLANS_INFO)[string];
}) {
  const benefits = [
    "ERP completo y CRM con pipeline kanban",
    "Captación multicanal: WhatsApp, Instagram, Messenger",
    "Cargos automáticos y comisiones sin Excel",
    "Escaparate público bajo tu marca",
    "Sin tarjeta de crédito, sin permanencia",
  ];

  return (
    <aside className="hidden flex-col lg:flex">
      <div className="sticky top-16 flex flex-col gap-5">
        {/* Plan card */}
        <div
          className={`relative overflow-hidden rounded-[28px] p-7 backdrop-blur-2xl ${
            planInfo.tone === "gold"
              ? "border border-[var(--gold)]/40 bg-gradient-to-b from-[var(--gold)]/[0.18] to-white/55 shadow-[0_30px_80px_-30px_rgba(201,169,110,0.45)]"
              : "border border-white/70 bg-white/45 shadow-[0_20px_60px_-25px_rgba(80,60,30,0.18)]"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/65 px-3 py-1 text-[11px] font-medium text-[#1a1612]/75 backdrop-blur-xl">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--gold)]" />
              {planInfo.label}
            </span>
            <Link
              href="/planes"
              className="text-[11.5px] font-medium text-[#1a1612]/55 underline-offset-2 hover:text-[#1a1612] hover:underline"
            >
              Cambiar plan
            </Link>
          </div>

          <div className="mt-5 flex items-baseline gap-2">
            <span className="font-serif text-[44px] font-medium leading-none tracking-[-0.02em] tabular-numbers text-[#1a1612]">
              {planInfo.price}
            </span>
          </div>
          <div className="mt-2 text-[13px] text-[#1a1612]/65">
            {planInfo.trial} · cancela cuando quieras
          </div>

          <ul className="mt-7 space-y-2.5 border-t border-[#1a1612]/[0.08] pt-6">
            {benefits.map((b) => (
              <li
                key={b}
                className="flex items-start gap-2.5 text-[13.5px] leading-relaxed text-[#1a1612]/85"
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
        </div>

        {/* Testimonial card */}
        <div className="rounded-[24px] border border-white/70 bg-white/45 p-6 shadow-[0_20px_50px_-25px_rgba(80,60,30,0.18)] backdrop-blur-2xl">
          <div className="flex items-center gap-1 text-[var(--gold)]">
            {Array.from({ length: 5 }).map((_, i) => (
              <Icon key={i} icon={StarIcon} size={11} />
            ))}
          </div>
          <p className="mt-3 font-serif text-[16px] leading-[1.4] tracking-[-0.005em] text-[#1a1612]/90">
            &ldquo;Pasamos de 4 herramientas a una sola. El equipo factura más
            y discute menos quién hizo qué.&rdquo;
          </p>
          <div className="mt-4 flex items-center gap-2.5">
            <span className="h-9 w-9 overflow-hidden rounded-full border border-white/70">
              <img
                src="https://i.pravatar.cc/72?img=47"
                alt=""
                className="h-full w-full object-cover"
              />
            </span>
            <div>
              <div className="text-[12.5px] font-semibold text-[#1a1612]">
                Carla Montoya
              </div>
              <div className="text-[11.5px] text-[#1a1612]/55">
                CEO · Montoya Propiedades
              </div>
            </div>
          </div>
        </div>

        {/* Trust footer */}
        <div className="flex items-center justify-center gap-5 text-[11px] text-[#1a1612]/45">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            200+ corredoras activas
          </span>
          <span className="h-3 w-px bg-[#1a1612]/15" />
          <span>UF 2.1M operados en 2025</span>
        </div>
      </div>
    </aside>
  );
}
