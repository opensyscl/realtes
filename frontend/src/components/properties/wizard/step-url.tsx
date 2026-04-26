"use client";

import {
  type UseFormReturn,
  type Path,
  type FieldValues,
} from "react-hook-form";
import { Video01Icon, VrIcon } from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";

import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Icon } from "@/components/ui/icon";

interface Variant {
  fieldName: string;
  title: string;
  subtitle: string;
  icon: IconSvgElement;
  placeholder: string;
  hint: string;
}

const VARIANTS: Record<"video" | "tour", Variant> = {
  video: {
    fieldName: "video_url",
    title: "Video",
    subtitle: "URL de YouTube o Vimeo. Se embebe automáticamente en el escaparate.",
    icon: Video01Icon,
    placeholder: "https://youtu.be/...",
    hint: "Acepta links cortos (youtu.be/X) o completos (youtube.com/watch?v=X)",
  },
  tour: {
    fieldName: "tour_url",
    title: "Tour Virtual 360°",
    subtitle: "URL de Matterport, Kuula u otra plataforma de tour 3D.",
    icon: VrIcon,
    placeholder: "https://my.matterport.com/show/?m=...",
    hint: "Si está presente, tendrá prioridad sobre el video en el escaparate",
  },
};

export function StepUrl<TForm extends FieldValues>({
  form,
  variant,
}: {
  form: UseFormReturn<TForm>;
  variant: "video" | "tour";
}) {
  const v = VARIANTS[variant];
  const {
    register,
    formState: { errors },
    watch,
  } = form;
  const f = (name: string) => name as Path<TForm>;
  const errs = errors as Record<string, { message?: string } | undefined>;
  const value = watch(f(v.fieldName)) as unknown as string | undefined;

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-soft text-primary">
          <Icon icon={v.icon} size={18} />
        </span>
        <div>
          <h2 className="text-lg font-semibold tracking-tight">{v.title}</h2>
          <p className="text-xs text-foreground-muted">{v.subtitle}</p>
        </div>
      </div>

      <Field
        label={`URL del ${variant === "video" ? "video" : "tour"}`}
        hint={v.hint}
        error={errs[v.fieldName]?.message}
      >
        <Input
          type="url"
          {...register(f(v.fieldName))}
          placeholder={v.placeholder}
        />
      </Field>

      {value && (
        <div className="rounded-3xl border border-border-subtle bg-surface-muted/40 p-1">
          <div className="aspect-video w-full overflow-hidden rounded-[20px] bg-foreground/5">
            <iframe
              src={
                variant === "tour"
                  ? value
                  : embedYoutube(value) || embedVimeo(value) || value
              }
              className="h-full w-full"
              allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; xr-spatial-tracking"
              allowFullScreen
              loading="lazy"
              title="Preview"
            />
          </div>
        </div>
      )}
    </div>
  );
}

function embedYoutube(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) {
      return `https://www.youtube.com/embed${u.pathname}`;
    }
    if (u.hostname.includes("youtube.com")) {
      const v = u.searchParams.get("v");
      return v ? `https://www.youtube.com/embed/${v}` : null;
    }
    return null;
  } catch {
    return null;
  }
}

function embedVimeo(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("vimeo.com")) {
      return `https://player.vimeo.com/video${u.pathname}`;
    }
    return null;
  } catch {
    return null;
  }
}
