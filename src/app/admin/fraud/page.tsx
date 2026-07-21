"use client";

import { useEffect, useState, startTransition } from "react";
import { AlertTriangle, ShieldAlert } from "lucide-react";
import { getFraudAlertsAction, resolveFraudAlertAction } from "@/app/actions/wallet";
import { useToast } from "@/components/Toast";
import { PageHeader, Card, StatCard, Badge, Button, Spinner } from "@/components/ui";

export default function FraudPage() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getFraudAlertsAction();
      setAlerts(data);
    } catch (err) {
      console.error(err);
      toast("Failed to load fraud alerts.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleResolve = (id: string, status: "RESOLVED" | "FALSE_POSITIVE") => {
    startTransition(async () => {
      try {
        const res = await resolveFraudAlertAction(id, status);
        if (res.success) {
          toast(status === "FALSE_POSITIVE" ? "Alert cleared · request unblocked" : "Alert resolved · request blocked");
          loadData();
        } else {
          toast(res.error || "Failed to resolve alert.");
        }
      } catch {
        toast("Connection error.");
      }
    });
  };

  const pendingAlerts = alerts.filter(a => a.status === "PENDING_REVIEW");
  const pendingFraudCount = pendingAlerts.length;
  const pendingFraudAmount = pendingAlerts.reduce((sum, a) => sum + Number(a.metadata?.amount || a.amount || 0), 0);

  const formatType = (type: string) => {
    return type
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, c => c.toUpperCase());
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fraud Cases"
        subtitle="Review and action flagged transactions."
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard label="Pending review" value={pendingFraudCount} />
        <StatCard 
          label="Amount held" 
          value={pendingFraudAmount > 0 ? `₦${pendingFraudAmount.toLocaleString()}` : "₦0"} 
        />
        <StatCard label="Clean rate" value={alerts.length > 0 ? `${((1 - pendingFraudCount / alerts.length) * 100).toFixed(1)}%` : "100.0%"} tone="brand" />
      </div>

      <Card className="p-6">
        <h3 className="t-h3 text-[var(--text)] mb-4">Flagged transactions · pending review</h3>
        
        {loading ? (
          <div className="flex justify-center py-12">
            <Spinner size={28} />
          </div>
        ) : alerts.length === 0 ? (
          <div className="text-center py-12 text-[var(--muted)]">
            <ShieldAlert className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="t-small">No fraud cases logged yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map((f) => {
              const userLabel = f.user ? `${f.user.firstName} ${f.user.lastName}` : "System";
              const timeLabel = new Date(f.createdAt).toLocaleDateString(undefined, {
                hour: '2-digit',
                minute: '2-digit'
              });
              const amount = Number(f.metadata?.amount || 0);

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
                      <b className="t-small text-[var(--text)] block">{formatType(f.type)}</b>
                      <div className="t-caption text-[var(--muted)]">
                        {userLabel} · {f.description} {amount > 0 && `· ₦${amount.toLocaleString()}`} · {timeLabel}
                      </div>
                    </div>
                    {f.status !== "PENDING_REVIEW" ? (
                      <Badge tone={f.status === "FALSE_POSITIVE" ? "success" : "danger"}>
                        {f.status === "FALSE_POSITIVE" ? "Cleared" : "Blocked"}
                      </Badge>
                    ) : (
                      <div className="flex gap-2 flex-shrink-0">
                        <Button size="sm" onClick={() => handleResolve(f.id, "FALSE_POSITIVE")}>Clear</Button>
                        <Button size="sm" variant="danger" onClick={() => handleResolve(f.id, "RESOLVED")}>Block</Button>
                      </div>
                    )}
                  </div>
                  {f.metadata?.reason && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      <Badge tone="danger">{f.metadata.reason}</Badge>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
