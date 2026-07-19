import { adminKpis, approvalRows } from "@/lib/data";
import { TrendingUp } from "lucide-react";

const toneColor: Record<string, string> = { mint: "var(--mint)", gold: "var(--gold-600)" };

export default function AdminDashboard() {
  return (
    <div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {adminKpis.map((k) => (
          <div key={k.label} className="bg-white border border-line rounded-[18px] p-4">
            <div className="text-xs text-muted mb-2">{k.label}</div>
            <div className="font-display font-bold text-2xl text-ink mb-1">{k.value}</div>
            <div className="flex items-center gap-1 text-xs font-bold" style={{ color: toneColor[k.tone] }}>
              <TrendingUp size={13} />
              {k.delta}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white border border-line rounded-[22px] p-5">
          <h3 className="text-base mb-4">Points by category</h3>
          <div className="flex flex-col gap-3">
            {[
              { label: "Auto rewards (sprint, streaks)", pct: 46, color: "var(--indigo)" },
              { label: "Peer recognition", pct: 27, color: "var(--violet)" },
              { label: "Manager awards", pct: 18, color: "var(--gold)" },
              { label: "Marketplace redemptions", pct: 9, color: "var(--mint)" },
            ].map((row) => (
              <div key={row.label}>
                <div className="flex justify-between text-[12.5px] mb-1.5">
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-[3px]" style={{ background: row.color }} />
                    {row.label}
                  </span>
                  <b className="text-ink">{row.pct}%</b>
                </div>
                <div className="h-2 rounded-full bg-surface-2 overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${row.pct}%`, background: row.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-line rounded-[22px] p-5">
          <h3 className="text-base mb-4">Pending this week</h3>
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="text-left text-[11px] uppercase tracking-wide text-faint font-bold pb-3">Employee</th>
                <th className="text-left text-[11px] uppercase tracking-wide text-faint font-bold pb-3">Item</th>
                <th className="text-left text-[11px] uppercase tracking-wide text-faint font-bold pb-3">Amount</th>
              </tr>
            </thead>
            <tbody>
              {approvalRows.map((r) => (
                <tr key={r.id} className="hover:bg-surface-2">
                  <td className="py-3 border-t border-line">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-8 h-8 rounded-full grid place-items-center text-white font-bold text-[11px]"
                        style={{ background: r.color }}
                      >
                        {r.initials}
                      </div>
                      <span className="text-[13px] font-semibold text-ink">{r.name}</span>
                    </div>
                  </td>
                  <td className="py-3 border-t border-line text-[13px]">{r.item}</td>
                  <td className="py-3 border-t border-line text-[13px] font-bold text-ink">{r.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
