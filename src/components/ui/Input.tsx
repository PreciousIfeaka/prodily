"use client";

import { forwardRef } from "react";
import { cn } from "./cn";

const fieldBase =
  "w-full bg-[var(--surface-2)] border rounded-[var(--r)] px-4 py-2.5 text-sm text-[var(--text)] placeholder:text-[var(--faint)] outline-none transition-colors focus:border-[var(--brand)] focus:bg-[var(--surface)] disabled:opacity-60";

export const Input = forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }
>(function Input({ className, invalid, ...props }, ref) {
  return (
    <input
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(
        fieldBase,
        invalid ? "border-[var(--rose)]" : "border-[var(--line-2)]",
        className
      )}
      {...props}
    />
  );
});

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }
>(function Textarea({ className, invalid, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(
        fieldBase,
        "resize-y min-h-[92px]",
        invalid ? "border-[var(--rose)]" : "border-[var(--line-2)]",
        className
      )}
      {...props}
    />
  );
});

export default Input;
