"use client";

import { cn } from "./cn";

export type TabItem = { key: string; label: string; count?: number; icon?: React.ReactNode };

export default function Tabs({
  tabs,
  active,
  onChange,
  className,
}: {
  tabs: TabItem[];
  active: string;
  onChange: (key: string) => void;
  className?: string;
}) {
  return (
    <div
      role="tablist"
      className={cn(
        "inline-flex items-center gap-1 p-1 rounded-[var(--r)] bg-[var(--surface-2)] border border-[var(--line)]",
        className
      )}
    >
      {tabs.map((t) => {
        const isActive = t.key === active;
        return (
          <button
            key={t.key}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(t.key)}
            className={cn(
              "inline-flex items-center gap-2 px-3.5 py-2 rounded-[var(--r-sm)] t-small font-medium transition-all cursor-pointer",
              isActive
                ? "bg-[var(--surface-3)] text-[var(--text)] shadow-[var(--sh-sm)]"
                : "text-[var(--muted)] hover:text-[var(--text)]"
            )}
          >
            {t.icon}
            {t.label}
            {typeof t.count === "number" && (
              <span
                className={cn(
                  "min-w-5 h-5 grid place-items-center px-1.5 rounded-full t-micro font-medium",
                  isActive
                    ? "bg-[var(--brand-tint)] text-[var(--brand-bright)]"
                    : "bg-[var(--surface-3)] text-[var(--muted)]"
                )}
              >
                {t.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
