import { Check } from "lucide-react";
import { cn } from "./cn";

/** Horizontal progress indicator for multi-step flows (e.g. signup). */
export default function Stepper({
  steps,
  current,
  className,
}: {
  steps: string[];
  current: number; // 0-based index of the active step
  className?: string;
}) {
  return (
    <ol className={cn("flex items-center gap-2", className)}>
      {steps.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li key={label} className="flex items-center gap-2 flex-1 last:flex-none">
            <span
              className={cn(
                "grid place-items-center w-7 h-7 rounded-full t-caption font-medium shrink-0 border transition-colors",
                done && "bg-[var(--brand)] border-[var(--brand)] text-white",
                active && "bg-[var(--brand-tint)] border-[var(--brand)] text-[var(--brand-bright)]",
                !done && !active && "bg-[var(--surface-2)] border-[var(--line-2)] text-[var(--faint)]"
              )}
            >
              {done ? <Check className="w-3.5 h-3.5" /> : i + 1}
            </span>
            <span
              className={cn(
                "t-small font-medium whitespace-nowrap",
                active ? "text-[var(--text)]" : "text-[var(--muted)]"
              )}
            >
              {label}
            </span>
            {i < steps.length - 1 && (
              <span
                className={cn(
                  "h-px flex-1 min-w-4 mx-1",
                  done ? "bg-[var(--brand)]" : "bg-[var(--line-2)]"
                )}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
