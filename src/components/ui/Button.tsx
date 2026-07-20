"use client";

import { forwardRef } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "./cn";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "subtle";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 font-medium rounded-[var(--r)] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none select-none whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-bright)]/50";

const variants: Record<Variant, string> = {
  primary:
    "bg-[var(--brand)] hover:bg-[var(--brand-600)] text-white shadow-[var(--glow-brand)] hover:-translate-y-px active:translate-y-0",
  secondary:
    "bg-[var(--surface-3)] hover:bg-[var(--surface-2)] text-[var(--text)] border border-[var(--line-2)]",
  ghost:
    "bg-transparent hover:bg-[var(--surface-3)] text-[var(--muted)] hover:text-[var(--text)]",
  danger:
    "bg-[var(--rose-tint)] hover:bg-[var(--rose)]/25 text-[var(--rose)] border border-[var(--rose)]/25",
  subtle:
    "bg-[var(--brand-tint)] hover:bg-[var(--brand)]/20 text-[var(--brand-bright)] border border-[var(--brand)]/20",
};

const sizes: Record<Size, string> = {
  sm: "text-[0.8125rem] px-3 py-2",
  md: "text-sm px-4 py-2.5",
  lg: "text-sm px-5 py-3.5",
};

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", loading, fullWidth, icon, className, children, disabled, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(base, variants[variant], sizes[size], fullWidth && "w-full", className)}
      {...props}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : icon}
      {children}
    </button>
  );
});

export default Button;

/** Icon-only button — pass an aria-label. */
export const IconButton = forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }
>(function IconButton({ variant = "ghost", className, children, ...props }, ref) {
  return (
    <button
      ref={ref}
      className={cn(
        base,
        variants[variant],
        "p-2 rounded-[var(--r-sm)]",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
});
