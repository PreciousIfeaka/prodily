import { cn } from "./cn";

export default function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center rounded-[var(--r-lg)] border border-dashed border-[var(--line-2)] bg-[var(--surface-2)]/40 px-6 py-12",
        className
      )}
    >
      {icon && (
        <span className="grid place-items-center w-12 h-12 rounded-full bg-[var(--surface-3)] text-[var(--brand-bright)] mb-4">
          {icon}
        </span>
      )}
      <h3 className="t-h3 text-[var(--text)]">{title}</h3>
      {description && (
        <p className="t-small text-[var(--muted)] mt-1.5 max-w-sm">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
