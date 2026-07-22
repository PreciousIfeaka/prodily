import { cn } from "./cn";

/**
 * Prodily brand logo. Renders the official brand assets from /public:
 *  - mark only            → /prodily-mark.png
 *  - full lockup (+word)  → /prodily-logo.png
 *
 * `size` is the rendered height in px; width is derived from each asset's
 * intrinsic (trimmed) aspect ratio so there is no layout shift.
 */
const LOCKUP_RATIO = 426 / 120;
const MARK_RATIO = 93 / 120;

export default function Logo({
  size = 40,
  withWordmark = false,
  subtitle,
  className,
}: {
  size?: number;
  withWordmark?: boolean;
  subtitle?: string;
  className?: string;
}) {
  if (!withWordmark) {
    return (
      <span className={cn("inline-flex", className)}>
        <img
          src="/prodily-mark.png"
          alt="Prodily"
          width={Math.round(size * MARK_RATIO)}
          height={size}
          className="shrink-0 select-none"
          draggable={false}
        />
      </span>
    );
  }

  return (
    <span className={cn("inline-flex flex-col gap-1.5", className)}>
      <img
        src="/prodily-logo.png"
        alt="Prodily"
        width={Math.round(size * LOCKUP_RATIO)}
        height={size}
        className="shrink-0 select-none"
        draggable={false}
      />
      {subtitle && (
        <span className="t-micro text-[var(--muted)] font-medium uppercase tracking-wider">
          {subtitle}
        </span>
      )}
    </span>
  );
}
