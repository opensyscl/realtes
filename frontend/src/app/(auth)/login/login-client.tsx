"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Mail01Icon,
  LockPasswordIcon,
  ViewIcon,
  ViewOffSlashIcon,
  AlertCircleIcon,
  ArrowRight01Icon,
  StarIcon,
} from "@hugeicons/core-free-icons";

import { Icon } from "@/components/ui/icon";
import { useLogin } from "@/lib/queries";
import { RealtesLogo } from "@/components/landing/realtes-logo";

const schema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(4, "Contraseña demasiado corta"),
});

type FormData = z.infer<typeof schema>;

export function LoginClient() {
  const [show, setShow] = useState(false);
  const router = useRouter();
  const login = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = handleSubmit(async (data) => {
    try {
      await login.mutateAsync(data);
      router.push("/dashboard");
    } catch {
      /* error mostrado abajo */
    }
  });

  const apiError =
    login.error && "response" in (login.error as object)
      ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ((login.error as any).response?.data?.message as string | undefined) ??
        "No se pudo iniciar sesión"
      : null;

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
              Iniciar sesión
            </span>

            <h1 className="mt-5 font-serif text-[44px] font-medium leading-[1.05] tracking-[-0.02em] sm:text-[56px]">
              Bienvenido de
              <br />
              <span className="italic text-[var(--gold)]">vuelta</span>.
            </h1>
            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-[#1a1612]/65">
              Accede a tu corredora para gestionar propiedades, contratos y
              leads.
            </p>

            {apiError && (
              <div className="mt-6 flex w-full max-w-md items-start gap-2 rounded-2xl border border-rose-300/50 bg-rose-50/70 px-3 py-2.5 text-[13px] text-rose-800 backdrop-blur-xl">
                <Icon icon={AlertCircleIcon} size={14} className="mt-0.5" />
                <span>{apiError}</span>
              </div>
            )}

            <form
              onSubmit={onSubmit}
              className="mt-7 w-full max-w-md rounded-[28px] border border-white/70 bg-white/45 p-7 shadow-[0_30px_80px_-30px_rgba(80,60,30,0.25)] backdrop-blur-2xl"
              noValidate
            >
              <div className="flex flex-col gap-3.5">
                <Field label="Email corporativo" error={errors.email?.message}>
                  <GlassInput
                    {...register("email")}
                    type="email"
                    placeholder="tu@corredora.cl"
                    leading={<Icon icon={Mail01Icon} size={15} />}
                    autoComplete="email"
                  />
                </Field>

                <Field
                  label="Contraseña"
                  error={errors.password?.message}
                  trailing={
                    <Link
                      href="/forgot"
                      className="text-[11.5px] font-medium text-[#1a1612]/55 underline-offset-2 hover:text-[#1a1612] hover:underline"
                    >
                      ¿Olvidaste?
                    </Link>
                  }
                >
                  <GlassInput
                    {...register("password")}
                    type={show ? "text" : "password"}
                    placeholder="••••••••"
                    leading={<Icon icon={LockPasswordIcon} size={15} />}
                    trailing={
                      <button
                        type="button"
                        onClick={() => setShow((s) => !s)}
                        className="text-[#1a1612]/55 hover:text-[#1a1612]"
                        aria-label={show ? "Ocultar" : "Mostrar"}
                      >
                        <Icon
                          icon={show ? ViewOffSlashIcon : ViewIcon}
                          size={15}
                        />
                      </button>
                    }
                    autoComplete="current-password"
                  />
                </Field>

                <label className="mt-1 inline-flex items-center gap-2 text-[12.5px] text-[#1a1612]/65">
                  <input
                    type="checkbox"
                    className="h-3.5 w-3.5 rounded border-[#1a1612]/30 bg-white/60 accent-[var(--gold)]"
                  />
                  Mantener sesión iniciada en este dispositivo
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || login.isPending}
                className="group mt-6 inline-flex w-full items-center justify-between gap-2 rounded-full bg-[#1a1612] py-3.5 pl-6 pr-2 text-[14px] font-medium text-white shadow-[0_14px_34px_-12px_rgba(26,22,18,0.45)] transition-all hover:bg-black disabled:opacity-60"
              >
                {login.isPending ? "Iniciando sesión…" : "Entrar"}
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#1a1612] transition-transform group-hover:translate-x-0.5">
                  <Icon icon={ArrowRight01Icon} size={13} />
                </span>
              </button>

              <div className="my-5 flex items-center gap-3 text-[10px] uppercase tracking-[0.18em] text-[#1a1612]/40">
                <span className="h-px flex-1 bg-[#1a1612]/[0.08]" />
                o
                <span className="h-px flex-1 bg-[#1a1612]/[0.08]" />
              </div>

              <button
                type="button"
                disabled
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/70 bg-white/55 py-3 text-[13.5px] font-medium text-[#1a1612]/75 backdrop-blur-xl transition-all hover:bg-white/75 hover:text-[#1a1612] disabled:opacity-60"
              >
                <GoogleIcon />
                Continuar con Google
              </button>
            </form>

            <div className="mt-6 max-w-md space-y-1.5">
              <p className="text-[12px] text-[#1a1612]/55">
                Demo:{" "}
                <span className="rounded-md bg-white/60 px-1.5 py-0.5 font-mono text-[11.5px] text-[#1a1612]/85 backdrop-blur-xl">
                  hola@bookforce.io
                </span>{" "}
                /{" "}
                <span className="rounded-md bg-white/60 px-1.5 py-0.5 font-mono text-[11.5px] text-[#1a1612]/85 backdrop-blur-xl">
                  password
                </span>
              </p>
              <p className="text-[12.5px] text-[#1a1612]/55">
                ¿Aún no tienes cuenta?{" "}
                <Link
                  href="/registro"
                  className="font-medium text-[#1a1612] underline-offset-2 hover:underline"
                >
                  Crear corredora
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* === Right: side panel === */}
        <SidePanel />
      </div>
    </main>
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
            "radial-gradient(45% 40% at 18% 22%, rgba(201,169,110,0.22), transparent 70%), radial-gradient(40% 50% at 85% 80%, rgba(201,169,110,0.18), transparent 70%), radial-gradient(35% 35% at 65% 15%, rgba(255,255,255,0.7), transparent 70%)",
        }}
      />
    </>
  );
}

function Field({
  label,
  error,
  trailing,
  children,
}: {
  label: string;
  error?: string;
  trailing?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="flex items-center justify-between">
        <span className="text-[12.5px] font-medium text-[#1a1612]/85">
          {label}
        </span>
        {trailing}
      </span>
      {children}
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

function GoogleIcon() {
  return (
    <svg viewBox="0 0 18 18" className="h-4 w-4" aria-hidden>
      <path
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.79 2.71v2.26h2.9c1.7-1.56 2.69-3.87 2.69-6.61z"
        fill="#4285F4"
      />
      <path
        d="M9 18c2.43 0 4.47-.81 5.96-2.18l-2.9-2.26c-.81.55-1.83.87-3.06.87-2.35 0-4.34-1.59-5.05-3.72H.93v2.33A8.997 8.997 0 0 0 9 18z"
        fill="#34A853"
      />
      <path
        d="M3.95 10.71A5.4 5.4 0 0 1 3.66 9c0-.6.1-1.18.29-1.71V4.96H.93A8.996 8.996 0 0 0 0 9c0 1.45.35 2.82.93 4.04l3.02-2.33z"
        fill="#FBBC05"
      />
      <path
        d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A8.997 8.997 0 0 0 .93 4.96l3.02 2.33C4.66 5.17 6.65 3.58 9 3.58z"
        fill="#EA4335"
      />
    </svg>
  );
}

/* ============ SIDE PANEL ============ */

function SidePanel() {
  const stats = [
    { value: "200+", label: "corredoras activas" },
    { value: "UF 2.1M", label: "operados en 2025" },
    { value: "4.9", label: "valoración media" },
  ];

  return (
    <aside className="hidden flex-col lg:flex">
      <div className="sticky top-16 flex flex-col gap-5">
        {/* Visual / image card */}
        <div className="relative overflow-hidden rounded-[28px] border border-white/70 bg-white/45 shadow-[0_30px_80px_-30px_rgba(80,60,30,0.3)] backdrop-blur-2xl">
          <div className="relative aspect-[4/3] overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=900&q=85&auto=format&fit=crop"
              alt=""
              className="h-full w-full object-cover"
            />
            <div
              aria-hidden
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "linear-gradient(180deg, rgba(0,0,0,0) 50%, rgba(0,0,0,0.4) 100%)",
              }}
            />
            {/* Floating chip */}
            <div className="absolute left-4 top-4">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-black/40 px-3 py-1.5 text-[11.5px] font-medium text-white backdrop-blur-md">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Nueva operación cerrada
              </span>
            </div>
            <div className="absolute inset-x-4 bottom-4 flex items-end justify-between text-white">
              <div>
                <div className="font-serif text-[20px] font-medium leading-tight tracking-tight">
                  Villa Mirador
                </div>
                <div className="mt-0.5 text-[12px] text-white/85">
                  Concón · UF 35.000
                </div>
              </div>
              <span className="rounded-full border border-white/40 bg-white/95 px-3 py-1 text-[11.5px] font-semibold text-[#1a1612]">
                Vendida
              </span>
            </div>
          </div>
        </div>

        {/* Testimonial card */}
        <div className="rounded-[24px] border border-white/70 bg-white/45 p-6 shadow-[0_20px_50px_-25px_rgba(80,60,30,0.18)] backdrop-blur-2xl">
          <div className="flex items-center gap-1 text-[var(--gold)]">
            {Array.from({ length: 5 }).map((_, i) => (
              <Icon key={i} icon={StarIcon} size={11} />
            ))}
          </div>
          <p className="mt-3 font-serif text-[16px] leading-[1.4] tracking-[-0.005em] text-[#1a1612]/90">
            &ldquo;La generación automática de cargos nos ahorra dos días de
            trabajo cada mes.&rdquo;
          </p>
          <div className="mt-4 flex items-center gap-2.5">
            <span className="h-9 w-9 overflow-hidden rounded-full border border-white/70">
              <img
                src="https://i.pravatar.cc/72?img=33"
                alt=""
                className="h-full w-full object-cover"
              />
            </span>
            <div>
              <div className="text-[12.5px] font-semibold text-[#1a1612]">
                David Ferrer
              </div>
              <div className="text-[11.5px] text-[#1a1612]/55">
                Director · Ferrer Propiedades
              </div>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-2xl border border-white/70 bg-white/45 p-3 text-center backdrop-blur-2xl"
            >
              <div className="font-serif text-[18px] font-semibold leading-none tabular-numbers text-[#1a1612]">
                {s.value}
              </div>
              <div className="mt-1.5 text-[10px] uppercase tracking-[0.1em] text-[#1a1612]/50">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
