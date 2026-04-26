"use client";

import Link from "next/link";
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";
import { PersonForm } from "@/components/persons/person-form";

export default function NewPersonPage() {
  return (
    <div className="px-6 py-6">
      <div className="mb-6">
        <Link
          href="/personas"
          className="inline-flex items-center gap-1.5 text-xs text-foreground-muted hover:text-foreground"
        >
          <Icon icon={ArrowLeft01Icon} size={13} /> Volver a personas
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Nueva persona</h1>
      </div>
      <PersonForm />
    </div>
  );
}
