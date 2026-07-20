import { cn } from "./cn";

export default function Card({
  className,
  children,
  as: Tag = "div",
  interactive,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  as?: React.ElementType;
  interactive?: boolean;
}) {
  return (
    <Tag
      className={cn(
        "bg-[var(--surface)] border border-[var(--line)] rounded-[var(--r-lg)] shadow-[var(--sh-sm)]",
        interactive &&
          "transition-all hover:border-[var(--line-2)] hover:-translate-y-0.5 cursor-pointer",
        className
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}

export function CardHeader({
  title,
  subtitle,
  action,
  className,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-start justify-between gap-4 p-5 pb-0", className)}>
      <div className="min-w-0">
        <h3 className="t-h3 text-[var(--text)] truncate">{title}</h3>
        {subtitle && <p className="t-caption text-[var(--muted)] mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function CardBody({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("p-5", className)}>{children}</div>;
}
