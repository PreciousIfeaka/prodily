"use client";

import { AlertTriangle } from "lucide-react";
import { fraudFlags, formatNairaShort } from "@/lib/data";
import { useAdmin } from "@/components/AdminContext";
import { useToast } from "@/components/Toast";
import { PageHeader, Card, StatCard, Badge, Button } from "@/components/ui";

export default function FraudPage() {
  const { fraudStatuses: statuses, setFraudStatus, pendingFraudCount, pendingFraudAmount } = useAdmin();
  const { toast } = useToast();

  const act = (id: number, label: "Cleared" | "Blocked") => {
    setFraudStatus(id, label);
    toast(`Reward ${label.toLowerCase()} · audit log updated`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fraud Cases"
        subtitle="Review and action flagged transactions."
        action={<Badge tone="warning">Sample data</Badge>}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard label="Pending review" value={pendingFraudCount} />
        <StatCard label="Amount held" value={formatNairaShort(pendingFraudAmount)} />
        <StatCard label="Clean rate" value="99.4%" tone="brand" />
      </div>

      <Card className="p-6">
        <h3 className="t-h3 text-[var(--text)] mb-4">Flagged transactions · pending review</h3>
        <div className="space-y-3">
          {fraudFlags.map((f) => {
            const status = statuses[f.id];
            return (
              <div
                key={f.id}
                className="rounded-[var(--r)] p-4 bg-[var(--surface-2)] border border-[var(--line)]"
                style={{ borderLeft: "3px solid var(--rose)" }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-[42px] h-[42px] rounded-[var(--r-sm)] bg-[var(--rose-tint)] grid place-items-center flex-shrink-0 text-[var(--rose)]">
                    <AlertTriangle size={21} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <b className="t-small text-[var(--text)] block">{f.title}</b>
                    <div className="t-caption text-[var(--muted)]">{f.subtitle}</div>
                  </div>
                  {status ? (
                    <Badge tone={status === "Cleared" ? "success" : "danger"}>{status}</Badge>
                  ) : (
                    <div className="flex gap-2 flex-shrink-0">
                      <Button size="sm" onClick={() => act(f.id, "Cleared")}>Clear</Button>
                      <Button size="sm" variant="danger" onClick={() => act(f.id, "Blocked")}>Block</Button>
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {f.reasons.map((r) => (
                    <Badge key={r} tone="danger">{r}</Badge>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
