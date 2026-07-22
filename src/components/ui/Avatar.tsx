import { cn } from "./cn";

function initials(name?: string) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "?";
}

const tints = [
  "var(--brand)",
  "var(--brand-600)",
  "var(--brand-bright)",
  "#1f7a4c",
  "#2f8f5e",
];

function tintFor(name?: string) {
  if (!name) return tints[0];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return tints[h % tints.length];
}

export default function Avatar({
  name,
  src,
  size = 40,
  className,
}: {
  name?: string;
  src?: string;
  size?: number;
  className?: string;
}) {
  if (src) {
    return (
      <img
        src={src}
        alt={name ?? "avatar"}
        width={size}
        height={size}
        className={cn("rounded-full object-cover border border-[var(--line-2)]", className)}
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <span
      aria-hidden
      className={cn(
        "inline-grid place-items-center rounded-full text-white font-medium shrink-0",
        className
      )}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.38,
        background: `linear-gradient(140deg, ${tintFor(name)}, var(--brand-600))`,
      }}
    >
      {initials(name)}
    </span>
  );
}
