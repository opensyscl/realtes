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
} from "@hugeicons/core-free-icons";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Icon } from "@/components/ui/icon";
import { useLogin } from "@/lib/queries";

const schema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(4, "Contraseña demasiado corta"),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
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
      /* el error se renderiza desde login.error */
    }
  });

  const apiError =
    login.error && "response" in (login.error as object)
      ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ((login.error as any).response?.data?.message as string | undefined) ??
        "No se pudo iniciar sesión"
      : null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center justify-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-accent-foreground text-sm font-semibold">
            R
          </span>
          <span className="text-base font-semibold tracking-tight">
            Real State Valencia
          </span>
        </div>

        <Card className="p-7">
          <div className="mb-6">
            <h1 className="text-xl font-semibold tracking-tight">
              Bienvenido de vuelta
            </h1>
            <p className="mt-1 text-sm text-foreground-muted">
              Accede a tu agencia para gestionar propiedades, contratos y leads.
            </p>
          </div>

          {apiError && (
            <div className="mb-4 flex items-start gap-2 rounded-2xl border border-negative/20 bg-negative-soft px-3 py-2.5 text-xs text-negative">
              <Icon icon={AlertCircleIcon} size={14} className="mt-0.5" />
              <span>{apiError}</span>
            </div>
          )}

          <form onSubmit={onSubmit} className="flex flex-col gap-3.5" noValidate>
            <label className="space-y-1.5">
              <span className="text-xs font-medium text-foreground-muted">
                Email corporativo
              </span>
              <Input
                {...register("email")}
                type="email"
                placeholder="tu@agencia.com"
                leading={<Icon icon={Mail01Icon} size={15} />}
                autoComplete="email"
              />
              {errors.email && (
                <span className="text-[11px] text-negative">{errors.email.message}</span>
              )}
            </label>

            <label className="space-y-1.5">
              <span className="flex items-center justify-between text-xs">
                <span className="font-medium text-foreground-muted">Contraseña</span>
                <Link
                  href="/forgot"
                  className="text-foreground-muted hover:text-foreground"
                >
                  ¿Olvidaste?
                </Link>
              </span>
              <Input
                {...register("password")}
                type={show ? "text" : "password"}
                placeholder="••••••••"
                leading={<Icon icon={LockPasswordIcon} size={15} />}
                trailing={
                  <button
                    type="button"
                    onClick={() => setShow((s) => !s)}
                    className="hover:text-foreground"
                    aria-label={show ? "Ocultar" : "Mostrar"}
                  >
                    <Icon icon={show ? ViewOffSlashIcon : ViewIcon} size={15} />
                  </button>
                }
                autoComplete="current-password"
              />
              {errors.password && (
                <span className="text-[11px] text-negative">{errors.password.message}</span>
              )}
            </label>

            <label className="mt-1 flex items-center gap-2 text-xs text-foreground-muted">
              <input
                type="checkbox"
                className="h-3.5 w-3.5 rounded border-border accent-foreground"
              />
              Mantener sesión iniciada en este dispositivo
            </label>

            <Button
              size="lg"
              className="mt-2 w-full"
              type="submit"
              disabled={isSubmitting || login.isPending}
            >
              {login.isPending ? "Iniciando sesión..." : "Entrar"}
            </Button>
          </form>

          <div className="my-5 flex items-center gap-3 text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
            <span className="h-px flex-1 bg-border-subtle" />o
            <span className="h-px flex-1 bg-border-subtle" />
          </div>

          <Button variant="outline" size="lg" className="w-full" type="button" disabled>
            Continuar con Google
          </Button>
        </Card>

        <p className="mt-6 text-center text-xs text-foreground-muted">
          Demo: <span className="font-mono">hola@bookforce.io</span> /{" "}
          <span className="font-mono">password</span>
        </p>
        <p className="mt-2 text-center text-xs text-foreground-muted">
          ¿Aún no tienes cuenta?{" "}
          <Link href="/registro" className="font-medium text-foreground hover:underline">
            Crear agencia
          </Link>
        </p>
      </div>
    </div>
  );
}
