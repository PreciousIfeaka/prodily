import { cn } from "./cn";

export default function StatCard({
  label,
  value,
  icon,
  hint,
  tone = "default",
  className,
}: {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
  hint?: React.ReactNode;
  tone?: "default" | "brand";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "bg-[var(--surface)] border border-[var(--line)] rounded-[var(--r-lg)] p-5 flex items-center gap-4 shadow-[var(--sh-sm)]",
        className
      )}
    >
      {icon && (
        <span
          className={cn(
            "grid place-items-center w-11 h-11 rounded-[var(--r)] shrink-0",
            tone === "brand"
              ? "bg-[var(--brand-tint)] text-[var(--brand-bright)]"
              : "bg-[var(--surface-3)] text-[var(--muted)]"
          )}
        >
          {icon}
        </span>
      )}
      <div className="min-w-0">
        <div className="t-caption text-[var(--muted)] font-medium">{label}</div>
        <div className="t-h2 text-[var(--text)] mt-0.5 truncate">{value}</div>
        {hint && <div className="t-caption text-[var(--faint)] mt-0.5">{hint}</div>}
      </div>
    </div>
  );
}
