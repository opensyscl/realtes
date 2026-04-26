"use client";

import { useState } from "react";
import {
  type UseFormReturn,
  type Path,
  type FieldValues,
  Controller,
} from "react-hook-form";
import {
  UserCircleIcon,
  Search01Icon,
  Cancel01Icon,
  CheckmarkCircle02Icon,
} from "@hugeicons/core-free-icons";

import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Icon } from "@/components/ui/icon";
import { Avatar } from "@/components/ui/avatar";
import { usePersons } from "@/lib/queries";
import { cn } from "@/lib/utils";

export function StepOwner<TForm extends FieldValues>({
  form,
}: {
  form: UseFormReturn<TForm>;
}) {
  const { control } = form;
  const f = (name: string) => name as Path<TForm>;
  const [search, setSearch] = useState("");

  // type=owner; permitimos también "both" porque algunas personas son ambos roles.
  const { data, isLoading } = usePersons({
    type: "owner",
    search: search || undefined,
    per_page: 20,
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-soft text-primary">
          <Icon icon={UserCircleIcon} size={18} />
        </span>
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Dueño</h2>
          <p className="text-xs text-foreground-muted">
            La persona propietaria de la propiedad. Aparecerá en contratos.
          </p>
        </div>
      </div>

      <Controller
        control={control}
        name={f("owner_person_id")}
        render={({ field }) => {
          const selectedId = field.value as number | null | undefined;
          const selected = data?.data.find((p) => p.id === selectedId);

          return (
            <div className="space-y-4">
              {selected && (
                <div className="flex items-center gap-3 rounded-2xl border border-primary bg-primary-soft/30 p-4">
                  <Avatar name={selected.full_name} size="md" />
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold">{selected.full_name}</div>
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

              <Field label={selected ? "Cambiar dueño" : "Buscar dueño"}>
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Nombre, email o RUT/NIF..."
                  leading={<Icon icon={Search01Icon} size={13} />}
                />
              </Field>

              <div className="max-h-[420px] space-y-1 overflow-y-auto rounded-2xl border border-border-subtle bg-surface-muted/30 p-1">
                {isLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-14 animate-pulse rounded-xl bg-surface-muted"
                    />
                  ))
                ) : (data?.data.length ?? 0) === 0 ? (
                  <div className="px-4 py-6 text-center text-xs text-foreground-muted">
                    No se encontraron propietarios.
                    {search && " Intenta con otro término."}
                  </div>
                ) : (
                  data?.data.map((p) => {
                    const active = p.id === selectedId;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => field.onChange(p.id)}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
                          active
                            ? "bg-primary-soft/40"
                            : "hover:bg-surface",
                        )}
                      >
                        <Avatar name={p.full_name} size="sm" />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="truncate text-sm font-medium">
                              {p.full_name}
                            </span>
                            {active && (
                              <Icon
                                icon={CheckmarkCircle02Icon}
                                size={12}
                                className="text-primary"
                              />
                            )}
                          </div>
                          <div className="truncate text-[11px] text-foreground-muted">
                            {p.email ?? "Sin email"}
                            {p.phone && ` · ${p.phone}`}
                          </div>
                        </div>
                        {(p.owned_count ?? 0) > 0 && (
                          <span className="rounded-full bg-surface-muted px-2 py-0.5 text-[10px] tabular-numbers text-foreground-muted">
                            {p.owned_count} {p.owned_count === 1 ? "propiedad" : "propiedades"}
                          </span>
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          );
        }}
      />
    </div>
  );
}
