"use client";

import { useEffect, useState } from "react";
import { getBudgetUtilizationAction } from "@/app/actions/wallet";
import { TrendingUp, Coins, Layers, Activity } from "lucide-react";

export default function BudgetUtilizationPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const result = await getBudgetUtilizationAction();
        if (result) {
          setData(result);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex items-center gap-3 bg-white p-8 rounded-[32px] border border-[var(--line)] shadow-[var(--sh)]">
          <span className="w-6 h-6 border-2 border-[var(--indigo)]/30 border-t-[var(--indigo)] rounded-full animate-spin" />
          <span className="font-semibold text-sm">Loading budget utilization...</span>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12 bg-white rounded-[32px] border border-[var(--line)] shadow-sm">
        <TrendingUp className="w-12 h-12 text-[var(--faint)] mx-auto mb-3" />
        <h3 className="font-display font-extrabold text-xl text-[var(--ink)] mb-1">No Budget Reports</h3>
        <p className="text-sm text-[var(--muted)]">Could not load organizational budget data.</p>
      </div>
    );
  }

  const { organization, teams = [] } = data;

  const totalBudget = Number(organization?.totalBudget || 0);
  const spentBudget = Number(organization?.spentBudget || 0);
  const heldBudget = Number(organization?.heldBudget || 0);
  const availableBalance = Number(organization?.availableBalance || 0);

  const spentPercent = totalBudget > 0 ? (spentBudget / totalBudget) * 100 : 0;
  const heldPercent = totalBudget > 0 ? (heldBudget / totalBudget) * 100 : 0;
  const availablePercent = totalBudget > 0 ? (availableBalance / totalBudget) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="text-left">
        <h1 className="font-display font-extrabold text-3xl text-[var(--ink)] tracking-tight">
          Budget Utilization Report
        </h1>
        <p className="text-[14px] text-[var(--muted)] font-medium mt-1">
          Real-time hierarchical budget distribution and spent analytics across departments.
        </p>
      </div>

      {/* KPI stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="bg-white border border-[var(--line)] rounded-[22px] p-5 shadow-[var(--sh-sm)] flex items-center gap-4 text-left">
          <div className="w-12 h-12 rounded-[16px] bg-[var(--indigo-tint)] grid place-items-center text-[var(--indigo)]">
            <Coins className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[12.5px] text-[var(--muted)] font-medium">Total Provisioned</div>
            <div className="font-display font-bold text-xl text-[var(--ink)]">
              ₦{totalBudget.toLocaleString()}
            </div>
          </div>
        </div>

        <div className="bg-white border border-[var(--line)] rounded-[22px] p-5 shadow-[var(--sh-sm)] flex items-center gap-4 text-left">
          <div className="w-12 h-12 rounded-[16px] bg-red-50 grid place-items-center text-[var(--rose)]">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[12.5px] text-[var(--muted)] font-medium">Settled / Spent</div>
            <div className="font-display font-bold text-xl text-[var(--ink)]">
              ₦{spentBudget.toLocaleString()}
            </div>
          </div>
        </div>

        <div className="bg-white border border-[var(--line)] rounded-[22px] p-5 shadow-[var(--sh-sm)] flex items-center gap-4 text-left">
          <div className="w-12 h-12 rounded-[16px] bg-amber-50 grid place-items-center text-amber-600">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[12.5px] text-[var(--muted)] font-medium">Held in Escrow</div>
            <div className="font-display font-bold text-xl text-[var(--ink)]">
              ₦{heldBudget.toLocaleString()}
            </div>
          </div>
        </div>

        <div className="bg-white border border-[var(--line)] rounded-[22px] p-5 shadow-[var(--sh-sm)] flex items-center gap-4 text-left">
          <div className="w-12 h-12 rounded-[16px] bg-[var(--mint-tint)] grid place-items-center text-[var(--mint)]">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[12.5px] text-[var(--muted)] font-medium">Unallocated Cash</div>
            <div className="font-display font-bold text-xl text-[var(--ink)]">
              ₦{availableBalance.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Org distribution progress bar */}
      <div className="bg-white border border-[var(--line)] rounded-[26px] p-6 shadow-[var(--sh-sm)] text-left">
        <h3 className="font-display font-extrabold text-[18px] text-[var(--ink)] mb-4">
          Hierarchical Resource Split
        </h3>
        <div className="h-6 w-full bg-gray-100 rounded-full overflow-hidden flex mb-4">
          <div
            className="bg-[var(--rose)] h-full transition-all"
            style={{ width: `${spentPercent}%` }}
            title={`Spent: ${spentPercent.toFixed(1)}%`}
          />
          <div
            className="bg-amber-400 h-full transition-all"
            style={{ width: `${heldPercent}%` }}
            title={`Held: ${heldPercent.toFixed(1)}%`}
          />
          <div
            className="bg-[var(--mint)] h-full transition-all"
            style={{ width: `${availablePercent}%` }}
            title={`Available: ${availablePercent.toFixed(1)}%`}
          />
        </div>
        <div className="flex flex-wrap gap-4 text-xs font-semibold">
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 bg-[var(--rose)] rounded-md" />
            <span className="text-[var(--text)]">Spent ({spentPercent.toFixed(1)}%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 bg-amber-400 rounded-md" />
            <span className="text-[var(--text)]">Locked/Held ({heldPercent.toFixed(1)}%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 bg-[var(--mint)] rounded-md" />
            <span className="text-[var(--text)]">Available Balance ({availablePercent.toFixed(1)}%)</span>
          </div>
        </div>
      </div>

      {/* Departments breakdown */}
      <div className="bg-white border border-[var(--line)] rounded-[26px] p-6 shadow-[var(--sh-sm)] text-left">
        <h3 className="font-display font-extrabold text-[18px] text-[var(--ink)] mb-4">
          Departmental Budget Breakdown
        </h3>
        {teams.length === 0 ? (
          <p className="text-xs text-[var(--muted)] italic">No department teams currently found.</p>
        ) : (
          <div className="space-y-6">
            {teams.map((t: any) => {
              const allocated = Number(t.budget || 0);
              const spent = Number(t.spent || 0);
              const held = Number(t.held || 0);
              const available = Number(t.available || 0);

              const utilizationRate = allocated > 0 ? ((spent + held) / allocated) * 100 : 0;
              let barColor = "bg-[var(--mint)]";
              if (utilizationRate > 85) barColor = "bg-[var(--rose)]";
              else if (utilizationRate > 60) barColor = "bg-amber-400";

              return (
                <div key={t.teamId} className="space-y-2 border-b border-gray-50 last:border-b-0 pb-4 last:pb-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-bold text-[var(--ink)]">{t.teamName}</div>
                      <div className="text-[11px] text-[var(--muted)] font-medium">
                        Spent: ₦{spent.toLocaleString()} | Held: ₦{held.toLocaleString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-[var(--ink)]">
                        ₦{available.toLocaleString()} <span className="text-[var(--muted)] font-medium">/ ₦{allocated.toLocaleString()}</span>
                      </div>
                      <div className="text-[11px] text-[var(--muted)] font-bold mt-0.5">
                        {utilizationRate.toFixed(1)}% Used
                      </div>
                    </div>
                  </div>

                  <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${barColor} transition-all rounded-full`}
                      style={{ width: `${Math.min(utilizationRate, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
