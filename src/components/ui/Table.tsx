import { cn } from "./cn";

export function Table({
  columns,
  children,
  className,
  caption,
}: {
  columns: React.ReactNode[];
  children: React.ReactNode;
  className?: string;
  caption?: string;
}) {
  return (
    <div className="overflow-x-auto -mx-1 px-1">
      <table className={cn("w-full border-collapse", className)}>
        {caption && <caption className="sr-only">{caption}</caption>}
        <thead>
          <tr className="border-b border-[var(--line)]">
            {columns.map((c, i) => (
              <th
                key={i}
                scope="col"
                className="text-left t-micro font-medium uppercase tracking-wide text-[var(--muted)] py-3 px-3 whitespace-nowrap"
              >
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export function Tr({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <tr className={cn("border-b border-[var(--line)] last:border-0 hover:bg-[var(--surface-2)]/50 transition-colors", className)}>
      {children}
    </tr>
  );
}

export function Td({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={cn("py-3 px-3 t-small text-[var(--text)] align-middle", className)}>{children}</td>;
}
