"use client";

import { useEffect, useState, startTransition } from "react";
import { ChevronDown, Zap, Sparkles, AlertTriangle, ShieldCheck } from "lucide-react";
import {
  getRewardRequestsAction,
  approveRewardRequestAction,
  rejectRewardRequestAction,
  getFraudAlertsAction,
  resolveFraudAlertAction,
} from "@/app/actions/wallet";
import { useToast } from "@/components/Toast";
import { PageHeader, Card, Badge, Spinner, Button } from "@/components/ui";

// Frontend columns/bands mapping
const bands = [
  { key: "b1", title: "1 · Earning & triggers", stages: ["monitoring"], tag: "bg-[#2563eb]", band: "bg-[var(--surface-2)] border-[var(--line)]" },
  { key: "b2", title: "2 · Evaluation & AI", stages: ["rule_check", "manager_review"], tag: "bg-[#7c3aed]", band: "bg-[var(--surface-2)] border-[var(--line)]" },
  { key: "b3", title: "3 · Integrity & budget", stages: ["pending_review", "budget_check"], tag: "bg-[#d97706]", band: "bg-[var(--surface-2)] border-[var(--line)]" },
  { key: "b4", title: "4 · Approval workflow", stages: ["approval"], tag: "bg-[#0891b2]", band: "bg-[var(--surface-2)] border-[var(--line)]" },
  { key: "b5", title: "5 · Redemption & fulfilment", stages: ["redemption", "redeemed", "expired"], tag: "bg-[var(--brand)]", band: "bg-[var(--surface-2)] border-[var(--line)]" },
];

export default function PipelinePage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [fraudAlerts, setFraudAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  const loadData = async () => {
    setLoading(true);
    try {
      const [reqs, alerts] = await Promise.all([
        getRewardRequestsAction(),
        getFraudAlertsAction(),
      ]);
      setRequests(reqs);
      setFraudAlerts(alerts);
    } catch (err) {
      console.error(err);
      toast("Failed to load pipeline data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApprove = (id: string, name: string) => {
    startTransition(async () => {
      try {
        const res = await approveRewardRequestAction(id);
        if (res.success) {
          toast(`Reward request for ${name} approved.`);
          loadData();
        } else {
          toast(res.error || "Approval failed.");
        }
      } catch {
        toast("Connection error.");
      }
    });
  };

  const handleReject = (id: string, name: string) => {
    const reason = prompt("Enter rejection reason:") || "Rejected by administrator";
    startTransition(async () => {
      try {
        const res = await rejectRewardRequestAction(id, reason);
        if (res.success) {
          toast(`Reward request for ${name} rejected.`);
          loadData();
        } else {
          toast(res.error || "Rejection failed.");
        }
      } catch {
        toast("Connection error.");
      }
    });
  };

  const handleResolveFraud = (alertId: string, requestName: string, status: "RESOLVED" | "FALSE_POSITIVE") => {
    startTransition(async () => {
      try {
        const res = await resolveFraudAlertAction(alertId, status);
        if (res.success) {
          toast(status === "FALSE_POSITIVE" ? `Cleared fraud flag for ${requestName}.` : `Confirmed fraud and blocked request for ${requestName}.`);
          loadData();
        } else {
          toast(res.error || "Failed to resolve fraud case.");
        }
      } catch {
        toast("Connection error.");
      }
    });
  };

  // Maps backend requests dynamically into the UI stages
  const mappedRequests = requests.map((r) => {
    let stage = "monitoring";
    
    if (r.metadata?.isFraudFlagged === true) {
      stage = "pending_review";
    } else if (r.status === "PENDING") {
      // Map pending requests based on category
      stage = r.category === "EMERGENCY_SUPPORT" ? "manager_review" : "approval";
    } else if (r.status === "APPROVED") {
      stage = "redeemed";
    } else if (r.status === "REJECTED") {
      stage = "rejected";
    }

    // Match with corresponding fraud alert ID if flagged
    const matchedAlert = fraudAlerts.find((alert) => alert.rewardRequestId === r.id);

    return {
      ...r,
      stage,
      fraudAlertId: matchedAlert?.id,
      reasons: matchedAlert ? [matchedAlert.description] : [],
    };
  });

  const activeRequests = mappedRequests.filter((r) => r.stage !== "rejected");
  const rejectedRequests = mappedRequests.filter((r) => r.stage === "rejected");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reward Pipeline"
        subtitle={`${activeRequests.length} requests moving through the pipeline · click an action to advance a card`}
      />

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size={28} />
        </div>
      ) : (
        <>
          <div className="grid gap-4 lg:grid-cols-5">
            {bands.map((b) => {
              const items = activeRequests.filter((r) => b.stages.includes(r.stage));
              return (
                <div key={b.key} className={`rounded-[20px] border p-3 flex flex-col gap-3 ${b.band}`}>
                  <div className={`self-start text-white text-[11.5px] font-bold rounded-full px-3 py-1 ${b.tag}`}>
                    {b.title}
                  </div>
                  {items.length === 0 && (
                    <div className="text-[12.5px] text-[var(--muted)] px-1 py-6 text-center">Nothing here right now</div>
                  )}
                  {items.map((item) => (
                    <RequestCard
                      key={item.id}
                      item={item}
                      expanded={!!expanded[item.id]}
                      onToggleHistory={() => setExpanded((prev) => ({ ...prev, [item.id]: !prev[item.id] }))}
                      onApprove={() => handleApprove(item.id, item.recipient ? `${item.recipient.firstName} ${item.recipient.lastName}` : "Employee")}
                      onReject={() => handleReject(item.id, item.recipient ? `${item.recipient.firstName} ${item.recipient.lastName}` : "Employee")}
                      onClearFraud={() => {
                        if (item.fraudAlertId) {
                          handleResolveFraud(item.fraudAlertId, item.recipient ? `${item.recipient.firstName} ${item.recipient.lastName}` : "Employee", "FALSE_POSITIVE");
                        } else {
                          toast("No matching fraud alert details found.");
                        }
                      }}
                      onConfirmFraud={() => {
                        if (item.fraudAlertId) {
                          handleResolveFraud(item.fraudAlertId, item.recipient ? `${item.recipient.firstName} ${item.recipient.lastName}` : "Employee", "RESOLVED");
                        } else {
                          toast("No matching fraud alert details found.");
                        }
                      }}
                    />
                  ))}
                </div>
              );
            })}
          </div>

          {/* Rejected Rail */}
          <div className="mt-5">
            <div className="text-[13px] font-bold text-[var(--text)] mb-2.5 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[var(--rose)]" />
              Rejected & notified
              <span className="text-[var(--muted)] font-normal">({rejectedRequests.length})</span>
            </div>
            {rejectedRequests.length === 0 ? (
              <div className="text-[12.5px] text-[var(--muted)]">No rejections right now.</div>
            ) : (
              <div className="flex flex-col gap-2">
                {rejectedRequests.map((r) => {
                  const empName = r.recipient ? `${r.recipient.firstName} ${r.recipient.lastName}` : "System User";
                  return (
                    <div
                      key={r.id}
                      className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl px-4 py-3 flex items-center gap-3 flex-wrap"
                    >
                      <Avatar name={empName} />
                      <div className="flex-1 min-w-[160px]">
                        <div className="text-[13.5px] font-bold text-[var(--text)]">{empName}</div>
                        <div className="text-[12px] text-[var(--muted)]">{r.metadata?.rejectionReason || "Denied by manager"}</div>
                      </div>
                      <div className="text-[13px] font-bold text-[var(--rose)]">₦{Number(r.amount).toLocaleString()}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function Avatar({ name }: { name: string }) {
  const initials = name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase();
  const colors = ["#2563eb", "#7c3aed", "#d97706", "#0891b2", "#10b981", "#ec4899"];
  const color = colors[name.charCodeAt(0) % colors.length];

  return (
    <div
      className="w-9 h-9 rounded-xl grid place-items-center flex-shrink-0 text-white text-[12px] font-bold"
      style={{ background: color }}
    >
      {initials}
    </div>
  );
}

function RequestCard({
  item,
  expanded,
  onToggleHistory,
  onApprove,
  onReject,
  onClearFraud,
  onConfirmFraud,
}: {
  item: any;
  expanded: boolean;
  onToggleHistory: () => void;
  onApprove: () => void;
  onReject: () => void;
  onClearFraud: () => void;
  onConfirmFraud: () => void;
}) {
  const empName = item.recipient ? `${item.recipient.firstName} ${item.recipient.lastName}` : "System User";
  const teamName = item.recipient?.team?.name || "General";
  const isAi = item.category === "EMERGENCY_SUPPORT";

  return (
    <div className="bg-[var(--surface)] border border-[var(--line)] rounded-[18px] p-3.5 flex flex-col gap-2.5">
      <div className="flex items-start gap-2.5">
        <Avatar name={empName} />
        <div className="min-w-0 flex-1">
          <div className="text-[13.5px] font-bold text-[var(--text)] truncate">{empName}</div>
          <div className="text-[11.5px] text-[var(--muted)] truncate">
            {teamName} · {item.category}
          </div>
        </div>
        <div className="text-[13px] font-bold text-[var(--text)] whitespace-nowrap">₦{Number(item.amount).toLocaleString()}</div>
      </div>

      <div className="flex items-center gap-1.5 flex-wrap">
        <span
          className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
            isAi ? "bg-[var(--brand-tint)] text-[var(--brand-bright)]" : "bg-[var(--surface-3)] text-[var(--muted)]"
          }`}
        >
          {isAi ? <Sparkles size={11} /> : <Zap size={11} />}
          {isAi ? "AI recommendation" : "Rule engine"}
        </span>
      </div>

      {item.stage === "pending_review" && item.reasons?.length > 0 && (
        <div className="bg-[var(--rose-tint)] border border-[var(--rose)]/20 p-2.5 rounded-lg">
          <div className="text-[11px] font-bold text-[var(--rose)] flex items-center gap-1 mb-1">
            <AlertTriangle size={12} /> Flagged suspicious activity
          </div>
          <ul className="text-[11.5px] text-[var(--muted)] list-disc pl-4">
            {item.reasons.map((r: string, idx: number) => (
              <li key={idx}>{r}</li>
            ))}
          </ul>
        </div>
      )}

      {item.stage === "redeemed" && (
        <div className="text-[11.5px] text-[var(--brand-bright)] font-semibold flex items-center gap-1">
          <ShieldCheck size={13} /> Cleared and disbursed
        </div>
      )}

      {/* Action buttons */}
      {item.stage === "manager_review" && (
        <div className="flex items-center gap-1.5 flex-wrap">
          <Button size="sm" onClick={onApprove}>Approve</Button>
          <Button size="sm" variant="danger" onClick={onReject}>Reject</Button>
        </div>
      )}

      {item.stage === "pending_review" && (
        <div className="flex items-center gap-1.5 flex-wrap">
          <Button size="sm" onClick={onClearFraud}>Clear</Button>
          <Button size="sm" variant="danger" onClick={onConfirmFraud}>Block</Button>
        </div>
      )}

      {item.stage === "approval" && (
        <div className="flex items-center gap-1.5 flex-wrap">
          <Button size="sm" onClick={onApprove}>Approve</Button>
          <Button size="sm" variant="danger" onClick={onReject}>Reject</Button>
        </div>
      )}

      <button
        onClick={onToggleHistory}
        className="flex items-center gap-1 text-[11px] font-semibold text-[var(--muted)] hover:text-[var(--text)] transition-colors self-start"
      >
        <ChevronDown size={12} className={`transition-transform ${expanded ? "rotate-180" : ""}`} />
        {expanded ? "Hide" : "View"} details
      </button>
      {expanded && (
        <div className="text-[11px] text-[var(--muted)] border-t border-[var(--line)] pt-2 space-y-1">
          <div className="flex justify-between">
            <span>Created At</span>
            <span>{new Date(item.createdAt).toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Status</span>
            <span className="capitalize">{item.status.toLowerCase()}</span>
          </div>
        </div>
      )}
    </div>
  );
}
