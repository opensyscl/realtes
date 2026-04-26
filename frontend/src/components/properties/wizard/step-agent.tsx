"use client";

import {
  type UseFormReturn,
  type Path,
  type FieldValues,
  Controller,
} from "react-hook-form";
import {
  Agreement02Icon,
  CheckmarkCircle02Icon,
} from "@hugeicons/core-free-icons";

import { Field } from "@/components/ui/field";
import { Icon } from "@/components/ui/icon";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAgencyMembers } from "@/lib/queries";
import { cn } from "@/lib/utils";

export function StepAgent<TForm extends FieldValues>({
  form,
}: {
  form: UseFormReturn<TForm>;
}) {
  const { control } = form;
  const f = (name: string) => name as Path<TForm>;
  const { data: members, isLoading } = useAgencyMembers();

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-soft text-primary">
          <Icon icon={Agreement02Icon} size={18} />
        </span>
        <div>
          <h2 className="text-lg font-semibold tracking-tight">
            Agente responsable
          </h2>
          <p className="text-xs text-foreground-muted">
            Quién gestiona esta propiedad. Recibirá los leads y notificaciones.
          </p>
        </div>
      </div>

      <Controller
        control={control}
        name={f("agent_user_id")}
        render={({ field }) => {
          const selectedId = field.value as number | null | undefined;

          return (
            <Field label="Asignar a">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {/* Opción "sin asignar" */}
                <button
                  type="button"
                  onClick={() => field.onChange(null)}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl border p-3 text-left transition-colors",
                    !selectedId
                      ? "border-primary bg-primary-soft/40"
                      : "border-border-subtle bg-surface hover:bg-surface-muted/40",
                  )}
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface-muted text-foreground-muted">
                    —
                  </span>
                  <div className="flex-1">
                    <div className="text-sm font-medium">Sin asignar</div>
                    <div className="text-[11px] text-foreground-muted">
                      Sin agente responsable
                    </div>
                  </div>
                  {!selectedId && (
                    <Icon
                      icon={CheckmarkCircle02Icon}
                      size={14}
                      className="text-primary"
                    />
                  )}
                </button>

                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-16 animate-pulse rounded-2xl bg-surface-muted/50"
                    />
                  ))
                ) : (
                  members?.map((m) => {
                    const active = m.id === selectedId;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => field.onChange(m.id)}
                        className={cn(
                          "flex items-center gap-3 rounded-2xl border p-3 text-left transition-colors",
                          active
                            ? "border-primary bg-primary-soft/40"
                            : "border-border-subtle bg-surface hover:bg-surface-muted/40",
                        )}
                      >
                        <Avatar name={m.name} src={m.avatar_url ?? undefined} size="md" />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="truncate text-sm font-medium">
                              {m.name}
                            </span>
                            {active && (
                              <Icon
                                icon={CheckmarkCircle02Icon}
                                size={12}
                                className="text-primary"
                              />
                            )}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Badge variant="neutral" className="text-[9px] capitalize">
                              {m.role}
                            </Badge>
                            <span className="truncate text-[10px] text-foreground-muted">
                              {m.email}
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </Field>
          );
        }}
      />
    </div>
  );
}
