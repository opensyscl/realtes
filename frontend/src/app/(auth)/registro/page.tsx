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
  Building03Icon,
  AlertCircleIcon,
  UserIcon,
  CallIcon,
} from "@hugeicons/core-free-icons";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Icon } from "@/components/ui/icon";
import { useRegister } from "@/lib/queries";

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
  return "Error al crear la agencia.";
}

export default function RegisterPage() {
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
      router.push("/dashboard");
    } catch {
      /* error mostrado abajo */
    }
  });

  const apiError = register_.error
    ? extractError(register_.error)
    : null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
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
          <div className="mb-5">
            <h1 className="text-xl font-semibold tracking-tight">
              Crea tu agencia
            </h1>
            <p className="mt-1 text-sm text-foreground-muted">
              Empieza gratis con el plan Starter. Configuramos pipeline, dashboard
              y escaparate público en menos de 30 segundos.
            </p>
          </div>

          {apiError && (
            <div className="mb-4 flex items-start gap-2 rounded-2xl border border-negative/20 bg-negative-soft px-3 py-2.5 text-xs text-negative">
              <Icon icon={AlertCircleIcon} size={14} className="mt-0.5" />
              <span>{apiError}</span>
            </div>
          )}

          <form onSubmit={onSubmit} className="flex flex-col gap-3" noValidate>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Datos de la agencia
            </div>

            <Field label="Nombre de la agencia *" error={errors.agency_name?.message}>
              <Input
                {...register("agency_name")}
                placeholder="Inmobiliaria Mediterráneo"
                leading={<Icon icon={Building03Icon} size={15} />}
                onChange={(e) => {
                  register("agency_name").onChange(e);
                  // Auto-slug
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
              hint="Tu escaparate público será /p/<slug>"
              error={errors.agency_slug?.message}
            >
              <Input {...register("agency_slug")} placeholder="mediterraneo" />
            </Field>

            <Field label="Teléfono de la agencia" error={errors.agency_phone?.message}>
              <Input
                {...register("agency_phone")}
                placeholder="+34 9XX XXX XXX"
                leading={<Icon icon={CallIcon} size={15} />}
              />
            </Field>

            <div className="mt-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Tu cuenta de propietario
            </div>

            <Field label="Tu nombre *" error={errors.name?.message}>
              <Input
                {...register("name")}
                placeholder="María Hernández"
                leading={<Icon icon={UserIcon} size={15} />}
              />
            </Field>

            <Field label="Email *" error={errors.email?.message}>
              <Input
                type="email"
                {...register("email")}
                placeholder="tu@agencia.com"
                leading={<Icon icon={Mail01Icon} size={15} />}
              />
            </Field>

            <Field label="Contraseña *" error={errors.password?.message}>
              <Input
                type={show ? "text" : "password"}
                {...register("password")}
                leading={<Icon icon={LockPasswordIcon} size={15} />}
                trailing={
                  <button
                    type="button"
                    onClick={() => setShow((s) => !s)}
                    className="hover:text-foreground"
                  >
                    <Icon icon={show ? ViewOffSlashIcon : ViewIcon} size={15} />
                  </button>
                }
              />
            </Field>

            <Field label="Confirma contraseña *" error={errors.password_confirmation?.message}>
              <Input
                type="password"
                {...register("password_confirmation")}
                leading={<Icon icon={LockPasswordIcon} size={15} />}
              />
            </Field>

            <Button
              size="lg"
              className="mt-3 w-full"
              type="submit"
              disabled={isSubmitting || register_.isPending}
            >
              {register_.isPending ? "Creando agencia..." : "Crear agencia"}
            </Button>
          </form>

          <p className="mt-5 text-center text-xs text-foreground-muted">
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" className="font-medium text-foreground hover:underline">
              Iniciar sesión
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
