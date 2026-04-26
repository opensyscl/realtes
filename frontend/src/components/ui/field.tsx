import { cn } from "@/lib/utils";

export function Field({
  label,
  hint,
  error,
  className,
  dataField,
  children,
}: {
  label?: string;
  hint?: string;
  error?: string;
  className?: string;
  /** Identificador estable para localizar este campo desde otros componentes (smart-bar). */
  dataField?: string;
  children: React.ReactNode;
}) {
  return (
    <label
      data-field={dataField}
      className={cn(
        "relative flex flex-col gap-1.5 rounded-2xl transition-shadow duration-300",
        // Highlight transitorio cuando el smart-bar lo enfoca
        "data-[wizard-highlight=true]:ring-4 data-[wizard-highlight=true]:ring-warning data-[wizard-highlight=true]:ring-offset-4 data-[wizard-highlight=true]:ring-offset-background",
        "data-[wizard-highlight=true]:animate-pulse",
        className,
      )}
    >
      {label && (
        <span className="text-xs font-medium text-foreground-muted">{label}</span>
      )}
      {children}
      {hint && !error && (
        <span className="text-[11px] text-muted-foreground">{hint}</span>
      )}
      {error && <span className="text-[11px] text-negative">{error}</span>}
    </label>
  );
}
