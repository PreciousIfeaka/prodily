"use client";

import { useRouter } from "next/navigation";
import { use } from "react";
import { ArrowLeft, Sparkles } from "lucide-react";
import { rewards } from "@/lib/data";
import Icon from "@/components/ui/Icon";
import { useEmployee } from "@/components/EmployeeContext";
import { Card, Button, Badge } from "@/components/ui";
import { useToast } from "@/components/Toast";

export default function RewardDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { points, redeem } = useEmployee();
  const { toast } = useToast();
  const reward = rewards.find((r) => r.id === id) ?? rewards[0];
  const canAfford = points >= reward.cost;

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="overflow-hidden">
        <div
          className="h-[220px] grid place-items-center relative overflow-hidden"
          style={{ background: reward.gradient }}
        >
          <button
            onClick={() => router.back()}
            aria-label="Go back"
            className="absolute top-4 left-4 w-10 h-10 rounded-full bg-black/40 backdrop-blur grid place-items-center z-[5] text-white hover:bg-black/55 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>

          <Icon name={reward.icon} size={72} color="#fff" />
        </div>

        <div className="p-6">
          <h1 className="t-h1 text-[var(--text)] mb-1">{reward.name}</h1>
          <div className="t-small text-[var(--muted)] mb-4">
            {reward.vendor} · {reward.priceLabel}
          </div>
          <p className="t-body text-[var(--text)] mb-4 leading-relaxed">{reward.description}</p>

          <div className="flex justify-between py-3 border-b border-[var(--line)] t-small">
            <span className="text-[var(--muted)]">Category</span>
            <span className="font-medium text-[var(--text)]">{reward.category}</span>
          </div>
          <div className="flex justify-between py-3 border-b border-[var(--line)] t-small">
            <span className="text-[var(--muted)]">Validity</span>
            <span className="font-medium text-[var(--text)]">30 days</span>
          </div>
          <div className="flex justify-between py-3 t-small">
            <span className="text-[var(--muted)]">Your balance</span>
            <span className="font-medium text-[var(--text)]">{points.toLocaleString()} pts</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between border-t border-[var(--line)] pt-5 mt-3">
            <div>
              <div className="t-caption text-[var(--muted)]">Cost</div>
              <div className="font-display font-medium t-h2 text-[var(--brand-bright)] flex items-center gap-1.5">
                <Sparkles size={18} />
                {reward.cost} pts
              </div>
            </div>
            {reward.isRedeemable ? (
              <Button
                onClick={() => {
                  if (reward.redirectTo) {
                    router.push(reward.redirectTo);
                  }
                }}
                disabled={!canAfford}
              >
                {canAfford ? "Redeem now" : "Not enough points"}
              </Button>
            ) : (
              <Button
                onClick={() => {
                  toast("Coming soon! Only airtime and data rewards are currently redeemable.");
                }}
                variant="secondary"
              >
                Coming soon
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
