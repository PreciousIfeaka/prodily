"use client";

import { useAdmin } from "@/components/AdminContext";
import { useToast } from "@/components/Toast";

const statusChip: Record<string, string> = {
  Pending: "bg-gold-tint text-gold-600",
  "Team Lead": "bg-gold-tint text-gold-600",
  "Auto-approved": "bg-mint-tint text-[#0d7a54]",
  Approved: "bg-mint-tint text-[#0d7a54]",
  Rejected: "bg-rose-tint text-[#be123c]",
  Viewed: "bg-surface-2 text-muted",
};

export default function ApprovalsPage() {
  const { approvalRows: rows, setApprovalStatus } = useAdmin();
  const { toast } = useToast();

  const act = (id: number, label: string) => {
    setApprovalStatus(id, label);
    toast(`Reward ${label.toLowerCase()} · audit log updated`);
  };

  return (
    <div className="bg-white border border-line rounded-[22px] p-5 overflow-x-auto">
      <table className="w-full border-collapse min-w-[640px]">
        <thead>
          <tr>
            <th className="text-left text-[11px] uppercase tracking-wide text-faint font-bold pb-3">Employee</th>
            <th className="text-left text-[11px] uppercase tracking-wide text-faint font-bold pb-3">Item</th>
            <th className="text-left text-[11px] uppercase tracking-wide text-faint font-bold pb-3">Amount</th>
            <th className="text-left text-[11px] uppercase tracking-wide text-faint font-bold pb-3">Status</th>
            <th className="text-left text-[11px] uppercase tracking-wide text-faint font-bold pb-3">Action</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="hover:bg-surface-2">
              <td className="py-3.5 border-t border-line">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-[34px] h-[34px] rounded-full grid place-items-center text-white font-bold text-xs"
                    style={{ background: r.color }}
                  >
                    {r.initials}
                  </div>
                  <div>
                    <b className="block text-[13.5px] text-ink font-semibold">{r.name}</b>
                    <span className="text-[11.5px] text-muted">{r.team}</span>
                  </div>
                </div>
              </td>
              <td className="py-3.5 border-t border-line text-[13.5px]">{r.item}</td>
              <td className="py-3.5 border-t border-line text-[13.5px] font-bold text-ink">{r.amount}</td>
              <td className="py-3.5 border-t border-line">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${statusChip[r.status]}`}>{r.status}</span>
              </td>
              <td className="py-3.5 border-t border-line">
                {(r.status === "Pending" || r.status === "Team Lead") && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => act(r.id, "Approved")}
                      className="text-[12.5px] font-bold rounded-lg px-3 py-1.5 bg-mint text-white"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => act(r.id, "Rejected")}
                      className="text-[12.5px] font-bold rounded-lg px-3 py-1.5 bg-rose-tint text-[#be123c]"
                    >
                      Reject
                    </button>
                  </div>
                )}
                {r.status === "Auto-approved" && (
                  <button
                    onClick={() => act(r.id, "Viewed")}
                    className="text-[12.5px] font-bold rounded-lg px-3 py-1.5 bg-indigo text-white"
                  >
                    View
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
