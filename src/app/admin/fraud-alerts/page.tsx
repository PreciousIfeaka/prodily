"use client";

import { useEffect, useState, startTransition } from "react";
import { getFraudAlertsAction, resolveFraudAlertAction } from "@/app/actions/wallet";
import { ShieldAlert, CheckCircle } from "lucide-react";
import { useToast } from "@/components/Toast";

export default function FraudAlertsPage() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const { celebrate, toast } = useToast();

  const loadAlerts = async () => {
    try {
      const result = await getFraudAlertsAction();
      if (result) {
        setAlerts(result);
      }
    } catch (err) {
      console.error(err);
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
          celebrate(`Alert marked as ${status.toLowerCase()}!`);
          loadAlerts();
        } else {
          toast(res.error || "Failed to update alert.");
        }
      } catch (err) {
        toast("Connection error.");
      }
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex items-center gap-3 bg-white p-8 rounded-[32px] border border-[var(--line)] shadow-[var(--sh)]">
          <span className="w-6 h-6 border-2 border-[var(--indigo)]/30 border-t-[var(--indigo)] rounded-full animate-spin" />
          <span className="font-semibold text-sm">Loading security alerts...</span>
        </div>
      </div>
    );
  }

  const filteredAlerts = statusFilter
    ? alerts.filter((alert) => alert.status === statusFilter)
    : alerts;

  return (
    <div className="space-y-6 text-left">
      {/* Title */}
      <div>
        <h1 className="font-display font-extrabold text-3xl text-[var(--ink)] tracking-tight">
          Fraud Alerts Manager
        </h1>
        <p className="text-[14px] text-[var(--muted)] font-medium mt-1">
          Monitor and resolve automatically flagged suspicious manager approvals or point conversions.
        </p>
      </div>

      <div className="flex justify-end">
        <label className="flex items-center gap-3 text-xs font-bold text-[var(--muted)] uppercase tracking-wider">
          Status
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="bg-white border border-[var(--line)] rounded-xl px-3 py-2 text-xs text-[var(--ink)] outline-none focus:border-[var(--indigo)]"
          >
            <option value="">All alerts</option>
            <option value="PENDING_REVIEW">Pending review</option>
            <option value="RESOLVED">Resolved</option>
            <option value="FALSE_POSITIVE">False positive</option>
          </select>
        </label>
      </div>

      <div className="bg-white border border-[var(--line)] rounded-[26px] p-6 shadow-[var(--sh-sm)]">
        <h3 className="font-display font-extrabold text-[18px] text-[var(--ink)] mb-4 flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-[var(--indigo)]" /> Flagged Security Alerts
        </h3>
        {filteredAlerts.length === 0 ? (
          <div className="text-center py-10 bg-[var(--surface-2)] rounded-[20px] border border-dashed border-[var(--line)]">
            <CheckCircle className="w-8 h-8 text-[var(--mint)] mx-auto mb-2" />
            <p className="text-xs text-[var(--muted)] font-semibold">Your organization is secure. No fraud alerts flagged.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--line)]">
                  <th className="pb-3 text-xs font-bold text-[var(--muted)] uppercase tracking-wider">Triggered At</th>
                  <th className="pb-3 text-xs font-bold text-[var(--muted)] uppercase tracking-wider">Type</th>
                  <th className="pb-3 text-xs font-bold text-[var(--muted)] uppercase tracking-wider">Reason</th>
                  <th className="pb-3 text-xs font-bold text-[var(--muted)] uppercase tracking-wider">Status</th>
                  <th className="pb-3 text-xs font-bold text-[var(--muted)] uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAlerts.map((alert) => {
                  const date = new Date(alert.createdAt).toLocaleString();
                  const isPending = alert.status === "PENDING_REVIEW";
                  let statusBadge = "bg-amber-50 text-amber-600 border-amber-200";
                  if (alert.status === "RESOLVED") statusBadge = "bg-[var(--mint-tint)] text-[var(--mint)] border-green-200";
                  if (alert.status === "FALSE_POSITIVE") statusBadge = "bg-gray-100 text-gray-500 border-gray-200";

                  return (
                    <tr key={alert.id} className="border-b border-[var(--line)] last:border-b-0 hover:bg-[var(--surface-2)] transition-colors">
                      <td className="py-4 text-xs font-semibold text-[var(--ink)]">{date}</td>
                      <td className="py-4 text-xs font-bold uppercase">
                        <span className="px-2 py-1 bg-red-50 text-[var(--rose)] border border-red-100 rounded-md">
                          {alert.type}
                        </span>
                      </td>
                      <td className="py-4 text-xs text-[var(--text)] font-semibold max-w-[280px] leading-relaxed">
                        <div>{alert.description}</div>
                        {alert.user && (
                          <div className="text-[10px] text-[var(--muted)] mt-1">
                            {alert.user.firstName} {alert.user.lastName} · {alert.user.email}
                          </div>
                        )}
                      </td>
                      <td className="py-4 text-xs font-bold">
                        <span className={`px-2.5 py-1 rounded-full border ${statusBadge}`}>
                          {alert.status}
                        </span>
                      </td>
                      <td className="py-4 text-right">
                        {isPending ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleResolveAlert(alert.id, "RESOLVED")}
                              className="px-3 py-1.5 bg-[var(--mint-tint)] hover:bg-mint text-[var(--mint)] hover:text-white rounded-lg text-xs font-bold border border-green-200 hover:translate-y-[-1px] transition-all cursor-pointer whitespace-nowrap"
                            >
                              Resolve
                            </button>
                            <button
                              onClick={() => handleResolveAlert(alert.id, "FALSE_POSITIVE")}
                              className="px-3 py-1.5 bg-[var(--surface-2)] border border-[var(--line)] text-[var(--text)] hover:bg-gray-100 rounded-lg text-xs font-bold hover:translate-y-[-1px] transition-all cursor-pointer whitespace-nowrap"
                            >
                              Mark False Positive
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-[var(--muted)] font-bold italic">Closed</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
