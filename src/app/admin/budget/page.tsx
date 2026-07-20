"use client";

import { useEffect, useState } from "react";
import { getBudgetUtilizationAction } from "@/app/actions/wallet";
import { TrendingUp, Coins, Layers, Activity } from "lucide-react";
import {
  PageHeader,
  Card,
  StatCard,
  EmptyState,
  ErrorState,
  SkeletonCard,
} from "@/components/ui";

export default function BudgetUtilizationPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError(false);
    try {
      const result = await getBudgetUtilizationAction();
      if (result) setData(result);
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const organization = data?.organization;
  const teams: any[] = data?.teams ?? [];
  const totalBudget = Number(organization?.totalBudget || 0);
  const spentBudget = Number(organization?.spentBudget || 0);
  const heldBudget = Number(organization?.heldBudget || 0);
  const availableBalance = Number(organization?.availableBalance || 0);
  const pct = (n: number) => (totalBudget > 0 ? (n / totalBudget) * 100 : 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Budget Utilization"
        subtitle="Hierarchical budget distribution and spend analytics across departments."
      />

      {loading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            <SkeletonCard className="h-24" />
            <SkeletonCard className="h-24" />
            <SkeletonCard className="h-24" />
            <SkeletonCard className="h-24" />
          </div>
          <SkeletonCard className="h-40" />
        </div>
      ) : error ? (
        <ErrorState onRetry={loadData} message="We couldn't load budget data. Please try again." />
      ) : !data ? (
        <EmptyState
          icon={<TrendingUp className="w-6 h-6" />}
          title="No budget reports"
          description="Organizational budget data isn't available yet."
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            <StatCard tone="brand" icon={<Coins className="w-5 h-5" />} label="Total provisioned" value={`₦${totalBudget.toLocaleString()}`} />
            <StatCard icon={<TrendingUp className="w-5 h-5" />} label="Settled / spent" value={`₦${spentBudget.toLocaleString()}`} />
            <StatCard icon={<Layers className="w-5 h-5" />} label="Held in escrow" value={`₦${heldBudget.toLocaleString()}`} />
            <StatCard icon={<Activity className="w-5 h-5" />} label="Unallocated cash" value={`₦${availableBalance.toLocaleString()}`} />
          </div>

          {/* Split bar */}
          <Card className="p-6">
            <h3 className="t-h3 text-[var(--text)] mb-4">Hierarchical resource split</h3>
            <div className="h-6 w-full bg-[var(--surface-3)] rounded-[var(--r-pill)] overflow-hidden flex mb-4">
              <div className="bg-[var(--rose)] h-full" style={{ width: `${pct(spentBudget)}%` }} />
              <div className="bg-[var(--gold)] h-full" style={{ width: `${pct(heldBudget)}%` }} />
              <div className="bg-[var(--brand-bright)] h-full" style={{ width: `${pct(availableBalance)}%` }} />
            </div>
            <div className="flex flex-wrap gap-4 t-caption font-medium">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-[var(--rose)] rounded-[4px]" /> Spent ({pct(spentBudget).toFixed(1)}%)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-[var(--gold)] rounded-[4px]" /> Held ({pct(heldBudget).toFixed(1)}%)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-[var(--brand-bright)] rounded-[4px]" /> Available ({pct(availableBalance).toFixed(1)}%)
              </span>
            </div>
          </Card>

          {/* Departments */}
          <Card className="p-6">
            <h3 className="t-h3 text-[var(--text)] mb-4">Departmental budget breakdown</h3>
            {teams.length === 0 ? (
              <EmptyState icon={<Layers className="w-6 h-6" />} title="No departments" description="No department teams found." />
            ) : (
              <div className="space-y-5">
                {teams.map((t: any) => {
                  const allocated = Number(t.budget || 0);
                  const spent = Number(t.spent || 0);
                  const held = Number(t.held || 0);
                  const available = Number(t.available || 0);
                  const util = allocated > 0 ? ((spent + held) / allocated) * 100 : 0;
                  const barColor = util > 85 ? "bg-[var(--rose)]" : util > 60 ? "bg-[var(--gold)]" : "bg-[var(--brand-bright)]";
                  return (
                    <div key={t.teamId} className="space-y-2 border-b border-[var(--line)] last:border-0 pb-4 last:pb-0">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="t-small font-medium text-[var(--text)]">{t.teamName}</div>
                          <div className="t-caption text-[var(--muted)]">
                            Spent ₦{spent.toLocaleString()} · Held ₦{held.toLocaleString()}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="t-small font-medium text-[var(--text)]">
                            ₦{available.toLocaleString()}{" "}
                            <span className="text-[var(--muted)]">/ ₦{allocated.toLocaleString()}</span>
                          </div>
                          <div className="t-caption text-[var(--muted)] mt-0.5">{util.toFixed(1)}% used</div>
                        </div>
                      </div>
                      <div className="h-2.5 w-full bg-[var(--surface-3)] rounded-[var(--r-pill)] overflow-hidden">
                        <div className={`h-full ${barColor} rounded-[var(--r-pill)]`} style={{ width: `${Math.min(util, 100)}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
