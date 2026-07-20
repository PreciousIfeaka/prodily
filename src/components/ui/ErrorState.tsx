"use client";

import { AlertTriangle, RotateCw } from "lucide-react";
import Button from "./Button";
import { cn } from "./cn";

/** Visible, retryable load-failure state — replaces silent console.error catches. */
export default function ErrorState({
  title = "Something went wrong",
  message = "We couldn't load this content. Please try again.",
  onRetry,
  className,
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center rounded-[var(--r-lg)] border border-[var(--line-2)] bg-[var(--surface-2)]/50 px-6 py-12",
        className
      )}
    >
      <span className="grid place-items-center w-12 h-12 rounded-full bg-[var(--rose-tint)] text-[var(--rose)] mb-4">
        <AlertTriangle className="w-6 h-6" />
      </span>
      <h3 className="t-h3 text-[var(--text)]">{title}</h3>
      <p className="t-small text-[var(--muted)] mt-1.5 max-w-sm">{message}</p>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry} icon={<RotateCw className="w-4 h-4" />} className="mt-5">
          Retry
        </Button>
      )}
    </div>
  );
}
