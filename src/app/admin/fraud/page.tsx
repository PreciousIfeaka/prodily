"use client";

import { AlertTriangle } from "lucide-react";
import { fraudFlags, formatNairaShort } from "@/lib/data";
import { useAdmin } from "@/components/AdminContext";
import { useToast } from "@/components/Toast";

export default function FraudPage() {
  const { fraudStatuses: statuses, setFraudStatus, pendingFraudCount, pendingFraudAmount } = useAdmin();
  const { toast } = useToast();

  const act = (id: number, label: "Cleared" | "Blocked") => {
    setFraudStatus(id, label);
    toast(`Reward ${label.toLowerCase()} · audit log updated`);
  };

  return (
    <div>
      <div className="grid grid-cols-3 gap-4 mb-5">
        <div className="bg-white border border-line rounded-[18px] p-4 text-center">
          <div className="font-display font-extrabold text-2xl text-rose">{pendingFraudCount}</div>
          <div className="text-[12.5px] text-muted">Pending review</div>
        </div>
        <div className="bg-white border border-line rounded-[18px] p-4 text-center">
          <div className="font-display font-extrabold text-2xl text-ink">{formatNairaShort(pendingFraudAmount)}</div>
          <div className="text-[12.5px] text-muted">Amount held</div>
        </div>
        <div className="bg-white border border-line rounded-[18px] p-4 text-center">
          <div className="font-display font-extrabold text-2xl text-mint">99.4%</div>
          <div className="text-[12.5px] text-muted">Clean rate</div>
        </div>
      </div>

      <div className="bg-white border border-line rounded-[22px] p-5">
        <h3 className="text-base mb-4">Flagged transactions · PENDING_REVIEW</h3>
        {fraudFlags.map((f) => {
          const status = statuses[f.id];
          return (
            <div key={f.id} className="border border-line rounded-2xl p-4 mb-3" style={{ borderLeft: "4px solid var(--rose)" }}>
              <div className="flex items-center gap-3">
                <div className="w-[42px] h-[42px] rounded-xl bg-rose-tint grid place-items-center flex-shrink-0">
                  <AlertTriangle size={21} color="var(--rose)" />
                </div>
                <div className="flex-1 min-w-0">
                  <b className="text-[14.5px] text-ink block">{f.title}</b>
                  <div className="text-[12.5px] text-muted">{f.subtitle}</div>
                </div>
                {status ? (
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0 ${
                      status === "Cleared" ? "bg-mint-tint text-[#0d7a54]" : "bg-rose-tint text-[#be123c]"
                    }`}
                  >
                    {status}
                  </span>
                ) : (
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => act(f.id, "Cleared")}
                      className="text-[12.5px] font-bold rounded-lg px-3 py-1.5 bg-indigo text-white"
                    >
                      Clear
                    </button>
                    <button
                      onClick={() => act(f.id, "Blocked")}
                      className="text-[12.5px] font-bold rounded-lg px-3 py-1.5 bg-rose-tint text-[#be123c]"
                    >
                      Block
                    </button>
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {f.reasons.map((r) => (
                  <span key={r} className="text-xs font-bold px-2.5 py-1 rounded-full bg-rose-tint text-[#be123c]">
                    {r}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
