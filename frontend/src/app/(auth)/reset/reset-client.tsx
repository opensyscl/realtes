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
  AlertCircleIcon,
  ArrowRight01Icon,
  ArrowLeft01Icon,
  ShieldKeyIcon,
} from "@hugeicons/core-free-icons";

import { Icon } from "@/components/ui/icon";
import { useResetPassword } from "@/lib/queries";
import { RealtesLogo } from "@/components/landing/realtes-logo";

const schema = z
  .object({
    email: z.string().email("Email inválido"),
    token: z.string().min(32, "Token inválido"),
    password: z.string().min(8, "Mínimo 8 caracteres"),
    password_confirmation: z.string(),
  })
  .refine((d) => d.password === d.password_confirmation, {
    message: "Las contraseñas no coinciden",
    path: ["password_confirmation"],
  });

type FormData = z.infer<typeof schema>;

export function ResetClient() {
  return (
    <Suspense fallback={<ResetFallback />}>
      <ResetForm />
    </Suspense>
  );
}

function ResetFallback() {
  return (
    <main className="relative min-h-screen text-[#1a1612]">
      <PageBackground />
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#1a1612]/20 border-t-[#1a1612]" />
      </div>
    </main>
  );
}

function ResetForm() {
  const params = useSearchParams();
  const router = useRouter();

  const tokenFromUrl = params.get("token") ?? "";
  const emailFromUrl = params.get("email") ?? "";

  const [show, setShow] = useState(false);
  const reset = useResetPassword();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: emailFromUrl,
      token: tokenFromUrl,
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    try {
      await reset.mutateAsync(data);
      router.push("/dashboard");
    } catch {
      /* error abajo */
    }
  });

  const apiError = reset.error
    ? extractError(reset.error) ?? "No pudimos restablecer tu contraseña."
    : null;

  if (!tokenFromUrl) {
    return <InvalidLink />;
  }

  return (
    <main className="relative min-h-screen overflow-hidden text-[#1a1612]">
      <PageBackground />

      <div className="mx-auto flex min-h-screen max-w-[480px] flex-col px-6 py-10">
        <Link href="/" className="inline-flex w-fit items-center gap-1.5">
          <RealtesLogo variant="full" className="h-7" />
          <span className="text-[var(--gold)]">*</span>
        </Link>

        <div className="my-auto flex flex-col py-8">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/70 bg-white/55 px-3 py-1 text-[11px] font-medium text-[#1a1612]/75 backdrop-blur-xl">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--gold)]" />
            Nueva contraseña
          </span>

          <h1 className="mt-5 font-serif text-[44px] font-medium leading-[1.05] tracking-[-0.02em] sm:text-[52px]">
            Crea una contraseña
            <br />
            <span className="italic text-[var(--gold)]">nueva</span>.
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-[#1a1612]/65">
            Restableces para{" "}
            <strong className="text-[#1a1612]">{emailFromUrl}</strong>. Cuando
            confirmes, te llevamos directo al dashboard.
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
            <input type="hidden" {...register("token")} />
            <input type="hidden" {...register("email")} />

            <div className="flex flex-col gap-3.5">
              <Field label="Email" error={errors.email?.message}>
                <GlassInput
                  type="email"
                  defaultValue={emailFromUrl}
                  readOnly
                  leading={<Icon icon={Mail01Icon} size={15} />}
                  className="opacity-70"
                />
              </Field>

              <Field
                label="Nueva contraseña"
                error={errors.password?.message}
              >
                <GlassInput
                  {...register("password")}
                  type={show ? "text" : "password"}
                  placeholder="Mínimo 8 caracteres"
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
                  autoComplete="new-password"
                  autoFocus
                />
              </Field>

              <Field
                label="Confirma la contraseña"
                error={errors.password_confirmation?.message}
              >
                <GlassInput
                  {...register("password_confirmation")}
                  type="password"
                  placeholder="Repítela"
                  leading={<Icon icon={LockPasswordIcon} size={15} />}
                  autoComplete="new-password"
                />
              </Field>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || reset.isPending}
              className="group mt-6 inline-flex w-full items-center justify-between gap-2 rounded-full bg-[#1a1612] py-3.5 pl-6 pr-2 text-[14px] font-medium text-white shadow-[0_14px_34px_-12px_rgba(26,22,18,0.45)] transition-all hover:bg-black disabled:opacity-60"
            >
              {reset.isPending
                ? "Restableciendo…"
                : "Restablecer contraseña"}
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#1a1612] transition-transform group-hover:translate-x-0.5">
                <Icon icon={ArrowRight01Icon} size={13} />
              </span>
            </button>
          </form>

          <Link
            href="/login"
            className="mt-6 inline-flex items-center gap-1.5 text-[12.5px] font-medium text-[#1a1612]/60 hover:text-[#1a1612]"
          >
            <Icon icon={ArrowLeft01Icon} size={11} />
            Volver al inicio de sesión
          </Link>
        </div>
      </div>
    </main>
  );
}

function InvalidLink() {
  return (
    <main className="relative min-h-screen overflow-hidden text-[#1a1612]">
      <PageBackground />
      <div className="mx-auto flex min-h-screen max-w-[480px] flex-col items-start px-6 py-10">
        <Link href="/" className="inline-flex w-fit items-center gap-1.5">
          <RealtesLogo variant="full" className="h-7" />
          <span className="text-[var(--gold)]">*</span>
        </Link>

        <div className="my-auto flex flex-col py-8">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-rose-300/50 bg-rose-50/70 text-rose-700 backdrop-blur-xl">
            <Icon icon={ShieldKeyIcon} size={20} />
          </span>

          <h1 className="mt-6 font-serif text-[40px] font-medium leading-[1.05] tracking-[-0.02em] sm:text-[48px]">
            Enlace <span className="italic text-rose-700">inválido</span>.
          </h1>
          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-[#1a1612]/65">
            El enlace que abriste no incluye un token válido. Probablemente
            está incompleto, ya se usó o expiró. Pide uno nuevo y listo.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/forgot"
              className="group inline-flex items-center gap-2 rounded-full bg-[#1a1612] py-3 pl-5 pr-2 text-[13px] font-medium text-white shadow-[0_12px_30px_-10px_rgba(26,22,18,0.4)] hover:bg-black"
            >
              Solicitar enlace nuevo
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-[#1a1612]">
                <Icon icon={ArrowRight01Icon} size={11} />
              </span>
            </Link>
            <Link
              href="/login"
              className="text-[13px] font-medium text-[#1a1612]/60 underline-offset-2 hover:text-[#1a1612] hover:underline"
            >
              Iniciar sesión
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

/* ============ helpers ============ */

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
  return null;
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
            "radial-gradient(45% 40% at 18% 22%, rgba(201,169,110,0.22), transparent 70%), radial-gradient(40% 50% at 85% 80%, rgba(201,169,110,0.18), transparent 70%)",
        }}
      />
    </>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[12.5px] font-medium text-[#1a1612]/85">
        {label}
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
          "disabled:opacity-60 read-only:cursor-not-allowed",
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
