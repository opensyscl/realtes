"use client";

import { use, useState } from "react";

import { Card } from "@/components/ui/card";
import {
  usePublicProperty,
  useSendPublicLead,
  usePublicAgency,
} from "@/lib/queries-public";
import { TemplateRenderer } from "@/components/public/template-renderer";

export default function PublicPropertyDetailPage({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}) {
  const { slug, id } = use(params);
  const { data: agency } = usePublicAgency(slug);
  const { data: p, isLoading } = usePublicProperty(slug, id);
  const send = useSendPublicLead(slug);
  const [submitError, setSubmitError] = useState<string | undefined>();

  if (isLoading || !agency) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-10">
        <Card className="h-[420px] animate-pulse bg-surface-muted/50" />
      </div>
    );
  }

  if (!p) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-10 text-center text-foreground-muted">
        Propiedad no encontrada o no disponible.
      </div>
    );
  }

  const handleSubmit = async (data: {
    name: string;
    email: string;
    phone?: string;
    message?: string;
  }) => {
    setSubmitError(undefined);
    try {
      const r = await send.mutateAsync({
        ...data,
        property_id: Number(id),
      });
      return r;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error enviando solicitud";
      setSubmitError(msg);
      throw err;
    }
  };

  return (
    <TemplateRenderer
      property={p}
      agency={agency}
      template={agency.template}
      onSubmitLead={handleSubmit}
      isSubmitting={send.isPending}
      submitError={submitError}
    />
  );
}
