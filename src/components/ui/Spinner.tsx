import { cn } from "./cn";

export default function Spinner({
  size = 20,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <span
      role="status"
      aria-label="Loading"
      style={{ width: size, height: size, borderWidth: Math.max(2, size / 10) }}
      className={cn(
        "inline-block rounded-full border-[var(--line-2)] border-t-[var(--brand-bright)] animate-spin",
        className
      )}
    />
  );
}
