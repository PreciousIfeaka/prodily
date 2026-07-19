"use client";

import { useState } from "react";
import { ChevronDown, Zap, Sparkles } from "lucide-react";
import {
  rewardRequests as seedRequests,
  approvalTierLabel,
  formatNairaShort,
  RewardRequest,
  PipelineStage,
} from "@/lib/data";
import {
  runRuleCheck,
  logMoreActivity,
  resolveManagerDecision,
  resolvePendingReview,
  resolveBudgetCheck,
  resolveApproval,
  resolveRedemption,
} from "@/lib/pipeline";
import { useToast } from "@/components/Toast";

// The 5 named stages from the Figma board. Each maps to one or more
// PipelineStage values — exactly the grouping the coloured bands show.
const bands: {
  key: string;
  title: string;
  stages: PipelineStage[];
  tag: string;
  band: string;
}[] = [
  { key: "b1", title: "1 · Earning & triggers", stages: ["monitoring"], tag: "bg-[#2563eb]", band: "bg-[#eaf1ff] border-[#c7dbfb]" },
  { key: "b2", title: "2 · Evaluation & AI", stages: ["rule_check", "manager_review"], tag: "bg-[#7c3aed]", band: "bg-[#f1eafc] border-[#ddc9f7]" },
  { key: "b3", title: "3 · Integrity & budget", stages: ["pending_review", "budget_check"], tag: "bg-[#d97706]", band: "bg-[#fdf3e2] border-[#f3ddaa]" },
  { key: "b4", title: "4 · Approval workflow", stages: ["approval"], tag: "bg-[#0891b2]", band: "bg-[#e5f8fb] border-[#b9e9f1]" },
  { key: "b5", title: "5 · Redemption & fulfilment", stages: ["redemption", "redeemed", "expired"], tag: "bg-[#059669]", band: "bg-[#e9f9f1] border-[#bfeed8]" },
];

const stageMeta: Record<PipelineStage, { label: string; note: string }> = {
  monitoring: { label: "Monitoring", note: "Below threshold — waiting on more activity" },
  rule_check: { label: "Awaiting rule check", note: "Reward rule engine → Threshold met?" },
  manager_review: { label: "Awaiting manager", note: "AI recommendation → Manager decision" },
  pending_review: { label: "PENDING_REVIEW", note: "Flagged: Suspicious activity?" },
  budget_check: { label: "Awaiting budget", note: "Integrity cleared → Budget available?" },
  approval: { label: "Awaiting approval", note: "Routed by reward amount" },
  redemption: { label: "Reserved", note: "Reward issued & reserved → Employee redeems?" },
  redeemed: { label: "Redeemed", note: "Vendor voucher generated" },
  expired: { label: "Expired", note: "Funds returned to budget" },
  rejected: { label: "Rejected", note: "Rejected & notified" },
};

function cloneSeed(): RewardRequest[] {
  return seedRequests.map((r) => ({ ...r, history: [...r.history] }));
}

export default function PipelinePage() {
  const [requests, setRequests] = useState<RewardRequest[]>(cloneSeed);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  const update = (id: string, fn: (r: RewardRequest) => RewardRequest, message: string) => {
    setRequests((prev) => prev.map((r) => (r.id === id ? fn(r) : r)));
    toast(message);
  };

  const rejected = requests.filter((r) => r.stage === "rejected");

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="text-[13.5px] text-muted">
          <b className="text-ink font-bold">{requests.length} requests</b> moving through the reward pipeline · click
          an action to advance a card
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        {bands.map((b) => {
          const items = requests.filter((r) => b.stages.includes(r.stage));
          return (
            <div key={b.key} className={`rounded-[20px] border p-3 flex flex-col gap-3 ${b.band}`}>
              <div className={`self-start text-white text-[11.5px] font-bold rounded-full px-3 py-1 ${b.tag}`}>
                {b.title}
              </div>
              {items.length === 0 && (
                <div className="text-[12.5px] text-muted px-1 py-6 text-center">Nothing here right now</div>
              )}
              {items.map((item) => (
                <RequestCard
                  key={item.id}
                  item={item}
                  expanded={!!expanded[item.id]}
                  onToggleHistory={() => setExpanded((prev) => ({ ...prev, [item.id]: !prev[item.id] }))}
                  onAction={(fn, message) => update(item.id, fn, message)}
                />
              ))}
            </div>
          );
        })}
      </div>

      {/* "Rejected & notified" rail — the diagram routes every reject arrow here */}
      <div className="mt-5">
        <div className="text-[13px] font-bold text-ink mb-2.5 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-rose" />
          Rejected & notified
          <span className="text-muted font-normal">({rejected.length})</span>
        </div>
        {rejected.length === 0 ? (
          <div className="text-[12.5px] text-muted">No rejections right now.</div>
        ) : (
          <div className="flex flex-col gap-2">
            {rejected.map((r) => (
              <div
                key={r.id}
                className="bg-white border border-line rounded-2xl px-4 py-3 flex items-center gap-3 flex-wrap"
              >
                <Avatar item={r} />
                <div className="flex-1 min-w-[160px]">
                  <div className="text-[13.5px] font-bold text-ink">{r.employee}</div>
                  <div className="text-[12px] text-muted">{r.rejectionReason}</div>
                </div>
                <div className="text-[13px] font-bold text-rose">{formatNairaShort(r.amount)}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Avatar({ item }: { item: RewardRequest }) {
  return (
    <div
      className="w-9 h-9 rounded-xl grid place-items-center flex-shrink-0 text-white text-[12px] font-bold"
      style={{ background: item.color }}
    >
      {item.initials}
    </div>
  );
}

function EngineBadge({ item }: { item: RewardRequest }) {
  const isAi = item.engine === "ai_recommendation";
  return (
    <span
      className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
        isAi ? "bg-indigo-tint text-indigo-700" : "bg-surface-2 text-muted"
      }`}
    >
      {isAi ? <Sparkles size={11} /> : <Zap size={11} />}
      {isAi ? "AI recommendation" : "Rule engine"}
    </span>
  );
}

function RequestCard({
  item,
  expanded,
  onToggleHistory,
  onAction,
}: {
  item: RewardRequest;
  expanded: boolean;
  onToggleHistory: () => void;
  onAction: (fn: (r: RewardRequest) => RewardRequest, message: string) => void;
}) {
  const meta = stageMeta[item.stage];

  return (
    <div className="bg-white border border-line rounded-[18px] p-3.5 flex flex-col gap-2.5">
      <div className="flex items-start gap-2.5">
        <Avatar item={item} />
        <div className="min-w-0 flex-1">
          <div className="text-[13.5px] font-bold text-ink truncate">{item.employee}</div>
          <div className="text-[11.5px] text-muted truncate">
            {item.team} · {item.triggerLabel}
          </div>
        </div>
        <div className="text-[13px] font-bold text-ink whitespace-nowrap">{formatNairaShort(item.amount)}</div>
      </div>

      <div className="flex items-center gap-1.5 flex-wrap">
        <EngineBadge item={item} />
        <span className="text-[11px] font-semibold text-muted">{item.ruleName}</span>
      </div>

      <div className="text-[12px] font-semibold text-ink bg-surface-2 rounded-lg px-2.5 py-1.5">
        {meta.label} — <span className="font-normal text-muted">{meta.note}</span>
      </div>

      {item.stage === "manager_review" && typeof item.aiConfidence === "number" && (
        <div className="text-[11.5px] text-muted">AI confidence: {item.aiConfidence}%</div>
      )}

      {item.stage === "pending_review" && item.suspiciousReasons && (
        <ul className="text-[11.5px] text-muted list-disc pl-4">
          {item.suspiciousReasons.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      )}

      {item.stage === "approval" && item.approvalTier && (
        <div className="text-[11.5px] text-muted">
          Route: <b className="text-ink">{approvalTierLabel[item.approvalTier]}</b>
        </div>
      )}

      {item.stage === "redeemed" && item.voucherCode && (
        <div className="text-[11.5px] text-mint font-bold">Voucher {item.voucherCode}</div>
      )}
      {item.stage === "expired" && <div className="text-[11.5px] text-muted">Funds returned to budget</div>}

      {/* Action buttons — one set per decision point in the diagram */}
      {item.stage === "monitoring" && (
        <ActionRow>
          <ActionButton tone="indigo" onClick={() => onAction(logMoreActivity, `${item.employee}: more activity logged`)}>
            Log more activity
          </ActionButton>
        </ActionRow>
      )}

      {item.stage === "rule_check" && (
        <ActionRow>
          <ActionButton tone="indigo" onClick={() => onAction(runRuleCheck, `${item.employee}: threshold evaluated`)}>
            Evaluate threshold
          </ActionButton>
        </ActionRow>
      )}

      {item.stage === "manager_review" && (
        <ActionRow>
          <ActionButton tone="mint" onClick={() => onAction((r) => resolveManagerDecision(r, "approve"), `${item.employee}: approved`)}>
            Approve
          </ActionButton>
          <ActionButton
            tone="gold"
            onClick={() =>
              onAction(
                (r) => resolveManagerDecision(r, "modify", Math.round(r.amount * 0.8)),
                `${item.employee}: modified & approved`
              )
            }
          >
            Modify
          </ActionButton>
          <ActionButton tone="rose" onClick={() => onAction((r) => resolveManagerDecision(r, "reject"), `${item.employee}: rejected`)}>
            Reject
          </ActionButton>
        </ActionRow>
      )}

      {item.stage === "pending_review" && (
        <ActionRow>
          <ActionButton tone="mint" onClick={() => onAction((r) => resolvePendingReview(r, true), `${item.employee}: cleared`)}>
            Clear
          </ActionButton>
          <ActionButton tone="rose" onClick={() => onAction((r) => resolvePendingReview(r, false), `${item.employee}: confirmed & rejected`)}>
            Confirm & reject
          </ActionButton>
        </ActionRow>
      )}

      {item.stage === "budget_check" && (
        <ActionRow>
          <ActionButton tone="mint" onClick={() => onAction((r) => resolveBudgetCheck(r, true), `${item.employee}: budget confirmed`)}>
            Confirm budget
          </ActionButton>
          <ActionButton tone="rose" onClick={() => onAction((r) => resolveBudgetCheck(r, false), `${item.employee}: no budget available`)}>
            No budget
          </ActionButton>
        </ActionRow>
      )}

      {item.stage === "approval" && (
        <ActionRow>
          <ActionButton tone="mint" onClick={() => onAction((r) => resolveApproval(r, true), `${item.employee}: approved & issued`)}>
            Approve
          </ActionButton>
          <ActionButton tone="rose" onClick={() => onAction((r) => resolveApproval(r, false), `${item.employee}: declined`)}>
            Reject
          </ActionButton>
        </ActionRow>
      )}

      {item.stage === "redemption" && (
        <ActionRow>
          <ActionButton tone="mint" onClick={() => onAction((r) => resolveRedemption(r, true), `${item.employee}: redeemed`)}>
            Mark redeemed
          </ActionButton>
          <ActionButton tone="gold" onClick={() => onAction((r) => resolveRedemption(r, false), `${item.employee}: expired`)}>
            Mark expired
          </ActionButton>
        </ActionRow>
      )}

      <button
        onClick={onToggleHistory}
        className="flex items-center gap-1 text-[11px] font-semibold text-muted hover:text-ink transition-colors self-start"
      >
        <ChevronDown size={12} className={`transition-transform ${expanded ? "rotate-180" : ""}`} />
        {expanded ? "Hide" : "View"} history
      </button>
      {expanded && (
        <ul className="text-[11px] text-muted flex flex-col gap-1 border-t border-line pt-2">
          {item.history.map((h, i) => (
            <li key={i} className="flex justify-between gap-2">
              <span>{h.label}</span>
              <span className="whitespace-nowrap text-faint">{h.at}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ActionRow({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center gap-1.5 flex-wrap">{children}</div>;
}

const toneClasses: Record<string, string> = {
  indigo: "bg-indigo hover:bg-indigo-600 text-white",
  mint: "bg-mint hover:opacity-90 text-white",
  gold: "bg-gold hover:opacity-90 text-[#4a2c00]",
  rose: "bg-rose hover:opacity-90 text-white",
};

function ActionButton({
  tone,
  onClick,
  children,
}: {
  tone: keyof typeof toneClasses;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`text-[11.5px] font-bold rounded-lg px-2.5 py-1.5 transition-colors ${toneClasses[tone]}`}
    >
      {children}
    </button>
  );
}
