import { useId } from "react";
import { cn } from "./cn";

/**
 * Wraps a labeled form control with optional hint + inline error.
 * Pass a render function so the control receives the generated id + invalid state.
 */
export default function Field({
  label,
  hint,
  error,
  required,
  className,
  children,
}: {
  label?: string;
  hint?: string;
  error?: string | null;
  required?: boolean;
  className?: string;
  children: (props: { id: string; invalid: boolean }) => React.ReactNode;
}) {
  const id = useId();
  const invalid = !!error;
  return (
    <div className={cn("space-y-1.5", className)}>
      {label && (
        <label htmlFor={id} className="block t-small font-medium text-[var(--text)]">
          {label}
          {required && <span className="text-[var(--rose)] ml-0.5">*</span>}
        </label>
      )}
      {children({ id, invalid })}
      {error ? (
        <p className="t-caption text-[var(--rose)]">{error}</p>
      ) : hint ? (
        <p className="t-caption text-[var(--muted)]">{hint}</p>
      ) : null}
    </div>
  );
}
