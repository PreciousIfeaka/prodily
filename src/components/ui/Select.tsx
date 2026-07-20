"use client";

import { forwardRef } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "./cn";

const Select = forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement> & { invalid?: boolean }
>(function Select({ className, invalid, children, ...props }, ref) {
  return (
    <div className="relative">
      <select
        ref={ref}
        aria-invalid={invalid || undefined}
        className={cn(
          "w-full appearance-none bg-[var(--surface-2)] border rounded-[var(--r)] pl-4 pr-10 py-2.5 text-sm text-[var(--text)] outline-none transition-colors focus:border-[var(--brand)] focus:bg-[var(--surface)] disabled:opacity-60 cursor-pointer",
          invalid ? "border-[var(--rose)]" : "border-[var(--line-2)]",
          className
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" />
    </div>
  );
});

export default Select;
