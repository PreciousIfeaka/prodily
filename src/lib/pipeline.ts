import { RewardRequest, approvalTierFor } from "@/lib/data";


function stamp(item: RewardRequest, label: string): RewardRequest["history"] {
  return [...item.history, { label, at: "Just now" }];
}

export function runRuleCheck(item: RewardRequest): RewardRequest {
  if (item.thresholdMet) {
    const suspicious = !!item.suspicious;
    return {
      ...item,
      stage: suspicious ? "pending_review" : "budget_check",
      history: stamp(
        item,
        suspicious
          ? "Threshold met · reward request created · flagged suspicious"
          : "Threshold met · reward request created · integrity cleared"
      ),
    };
  }
  return {
    ...item,
    stage: "monitoring",
    history: stamp(item, "Threshold not met · back to monitoring"),
  };
}

export function logMoreActivity(item: RewardRequest): RewardRequest {
  return {
    ...item,
    thresholdMet: true,
    stage: "rule_check",
    history: stamp(item, "Additional activity logged · re-evaluating"),
  };
}

export function resolveManagerDecision(
  item: RewardRequest,
  decision: "approve" | "modify" | "reject",
  modifiedAmount?: number
): RewardRequest {
  if (decision === "reject") {
    return {
      ...item,
      stage: "rejected",
      rejectionReason: "Manager rejected the AI recommendation",
      history: stamp(item, "Manager decision: rejected"),
    };
  }
  const amount = decision === "modify" && modifiedAmount ? modifiedAmount : item.amount;
  const suspicious = !!item.suspicious;
  return {
    ...item,
    amount,
    stage: suspicious ? "pending_review" : "budget_check",
    history: stamp(
      item,
      decision === "modify"
        ? `Manager decision: modified to ₦${amount.toLocaleString()} & approved`
        : "Manager decision: approved"
    ),
  };
}

export function resolvePendingReview(item: RewardRequest, cleared: boolean): RewardRequest {
  if (cleared) {
    return {
      ...item,
      stage: "budget_check",
      history: stamp(item, "Reviewer cleared the flag · confirmed"),
    };
  }
  return {
    ...item,
    stage: "rejected",
    rejectionReason: "Confirmed suspicious activity",
    history: stamp(item, "Reviewer confirmed fraud · rejected & notified"),
  };
}

export function resolveBudgetCheck(item: RewardRequest, available: boolean): RewardRequest {
  if (available) {
    return {
      ...item,
      stage: "approval",
      approvalTier: approvalTierFor(item.amount),
      history: stamp(item, "Budget confirmed available · routed to approval"),
    };
  }
  return {
    ...item,
    stage: "rejected",
    rejectionReason: "Budget unavailable this cycle",
    history: stamp(item, "Budget unavailable · rejected & notified"),
  };
}

export function resolveApproval(item: RewardRequest, approved: boolean): RewardRequest {
  if (approved) {
    return {
      ...item,
      stage: "redemption",
      history: stamp(item, "Approved · logged to audit · reward issued & reserved"),
    };
  }
  return {
    ...item,
    stage: "rejected",
    rejectionReason: "Approver declined the request",
    history: stamp(item, "Approval declined · rejected & notified"),
  };
}

export function resolveRedemption(item: RewardRequest, redeemed: boolean): RewardRequest {
  if (redeemed) {
    const voucherCode = `VC-${Math.floor(10000 + Math.random() * 89999)}`;
    return {
      ...item,
      stage: "redeemed",
      voucherCode,
      history: stamp(item, `Vendor voucher generated · redeemed (${voucherCode})`),
    };
  }
  return {
    ...item,
    stage: "expired",
    history: stamp(item, "Expired unused · funds returned to budget"),
  };
}
