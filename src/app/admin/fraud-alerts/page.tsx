"use client";

import { useEffect, useState, startTransition } from "react";
import { getFraudAlertsAction, resolveFraudAlertAction } from "@/app/actions/wallet";
import { ShieldAlert, CheckCircle } from "lucide-react";
import { useToast } from "@/components/Toast";
import {
  PageHeader,
  Card,
  Badge,
  Button,
  Select,
  Table,
  Tr,
  Td,
  EmptyState,
  ErrorState,
  SkeletonCard,
} from "@/components/ui";

export default function FraudAlertsPage() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const { toast } = useToast();

  const loadAlerts = async () => {
    setLoading(true);
    setError(false);
    try {
      const result = await getFraudAlertsAction();
      if (result) setAlerts(result);
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  const handleResolveAlert = (alertId: string, status: "RESOLVED" | "FALSE_POSITIVE") => {
    startTransition(async () => {
      try {
        const res = await resolveFraudAlertAction(alertId, status);
        if (res.success) {
          toast(`Alert marked ${status.replace(/_/g, " ").toLowerCase()}.`);
          loadAlerts();
        } else {
          toast(res.error || "Failed to update alert.");
        }
      } catch {
        toast("Connection error.");
      }
    });
  };

  const filtered = statusFilter ? alerts.filter((a) => a.status === statusFilter) : alerts;
  const statusTone = (s: string) =>
    s === "RESOLVED" ? "success" : s === "FALSE_POSITIVE" ? "neutral" : "warning";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fraud Alerts"
        subtitle="Monitor and resolve automatically flagged suspicious approvals or conversions."
        action={
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-48">
            <option value="">All alerts</option>
            <option value="PENDING_REVIEW">Pending review</option>
            <option value="RESOLVED">Resolved</option>
            <option value="FALSE_POSITIVE">False positive</option>
          </Select>
        }
      />

      <Card className="p-6">
        <h3 className="t-h3 text-[var(--text)] mb-4 flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-[var(--brand-bright)]" /> Flagged security alerts
        </h3>

        {loading ? (
          <div className="space-y-3">
            <SkeletonCard className="h-16" />
            <SkeletonCard className="h-16" />
          </div>
        ) : error ? (
          <ErrorState onRetry={loadAlerts} message="We couldn't load fraud alerts. Please try again." />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<CheckCircle className="w-6 h-6" />}
            title="No alerts"
            description="Your organization is secure — nothing flagged."
          />
        ) : (
          <Table columns={["Triggered", "Type", "Reason", "Status", ""]} caption="Flagged fraud alerts">
            {filtered.map((alert) => {
              const isPending = alert.status === "PENDING_REVIEW";
              return (
                <Tr key={alert.id}>
                  <Td className="text-[var(--muted)]">{new Date(alert.createdAt).toLocaleString()}</Td>
                  <Td>
                    <Badge tone="danger">{alert.type}</Badge>
                  </Td>
                  <Td className="max-w-[280px]">
                    <div>{alert.description}</div>
                    {alert.user && (
                      <div className="t-caption text-[var(--muted)] mt-1">
                        {alert.user.firstName} {alert.user.lastName} · {alert.user.email}
                      </div>
                    )}
                  </Td>
                  <Td>
                    <Badge tone={statusTone(alert.status) as any}>{alert.status.replace(/_/g, " ")}</Badge>
                  </Td>
                  <Td>
                    {isPending ? (
                      <div className="flex items-center justify-end gap-2">
                        <Button size="sm" variant="subtle" onClick={() => handleResolveAlert(alert.id, "RESOLVED")}>
                          Resolve
                        </Button>
                        <Button size="sm" variant="secondary" onClick={() => handleResolveAlert(alert.id, "FALSE_POSITIVE")}>
                          False positive
                        </Button>
                      </div>
                    ) : (
                      <span className="t-caption text-[var(--muted)] italic">Closed</span>
                    )}
                  </Td>
                </Tr>
              );
            })}
          </Table>
        )}
      </Card>
    </div>
  );
}
