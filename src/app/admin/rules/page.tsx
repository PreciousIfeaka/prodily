"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Sparkles, Zap, ArrowRight, X } from "lucide-react";
import { rewardRules as initialRules, RewardRule } from "@/lib/data";
import Icon from "@/components/ui/Icon";
import { useToast } from "@/components/Toast";

const tintBg: Record<string, string> = {
  violet: "var(--violet-tint)",
  gold: "var(--gold-tint)",
  mint: "var(--mint-tint)",
};
const tintColor: Record<string, string> = {
  violet: "var(--indigo)",
  gold: "var(--gold-600)",
  mint: "var(--mint)",
};

const iconOptions = [
  { value: "zap", label: "Lightning" },
  { value: "droplet", label: "Droplet" },
  { value: "circlecheck", label: "Check circle" },
  { value: "flame", label: "Flame" },
  { value: "sparkles", label: "Sparkles" },
  { value: "heart", label: "Heart" },
  { value: "user", label: "Person" },
  { value: "book", label: "Book" },
  { value: "trophy", label: "Trophy" },
  { value: "wallet", label: "Wallet" },
  { value: "ticket", label: "Ticket" },
];

const emptyForm = {
  name: "",
  engine: "rule_engine" as RewardRule["engine"],
  metric: "",
  operator: "≥",
  threshold: "",
  frequency: "weekly" as "daily" | "weekly" | "monthly",
  reward: "",
  approval: "auto-approve" as RewardRule["approval"],
  icon: "zap",
  tint: "violet" as RewardRule["tint"],
};

export default function RulesPage() {
  const [rules, setRules] = useState(initialRules);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const { toast } = useToast();

  const toggle = (id: number) => {
    setRules((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        toast(`${r.name} ${r.enabled ? "disabled" : "enabled"}`);
        return { ...r, enabled: !r.enabled };
      })
    );
  };

  const closeForm = () => {
    setShowForm(false);
    setForm(emptyForm);
  };

  const createRule = () => {
    if (!form.name.trim() || !form.metric.trim() || !form.reward.trim()) {
      toast("Name, metric, and reward are required");
      return;
    }
    if (form.engine === "rule_engine" && !form.threshold.trim()) {
      toast("Add a threshold, or switch this rule to AI recommendation");
      return;
    }

    const nextId = rules.reduce((max, r) => Math.max(max, r.id), 0) + 1;
    const isAi = form.engine === "ai_recommendation";
    const newRule: RewardRule = {
      id: nextId,
      name: form.name.trim(),
      metric: form.metric.trim(),
      operator: isAi ? "received" : form.operator,
      threshold: isAi ? "" : form.threshold.trim(),
      frequency: form.frequency,
      reward: form.reward.trim(),
      approval: isAi ? "needs approval" : form.approval,
      icon: form.icon,
      tint: form.tint,
      enabled: true,
      engine: form.engine,
    };

    setRules((prev) => [newRule, ...prev]);
    toast(`${newRule.name} created`);
    closeForm();
  };

  return (
    <div>
      <Link
        href="/admin/pipeline"
        className="flex items-center justify-between gap-3 bg-indigo-tint border border-line rounded-2xl px-4 py-3 mb-4 group hover:brightness-95 transition"
      >
        <div className="text-[13px] text-indigo-700">
          <b className="font-bold">See these rules in action</b> — track requests through evaluation, integrity,
          approval & redemption on the reward pipeline board.
        </div>
        <ArrowRight size={16} className="text-indigo-700 flex-shrink-0 group-hover:translate-x-0.5 transition-transform" />
      </Link>

      <div className="flex items-center justify-between mb-4">
        <div className="text-[13.5px] text-muted">
          <b className="text-ink font-bold">{rules.length} active rules</b> · evaluated automatically
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 bg-indigo hover:bg-indigo-600 transition-colors text-white font-bold text-[13.5px] rounded-xl px-4 py-2.5 shadow-[var(--sh-indigo)]"
        >
          <Plus size={16} />
          New rule
        </button>
      </div>

      <div className="flex flex-col gap-3.5">
        {rules.map((r) => (
          <div key={r.id} className="bg-white border border-line rounded-[20px] p-4 flex items-center gap-3.5">
            <div
              className="w-12 h-12 rounded-[14px] grid place-items-center flex-shrink-0"
              style={{ background: tintBg[r.tint] }}
            >
              <Icon name={r.icon} size={22} color={tintColor[r.tint]} />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <div className="text-[15px] font-bold text-ink">{r.name}</div>
                <span
                  className={`inline-flex items-center gap-1 text-[10.5px] font-bold px-2 py-0.5 rounded-full ${
                    r.engine === "ai_recommendation" ? "bg-indigo-tint text-indigo-700" : "bg-surface-2 text-muted"
                  }`}
                >
                  {r.engine === "ai_recommendation" ? <Sparkles size={10} /> : <Zap size={10} />}
                  {r.engine === "ai_recommendation" ? "AI recommendation" : "Rule engine"}
                </span>
              </div>
              <div className="text-[13px] text-muted leading-relaxed">
                <span>If </span>
                <b className="text-indigo-700 font-bold">{r.metric}</b>
                {r.threshold ? (
                  <>
                    <span> {r.operator} </span>
                    <b className="text-indigo-700 font-bold">{r.threshold}</b>
                  </>
                ) : (
                  <span> {r.operator}</span>
                )}
                <span> · {r.frequency} → </span>
                <span className="inline-block bg-indigo-tint text-indigo-700 font-bold text-[12px] px-2 py-0.5 rounded-full align-middle">
                  {r.reward}
                </span>
                {r.engine === "ai_recommendation" ? (
                  <span> · always routed to a manager to approve, modify, or reject</span>
                ) : (
                  <>
                    {r.approval === "needs approval" && <span> · needs approval</span>}
                    {r.approval === "auto-approve" && <span> · auto-approve</span>}
                  </>
                )}
              </div>
            </div>

            <button
              onClick={() => toggle(r.id)}
              aria-label={`Toggle ${r.name}`}
              className={`w-[46px] h-[27px] rounded-2xl relative flex-shrink-0 transition-colors ${
                r.enabled ? "bg-mint" : "bg-line-2"
              }`}
            >
              <span
                className={`absolute w-[21px] h-[21px] rounded-full bg-white top-[3px] shadow-[var(--sh-sm)] transition-all ${
                  r.enabled ? "right-[3px]" : "left-[3px]"
                }`}
              />
            </button>
          </div>
        ))}
      </div>

      {showForm && (
        <div
          className="fixed inset-0 z-50 grid place-items-center p-4"
          style={{ background: "rgba(26, 20, 64, 0.45)" }}
          onClick={closeForm}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="New reward rule"
            className="bg-white rounded-[22px] shadow-[var(--sh-lg)] w-full max-w-[480px] max-h-[85vh] overflow-y-auto p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="text-[16px] font-bold text-ink">New reward rule</div>
              <button
                onClick={closeForm}
                aria-label="Close"
                className="w-8 h-8 grid place-items-center rounded-lg text-muted hover:bg-surface-2 hover:text-ink transition-colors"
              >
                <X size={17} />
              </button>
            </div>

            <div className="flex flex-col gap-3.5">
              <Field label="Rule name">
                <input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Sprint Completion Bonus"
                  className="w-full bg-surface-2 border border-line rounded-xl px-3 py-2.5 text-[13px] text-ink outline-none focus:border-indigo transition-colors"
                />
              </Field>

              <Field label="Evaluated by">
                <div className="flex gap-2">
                  <EngineOption
                    active={form.engine === "rule_engine"}
                    icon={<Zap size={13} />}
                    label="Rule engine"
                    sub="Deterministic threshold check"
                    onClick={() => setForm((f) => ({ ...f, engine: "rule_engine" }))}
                  />
                  <EngineOption
                    active={form.engine === "ai_recommendation"}
                    icon={<Sparkles size={13} />}
                    label="AI recommendation"
                    sub="Always sent to a manager"
                    onClick={() => setForm((f) => ({ ...f, engine: "ai_recommendation" }))}
                  />
                </div>
              </Field>

              <Field label="Metric">
                <input
                  value={form.metric}
                  onChange={(e) => setForm((f) => ({ ...f, metric: e.target.value }))}
                  placeholder="e.g. Sprint Completion"
                  className="w-full bg-surface-2 border border-line rounded-xl px-3 py-2.5 text-[13px] text-ink outline-none focus:border-indigo transition-colors"
                />
              </Field>

              {form.engine === "rule_engine" && (
                <div className="flex gap-3">
                  <Field label="Operator" className="w-[110px]">
                    <select
                      value={form.operator}
                      onChange={(e) => setForm((f) => ({ ...f, operator: e.target.value }))}
                      className="w-full bg-surface-2 border border-line rounded-xl px-3 py-2.5 text-[13px] text-ink outline-none focus:border-indigo transition-colors"
                    >
                      <option value="≥">≥</option>
                      <option value="≤">≤</option>
                      <option value="=">=</option>
                      <option value="received">received</option>
                      <option value="completed">completed</option>
                    </select>
                  </Field>
                  <Field label="Threshold" className="flex-1">
                    <input
                      value={form.threshold}
                      onChange={(e) => setForm((f) => ({ ...f, threshold: e.target.value }))}
                      placeholder="e.g. 100% or 7 days"
                      className="w-full bg-surface-2 border border-line rounded-xl px-3 py-2.5 text-[13px] text-ink outline-none focus:border-indigo transition-colors"
                    />
                  </Field>
                </div>
              )}

              <div className="flex gap-3">
                <Field label="Frequency" className="flex-1">
                  <select
                    value={form.frequency}
                    onChange={(e) => setForm((f) => ({ ...f, frequency: e.target.value as typeof form.frequency }))}
                    className="w-full bg-surface-2 border border-line rounded-xl px-3 py-2.5 text-[13px] text-ink outline-none focus:border-indigo transition-colors"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </Field>
                <Field label="Reward" className="flex-1">
                  <input
                    value={form.reward}
                    onChange={(e) => setForm((f) => ({ ...f, reward: e.target.value }))}
                    placeholder="e.g. +300 pts"
                    className="w-full bg-surface-2 border border-line rounded-xl px-3 py-2.5 text-[13px] text-ink outline-none focus:border-indigo transition-colors"
                  />
                </Field>
              </div>

              {form.engine === "rule_engine" ? (
                <Field label="Approval">
                  <div className="flex gap-2">
                    <EngineOption
                      active={form.approval === "auto-approve"}
                      label="Auto-approve"
                      onClick={() => setForm((f) => ({ ...f, approval: "auto-approve" }))}
                    />
                    <EngineOption
                      active={form.approval === "needs approval"}
                      label="Needs approval"
                      onClick={() => setForm((f) => ({ ...f, approval: "needs approval" }))}
                    />
                  </div>
                </Field>
              ) : (
                <div className="text-[12px] text-muted bg-surface-2 rounded-lg px-3 py-2">
                  AI-recommended rewards always route to a manager to approve, modify, or reject — no auto-approve.
                </div>
              )}

              <div className="flex gap-3">
                <Field label="Icon" className="flex-1">
                  <select
                    value={form.icon}
                    onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))}
                    className="w-full bg-surface-2 border border-line rounded-xl px-3 py-2.5 text-[13px] text-ink outline-none focus:border-indigo transition-colors"
                  >
                    {iconOptions.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Color" className="flex-1">
                  <div className="flex gap-2 pt-0.5">
                    {(["violet", "gold", "mint"] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        aria-label={t}
                        onClick={() => setForm((f) => ({ ...f, tint: t }))}
                        className={`w-9 h-9 rounded-xl grid place-items-center border-2 transition-colors ${
                          form.tint === t ? "border-ink" : "border-transparent"
                        }`}
                        style={{ background: tintBg[t] }}
                      >
                        <Icon name={form.icon} size={16} color={tintColor[t]} />
                      </button>
                    ))}
                  </div>
                </Field>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 mt-5 pt-4 border-t border-line">
              <button
                onClick={closeForm}
                className="text-[13.5px] font-bold text-muted hover:text-ink transition-colors px-4 py-2.5"
              >
                Cancel
              </button>
              <button
                onClick={createRule}
                className="bg-indigo hover:bg-indigo-600 transition-colors text-white font-bold text-[13.5px] rounded-xl px-4 py-2.5 shadow-[var(--sh-indigo)]"
              >
                Create rule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, className, children }: { label: string; className?: string; children: React.ReactNode }) {
  return (
    <label className={`flex flex-col gap-1.5 ${className || ""}`}>
      <span className="text-[12px] font-bold text-muted">{label}</span>
      {children}
    </label>
  );
}

function EngineOption({
  active,
  icon,
  label,
  sub,
  onClick,
}: {
  active: boolean;
  icon?: React.ReactNode;
  label: string;
  sub?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 text-left rounded-xl border px-3 py-2 transition-colors ${
        active ? "border-indigo bg-indigo-tint" : "border-line hover:bg-surface-2"
      }`}
    >
      <div className={`flex items-center gap-1.5 text-[12.5px] font-bold ${active ? "text-indigo-700" : "text-ink"}`}>
        {icon}
        {label}
      </div>
      {sub && <div className="text-[11px] text-muted mt-0.5">{sub}</div>}
    </button>
  );
}
