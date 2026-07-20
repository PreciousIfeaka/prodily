"use client";

import { useEffect, useState, startTransition } from "react";
import { createWorkflowRuleAction, listWorkflowRulesAction } from "@/app/actions/wallet";
import { Settings, Plus, Info, Layers, CheckCircle } from "lucide-react";
import { useToast } from "@/components/Toast";

export default function ApprovalWorkflowsPage() {
  const [rules, setRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [category, setCategory] = useState("MEDICAL");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [stages, setStages] = useState("TEAM_LEAD, ADMIN");
  const [formLoading, setFormLoading] = useState(false);

  const { celebrate, toast } = useToast();

  const loadRules = async () => {
    try {
      const result = await listWorkflowRulesAction();
      if (result) {
        setRules(result);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRules();
  }, []);

  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category || !minAmount || !maxAmount || !stages) return;

    setFormLoading(true);
    const formData = new FormData();
    formData.append("category", category);
    formData.append("minAmount", minAmount);
    formData.append("maxAmount", maxAmount);
    formData.append("stages", stages);

    startTransition(async () => {
      try {
        const res = await createWorkflowRuleAction(null, formData);
        if (res.success) {
          celebrate("Custom approval rule successfully created!");
          setMinAmount("");
          setMaxAmount("");
          setStages("TEAM_LEAD, ADMIN");
          loadRules();
        } else {
          toast(res.error || "Failed to create rule.");
        }
      } catch (err) {
        toast("Connection error.");
      } finally {
        setFormLoading(false);
      }
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex items-center gap-3 bg-white p-8 rounded-[32px] border border-[var(--line)] shadow-[var(--sh)]">
          <span className="w-6 h-6 border-2 border-[var(--indigo)]/30 border-t-[var(--indigo)] rounded-full animate-spin" />
          <span className="font-semibold text-sm">Loading workflow rules...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left">
      {/* Title */}
      <div>
        <h1 className="font-display font-extrabold text-3xl text-[var(--ink)] tracking-tight">
          Approval Workflows Configuration
        </h1>
        <p className="text-[14px] text-[var(--muted)] font-medium mt-1">
          Define multi-stage approval workflow rules based on disbursement categories and amount bounds.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Form & Defaults */}
        <div className="lg:col-span-1 space-y-6">
          {/* Create Rule Form */}
          <div className="bg-white border border-[var(--line)] rounded-[26px] p-6 shadow-[var(--sh-sm)]">
            <h3 className="font-display font-extrabold text-[18px] text-[var(--ink)] mb-1 flex items-center gap-2">
              <Plus className="w-5 h-5 text-[var(--indigo)]" /> New Custom Rule
            </h3>
            <p className="text-[12px] text-[var(--muted)] font-medium mb-4">
              Create a custom sign-off hierarchy for disbursements.
            </p>

            <form onSubmit={handleCreateRule} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[var(--ink)] uppercase tracking-wider pl-1" htmlFor="ruleCategory">
                  Reward Category
                </label>
                <select
                  id="ruleCategory"
                  className="w-full bg-white border border-[var(--line)] rounded-xl px-3 py-2 outline-none focus:border-[var(--indigo)] transition-all font-body text-xs text-[var(--ink)] font-medium shadow-[var(--sh-sm)] appearance-none"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                >
                  <option value="MEDICAL">Medical Support</option>
                  <option value="FINANCIAL">Financial Support</option>
                  <option value="EQUIPMENT">Equipment Support</option>
                  <option value="TRANSPORT">Transport Support</option>
                  <option value="LUNCH">Lunch Support</option>
                  <option value="AIRTIME">Airtime Support</option>
                  <option value="INTERNET">Internet Support</option>
                  <option value="ATTENDANCE">Attendance Completion</option>
                  <option value="INNOVATION">Innovation &amp; Idea Grants</option>
                  <option value="SPRINT_COMPLETION">Sprint Completion Rewards</option>
                  <option value="PRODUCT_LAUNCH">Product Launch Rewards</option>
                  <option value="ALL">All Categories (Fallback)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[var(--ink)] uppercase tracking-wider pl-1" htmlFor="minAmt">
                    Min Amount (₦)
                  </label>
                  <input
                    id="minAmt"
                    type="number"
                    required
                    placeholder="0"
                    className="w-full bg-white border border-[var(--line)] rounded-xl px-4 py-2 outline-none focus:border-[var(--indigo)] transition-all font-body text-xs text-[var(--ink)] font-medium shadow-[var(--sh-sm)]"
                    value={minAmount}
                    onChange={(e) => setMinAmount(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[var(--ink)] uppercase tracking-wider pl-1" htmlFor="maxAmt">
                    Max Amount (₦)
                  </label>
                  <input
                    id="maxAmt"
                    type="number"
                    required
                    placeholder="50000"
                    className="w-full bg-white border border-[var(--line)] rounded-xl px-4 py-2 outline-none focus:border-[var(--indigo)] transition-all font-body text-xs text-[var(--ink)] font-medium shadow-[var(--sh-sm)]"
                    value={maxAmount}
                    onChange={(e) => setMaxAmount(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[var(--ink)] uppercase tracking-wider pl-1" htmlFor="ruleStages">
                  Approver Stages
                </label>
                <input
                  id="ruleStages"
                  type="text"
                  required
                  placeholder="e.g. TEAM_LEAD, ADMIN"
                  className="w-full bg-white border border-[var(--line)] rounded-xl px-4 py-2 outline-none focus:border-[var(--indigo)] transition-all font-body text-xs text-[var(--ink)] font-medium shadow-[var(--sh-sm)]"
                  value={stages}
                  onChange={(e) => setStages(e.target.value)}
                />
                <span className="text-[10px] text-[var(--muted)] pl-1 block">
                  Comma-separated roles in order of sign-off.
                </span>
              </div>

              <button
                type="submit"
                disabled={formLoading}
                className="w-full bg-[var(--indigo)] hover:bg-[var(--indigo-600)] disabled:opacity-50 text-white font-bold py-2.5 px-4 rounded-xl shadow-sm hover:translate-y-[-1px] transition-all cursor-pointer font-body text-xs uppercase tracking-wider"
              >
                {formLoading ? "Saving..." : "Create Rule"}
              </button>
            </form>
          </div>

          {/* Read-only Defaults Info */}
          <div className="bg-white border border-[var(--line)] rounded-[26px] p-6 shadow-[var(--sh-sm)] text-[var(--text)]">
            <h3 className="font-display font-extrabold text-[15px] text-[var(--ink)] mb-3 flex items-center gap-1.5">
              <Info className="w-4.5 h-4.5 text-[var(--indigo)]" /> Default Fallback Hierarchy
            </h3>
            <p className="text-xs text-[var(--muted)] leading-relaxed mb-4">
              When no custom rule matches the category and amount, the system uses these defaults:
            </p>
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between border-b pb-2">
                <span className="font-semibold text-[var(--ink)]">≤ ₦5,000</span>
                <span className="px-2 py-0.5 bg-[var(--mint-tint)] text-[var(--mint)] rounded font-bold uppercase text-[9px]">
                  Auto-Approval
                </span>
              </div>
              <div className="flex items-center justify-between border-b pb-2">
                <span className="font-semibold text-[var(--ink)]">₦5,001 – ₦20,000</span>
                <span className="px-2 py-0.5 bg-[var(--violet-tint)] text-[var(--violet)] rounded font-bold uppercase text-[9px]">
                  Team Lead Only
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[var(--ink)]">&gt; ₦20,000</span>
                <span className="px-2 py-0.5 bg-[var(--indigo-tint)] text-[var(--indigo)] rounded font-bold uppercase text-[9px]">
                  Team Lead → Admin
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Custom Rules List */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-[var(--line)] rounded-[26px] p-6 shadow-[var(--sh-sm)] h-full">
            <h3 className="font-display font-extrabold text-[18px] text-[var(--ink)] mb-4 flex items-center gap-2">
              <Layers className="w-5 h-5 text-[var(--indigo)]" /> Custom Rules Configured
            </h3>

            {rules.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-[var(--line)] rounded-[20px]">
                <Layers className="w-10 h-10 text-[var(--faint)] mx-auto mb-2" />
                <p className="text-xs text-[var(--muted)] font-semibold">No custom workflow rules created yet.</p>
                <p className="text-[11px] text-[var(--muted)] mt-1">Default fallback thresholds will govern requests.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[var(--line)]">
                      <th className="pb-3 text-xs font-bold text-[var(--muted)] uppercase tracking-wider">Category</th>
                      <th className="pb-3 text-xs font-bold text-[var(--muted)] uppercase tracking-wider">Range</th>
                      <th className="pb-3 text-xs font-bold text-[var(--muted)] uppercase tracking-wider">Sign-off Sequence</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rules.map((rule) => (
                      <tr key={rule.id} className="border-b border-[var(--line)] last:border-b-0 hover:bg-[var(--surface-2)] transition-colors">
                        <td className="py-4 text-xs font-semibold text-[var(--ink)]">
                          <span className="px-2 py-0.5 bg-[var(--violet-tint)] text-[var(--violet)] border border-purple-100 rounded-md uppercase font-bold text-[9.5px]">
                            {rule.category.replace("_", " ")}
                          </span>
                        </td>
                        <td className="py-4 text-xs text-[var(--text)] font-bold">
                          ₦{Number(rule.minAmount).toLocaleString()} – ₦{Number(rule.maxAmount).toLocaleString()}
                        </td>
                        <td className="py-4 text-xs font-bold text-[var(--indigo)]">
                          {rule.stages?.join(" → ")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
