import { cn } from "./cn";

type Tone = "brand" | "neutral" | "success" | "warning" | "danger" | "info";

const tones: Record<Tone, string> = {
  brand: "bg-[var(--brand-tint)] text-[var(--brand-bright)]",
  neutral: "bg-[var(--surface-3)] text-[var(--muted)]",
  success: "bg-[var(--mint-tint)] text-[var(--brand-bright)]",
  warning: "bg-[var(--gold-tint)] text-[var(--gold)]",
  danger: "bg-[var(--rose-tint)] text-[var(--rose)]",
  info: "bg-[var(--brand-tint)] text-[var(--brand-bright)]",
};

export default function Badge({
  tone = "neutral",
  children,
  className,
  dot,
}: {
  tone?: Tone;
  children: React.ReactNode;
  className?: string;
  dot?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-[var(--r-pill)] px-2.5 py-1 t-micro font-medium uppercase tracking-wide",
        tones[tone],
        className
      )}
    >
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}
