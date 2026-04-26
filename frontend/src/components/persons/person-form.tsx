"use client";

import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/ui/field";
import { useSavePerson, type Person } from "@/lib/queries";

const schema = z.object({
  type: z.enum(["owner", "tenant", "both", "prospect"]),
  first_name: z.string().min(2, "Nombre requerido").max(80),
  last_name: z.string().max(160).optional().or(z.literal("")),
  nif: z.string().max(20).optional().or(z.literal("")),
  email: z.string().email("Email inválido").or(z.literal("")).optional(),
  phone: z.string().max(30).optional().or(z.literal("")),
  phone_alt: z.string().max(30).optional().or(z.literal("")),
  address: z.string().max(255).optional().or(z.literal("")),
  city: z.string().max(100).optional().or(z.literal("")),
  postal_code: z.string().max(10).optional().or(z.literal("")),
  iban_last4: z.string().length(4).optional().or(z.literal("")),
  birthday: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
});

type FormData = z.infer<typeof schema>;

export function PersonForm({ person }: { person?: Person }) {
  const router = useRouter();
  const save = useSavePerson(person?.id);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: person
      ? {
          type: (person.type as FormData["type"]) ?? "tenant",
          first_name: person.first_name,
          last_name: person.last_name ?? "",
          nif: person.nif ?? "",
          email: person.email ?? "",
          phone: person.phone ?? "",
          phone_alt: person.phone_alt ?? "",
          address: person.address ?? "",
          city: person.city ?? "",
          postal_code: person.postal_code ?? "",
          iban_last4: person.iban_last4 ?? "",
          birthday: person.birthday ?? "",
          notes: person.notes ?? "",
        }
      : { type: "tenant", city: "Valencia" },
  });

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    const cleaned = Object.fromEntries(
      Object.entries(data).filter(([, v]) => v !== "" && v !== undefined),
    );
    const saved = await save.mutateAsync(cleaned);
    router.push(`/personas/${saved.id}`);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Card className="p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="Tipo *">
            <NativeSelect {...register("type")}>
              <option value="tenant">Arrendatario</option>
              <option value="owner">Propietario</option>
              <option value="both">Mixto</option>
              <option value="prospect">Prospecto</option>
            </NativeSelect>
          </Field>
          <Field label="Nombre *" error={errors.first_name?.message}>
            <Input {...register("first_name")} />
          </Field>
          <Field label="Apellidos">
            <Input {...register("last_name")} />
          </Field>

          <Field label="NIF / DNI / NIE">
            <Input {...register("nif")} placeholder="12345678A" />
          </Field>
          <Field label="Email" error={errors.email?.message}>
            <Input type="email" {...register("email")} />
          </Field>
          <Field label="Teléfono">
            <Input {...register("phone")} placeholder="+34 6XX XXX XXX" />
          </Field>

          <Field label="Dirección" className="sm:col-span-2">
            <Input {...register("address")} />
          </Field>
          <Field label="Ciudad">
            <Input {...register("city")} />
          </Field>

          <Field label="C.P.">
            <Input {...register("postal_code")} />
          </Field>
          <Field label="IBAN (últimos 4)" hint="solo referencia">
            <Input {...register("iban_last4")} maxLength={4} />
          </Field>
          <Field label="Cumpleaños">
            <Input type="date" {...register("birthday")} />
          </Field>
        </div>

        <div className="mt-4">
          <Field label="Notas internas">
            <Textarea rows={4} {...register("notes")} />
          </Field>
        </div>
      </Card>

      <div className="flex items-center justify-end gap-2">
        <Button type="button" variant="ghost" onClick={() => router.back()}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting || save.isPending}>
          {save.isPending ? "Guardando..." : person ? "Guardar cambios" : "Crear persona"}
        </Button>
      </div>
    </form>
  );
}
