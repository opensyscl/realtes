"use client";

import { useMemo } from "react";
import { SearchIcon } from "lucide-react";
import {
  type UseFormReturn,
  type Path,
  type FieldValues,
  Controller,
} from "react-hook-form";
import {
  UserCircleIcon,
  Cancel01Icon,
  CheckmarkCircle02Icon,
} from "@hugeicons/core-free-icons";

import { Field } from "@/components/ui/field";
import { Icon } from "@/components/ui/icon";
import { Avatar } from "@/components/ui/avatar";
import {
  Combobox,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxPopup,
  ComboboxTrigger,
  ComboboxValue,
} from "@/components/ui/combobox";
import { SelectButton } from "@/components/ui/select";
import { usePersons } from "@/lib/queries";

interface PersonItem {
  value: number | null;
  label: string;
  email?: string | null;
  phone?: string | null;
}

const NONE: PersonItem = { value: null, label: "— Ninguno —" };

export function StepClient<TForm extends FieldValues>({
  form,
}: {
  form: UseFormReturn<TForm>;
}) {
  const { control } = form;
  const f = (name: string) => name as Path<TForm>;

  // Acepta también "both" porque hay personas que son owner y tenant a la vez
  const { data, isLoading } = usePersons({ per_page: 200 });

  const items = useMemo<PersonItem[]>(() => {
    const persons = (data?.data ?? []).map((p) => ({
      value: p.id,
      label: p.full_name || `${p.first_name} ${p.last_name ?? ""}`.trim(),
      email: p.email,
      phone: p.phone,
    }));
    return [NONE, ...persons];
  }, [data]);

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-soft text-primary">
          <Icon icon={UserCircleIcon} size={18} />
        </span>
        <div>
          <h2 className="text-lg font-semibold tracking-tight">
            Asignar propiedad a cliente
          </h2>
          <p className="text-xs text-foreground-muted">
            Selecciona el cliente asociado a esta propiedad (interesado, reservado,
            futuro arrendatario).
          </p>
        </div>
      </div>

      <Controller
        control={control}
        name={f("client_person_id")}
        render={({ field }) => {
          const selectedId = field.value as number | null | undefined;
          const selected = items.find((i) => i.value === selectedId) ?? NONE;
          const personsOnly = items.filter((i) => i.value !== null);
          const hasPersons = personsOnly.length > 0;

          return (
            <div className="space-y-4">
              <Field label="Cliente">
                <Combobox<PersonItem>
                  items={items}
                  value={selected}
                  onValueChange={(v) =>
                    field.onChange((v as PersonItem | null)?.value ?? null)
                  }
                  itemToStringLabel={(i) => i?.label ?? ""}
                >
                  <ComboboxTrigger render={<SelectButton />}>
                    <ComboboxValue placeholder="Seleccionar cliente...">
                      {selected.value === null ? (
                        <span className="text-foreground-muted">
                          — Ninguno —
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <span className="truncate">{selected.label}</span>
                          {selected.email && (
                            <span className="text-foreground-muted">
                              ({selected.email})
                            </span>
                          )}
                        </span>
                      )}
                    </ComboboxValue>
                  </ComboboxTrigger>

                  <ComboboxPopup aria-label="Seleccionar cliente">
                    <div className="border-b p-2">
                      <ComboboxInput
                        placeholder="Buscar cliente por nombre o email..."
                        showTrigger={false}
                        startAddon={<SearchIcon className="size-4" />}
                      />
                    </div>
                    <ComboboxEmpty>
                      {isLoading ? "Cargando..." : "Sin resultados"}
                    </ComboboxEmpty>
                    <ComboboxList>
                      {(item: PersonItem) => (
                        <ComboboxItem key={item.value ?? "none"} value={item}>
                          {item.value === null ? (
                            <span className="text-foreground-muted">
                              — Ninguno —
                            </span>
                          ) : (
                            <span className="flex items-center gap-2">
                              <span className="font-medium">{item.label}</span>
                              {item.email && (
                                <span className="text-foreground-muted text-xs">
                                  ({item.email})
                                </span>
                              )}
                            </span>
                          )}
                        </ComboboxItem>
                      )}
                    </ComboboxList>
                  </ComboboxPopup>
                </Combobox>
              </Field>

              {/* Card del cliente seleccionado */}
              {selected.value !== null && (
                <div className="flex items-center gap-3 rounded-2xl border border-primary bg-primary-soft/30 p-4">
                  <Avatar name={selected.label} size="md" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold">{selected.label}</span>
                      <Icon
                        icon={CheckmarkCircle02Icon}
                        size={12}
                        className="text-primary"
                      />
                    </div>
                    <div className="text-[11px] text-foreground-muted">
                      {selected.email ?? "Sin email"}
                      {selected.phone && ` · ${selected.phone}`}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => field.onChange(null)}
                    className="rounded-xl p-2 text-foreground-muted hover:bg-negative-soft hover:text-negative"
                    aria-label="Quitar"
                  >
                    <Icon icon={Cancel01Icon} size={14} />
                  </button>
                </div>
              )}

              {!hasPersons && !isLoading && (
                <div className="rounded-2xl border border-info/20 bg-info-soft/40 p-3 text-xs text-info">
                  No tienes personas registradas. Crea una desde{" "}
                  <a
                    href="/personas"
                    className="font-medium underline"
                  >
                    /personas
                  </a>{" "}
                  para asignarla.
                </div>
              )}
            </div>
          );
        }}
      />
    </div>
  );
}
