import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Badge } from "@/components/ui/badge";
import type { IconSvgElement } from "@hugeicons/react";

interface Props {
  icon: IconSvgElement;
  eyebrow: string;
  title: string;
  description: string;
  features: { title: string; description: string }[];
}

export function ComingSoon({ icon, eyebrow, title, description, features }: Props) {
  return (
    <div className="px-6 py-6">
      <div className="mb-6">
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          <Icon icon={icon} size={13} />
          {eyebrow}
        </div>
        <div className="mt-1 flex items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          <Badge variant="warning">Próximamente</Badge>
        </div>
        <p className="mt-1 text-sm text-foreground-muted">{description}</p>
      </div>

      <Card className="p-10 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-muted text-foreground-muted">
          <Icon icon={icon} size={24} />
        </div>
        <h2 className="mt-4 text-lg font-semibold">Estamos trabajando en este módulo</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-foreground-muted">
          Esta sección está planificada para una de las próximas releases. Aquí va una vista
          previa de las funcionalidades que incluirá.
        </p>
      </Card>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => (
          <Card key={f.title} className="p-5">
            <div className="text-sm font-semibold">{f.title}</div>
            <div className="mt-1 text-xs text-foreground-muted">{f.description}</div>
          </Card>
        ))}
      </div>
    </div>
  );
}
