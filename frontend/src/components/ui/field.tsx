import { cn } from "@/lib/utils";

export function Field({
  label,
  hint,
  error,
  className,
  children,
}: {
  label?: string;
  hint?: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={cn("flex flex-col gap-1.5", className)}>
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
