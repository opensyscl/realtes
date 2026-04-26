"use client";

import { use } from "react";

import { Card } from "@/components/ui/card";
import { useProperty } from "@/lib/queries";
import { PropertyWizard } from "@/components/properties/wizard/property-wizard";

export default function EditPropertyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: property, isLoading } = useProperty(id);

  if (isLoading || !property) {
    return (
      <div className="px-6 py-6">
        <Card className="h-72 animate-pulse bg-surface-muted/50" />
      </div>
    );
  }

  return <PropertyWizard property={property} />;
}
