"use client";

import { useRouter } from "next/navigation";
import { use } from "react";
import { ArrowLeft, Circle } from "lucide-react";
import { rewards } from "@/lib/data";
import Icon from "@/components/ui/Icon";
import { useEmployee } from "@/components/EmployeeContext";

export default function RewardDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { points, redeem } = useEmployee();
  const reward = rewards.find((r) => r.id === id) ?? rewards[0];
  const canAfford = points >= reward.cost;

  return (
    <div className="bg-white border border-line rounded-[22px] overflow-hidden">
      <div
        className="rounded-[22px] h-[220px] grid place-items-center relative overflow-hidden m-3 mb-0"
        style={{ background: reward.gradient }}
      >
        <button
          onClick={() => router.back()}
          className="absolute top-3.5 left-3.5 w-10 h-10 rounded-full bg-white/90 grid place-items-center z-[5]"
        >
          <ArrowLeft size={20} color="var(--ink)" />
        </button>
        <Icon name={reward.icon} size={72} color="#fff" />
      </div>

      <div className="p-6">
        <div className="font-display font-extrabold text-2xl text-ink mb-1">{reward.name}</div>
        <div className="text-[13px] text-muted mb-4">
          {reward.vendor} · {reward.priceLabel}
        </div>
        <p className="text-[14px] text-text mb-2 leading-relaxed">{reward.description}</p>

        <div className="flex justify-between py-3 border-b border-line text-[13.5px]">
          <span className="text-muted">Category</span>
          <b className="text-ink">{reward.category}</b>
        </div>
        <div className="flex justify-between py-3 border-b border-line text-[13.5px]">
          <span className="text-muted">Validity</span>
          <b className="text-ink">30 days</b>
        </div>
        <div className="flex justify-between py-3 mb-2 text-[13.5px]">
          <span className="text-muted">Your balance</span>
          <b className="text-ink">{points.toLocaleString()} pts</b>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between border-t border-line pt-5 mt-3">
          <div>
            <div className="text-[11px] text-muted">Cost</div>
            <div className="font-display font-extrabold text-xl text-ink flex items-center gap-1.5">
              <Circle size={18} fill="var(--gold)" color="var(--gold)" />
              {reward.cost} pts
            </div>
          </div>
          <button
            onClick={() => {
              if (redeem(reward)) router.push("/employee/rewards");
            }}
            disabled={!canAfford}
            className={`font-bold text-sm rounded-[13px] px-5 py-3 ${
              canAfford
                ? "bg-indigo text-white shadow-[var(--sh-indigo)]"
                : "bg-surface-2 text-faint cursor-not-allowed"
            }`}
          >
            {canAfford ? "Redeem now" : "Not enough points"}
          </button>
        </div>
      </div>
    </div>
  );
}
