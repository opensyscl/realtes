"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Mail01Icon,
  ArrowRight01Icon,
  ArrowLeft01Icon,
  AlertCircleIcon,
  CheckmarkCircle02Icon,
  Mail02Icon,
} from "@hugeicons/core-free-icons";

import { Icon } from "@/components/ui/icon";
import { useRequestPasswordReset } from "@/lib/queries";
import { RealtesLogo } from "@/components/landing/realtes-logo";

const schema = z.object({
  email: z.string().email("Email inválido"),
});

type FormData = z.infer<typeof schema>;

export function ForgotClient() {
  const request = useRequestPasswordReset();
  const [sentTo, setSentTo] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = handleSubmit(async (data) => {
    try {
      await request.mutateAsync(data);
      setSentTo(data.email);
    } catch {
      /* error en request.error */
    }
  });

  const apiError =
    request.error && "response" in (request.error as object)
      ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ((request.error as any).response?.data?.message as string | undefined) ??
        "No pudimos procesar tu solicitud."
      : null;

  return (
    <main className="relative min-h-screen overflow-hidden text-[#1a1612]">
      <PageBackground />

      <div className="mx-auto flex min-h-screen max-w-[480px] flex-col px-6 py-10">
        <Link href="/" className="inline-flex w-fit items-center gap-1.5">
          <RealtesLogo variant="full" className="h-7" />
          <span className="text-[var(--gold)]">*</span>
        </Link>

        <div className="my-auto flex flex-col py-8">
          {sentTo ? (
            <SuccessState email={sentTo} />
          ) : (
            <>
              <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/70 bg-white/55 px-3 py-1 text-[11px] font-medium text-[#1a1612]/75 backdrop-blur-xl">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--gold)]" />
                Recuperar acceso
              </span>

              <h1 className="mt-5 font-serif text-[44px] font-medium leading-[1.05] tracking-[-0.02em] sm:text-[52px]">
                ¿Olvidaste tu
                <br />
                <span className="italic text-[var(--gold)]">contraseña</span>?
              </h1>
              <p className="mt-4 text-[15px] leading-relaxed text-[#1a1612]/65">
                Sin problema. Te enviamos un email con un enlace para crear una
                nueva. Es válido durante 60 minutos.
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
                <Field
                  label="Email de tu cuenta"
                  error={errors.email?.message}
                >
                  <GlassInput
                    {...register("email")}
                    type="email"
                    placeholder="tu@corredora.cl"
                    leading={<Icon icon={Mail01Icon} size={15} />}
                    autoComplete="email"
                    autoFocus
                  />
                </Field>

                <button
                  type="submit"
                  disabled={isSubmitting || request.isPending}
                  className="group mt-6 inline-flex w-full items-center justify-between gap-2 rounded-full bg-[#1a1612] py-3.5 pl-6 pr-2 text-[14px] font-medium text-white shadow-[0_14px_34px_-12px_rgba(26,22,18,0.45)] transition-all hover:bg-black disabled:opacity-60"
                >
                  {request.isPending
                    ? "Enviando email…"
                    : "Enviar enlace de recuperación"}
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
            </>
          )}
        </div>
      </div>
    </main>
  );
}

function SuccessState({ email }: { email: string }) {
  return (
    <div className="flex flex-col">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-300/50 bg-emerald-50/70 text-emerald-700 backdrop-blur-xl">
        <Icon icon={Mail02Icon} size={20} />
      </span>

      <h1 className="mt-6 font-serif text-[40px] font-medium leading-[1.05] tracking-[-0.02em] sm:text-[48px]">
        Email <span className="italic text-[var(--gold)]">en camino</span>.
      </h1>
      <p className="mt-4 max-w-md text-[15px] leading-relaxed text-[#1a1612]/65">
        Si <strong className="text-[#1a1612]">{email}</strong> tiene una cuenta
        en Realtes, en menos de un minuto recibirás un email con un enlace para
        crear una contraseña nueva.
      </p>

      <ul className="mt-7 space-y-2.5">
        {[
          "Revisa tu bandeja principal y la carpeta de spam",
          "El enlace es válido durante 60 minutos",
          "Solo se puede usar una vez",
        ].map((t) => (
          <li
            key={t}
            className="flex items-start gap-2.5 text-[14px] leading-relaxed text-[#1a1612]/85"
          >
            <Icon
              icon={CheckmarkCircle02Icon}
              size={14}
              className="mt-0.5 shrink-0 text-[var(--gold)]"
            />
            {t}
          </li>
        ))}
      </ul>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <Link
          href="/login"
          className="group inline-flex items-center gap-2 rounded-full bg-[#1a1612] py-3 pl-5 pr-2 text-[13px] font-medium text-white shadow-[0_12px_30px_-10px_rgba(26,22,18,0.4)] hover:bg-black"
        >
          Volver a iniciar sesión
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-[#1a1612]">
            <Icon icon={ArrowRight01Icon} size={11} />
          </span>
        </Link>
        <Link
          href="/forgot"
          className="text-[13px] font-medium text-[#1a1612]/60 underline-offset-2 hover:text-[#1a1612] hover:underline"
        >
          Reenviar email
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
