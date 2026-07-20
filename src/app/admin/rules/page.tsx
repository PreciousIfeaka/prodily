"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Sparkles, Zap, ArrowRight } from "lucide-react";
import { rewardRules as initialRules, RewardRule } from "@/lib/data";
import Icon from "@/components/ui/Icon";
import { useToast } from "@/components/Toast";
import {
  PageHeader,
  Card,
  Badge,
  Button,
  Modal,
  Field,
  Input,
  Select,
} from "@/components/ui";

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
    <div className="space-y-6">
      <PageHeader
        title="Reward Rules"
        subtitle={`${rules.length} active rules · evaluated automatically`}
        action={
          <>
            <Badge tone="warning">Sample data</Badge>
            <Button onClick={() => setShowForm(true)} icon={<Plus className="w-[18px] h-[18px]" />}>
              New rule
            </Button>
          </>
        }
      />

      <Link
        href="/admin/pipeline"
        className="flex items-center justify-between gap-3 bg-[var(--brand-tint)] border border-[var(--brand)]/20 rounded-[var(--r)] px-4 py-3 group hover:bg-[var(--brand)]/15 transition"
      >
        <div className="t-small text-[var(--brand-bright)]">
          <b className="font-medium">See these rules in action</b> — track requests through the reward pipeline board.
        </div>
        <ArrowRight size={16} className="text-[var(--brand-bright)] shrink-0 group-hover:translate-x-0.5 transition-transform" />
      </Link>

      <div className="space-y-3">
        {rules.map((r) => (
          <Card key={r.id} className="p-4 flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-[var(--r)] grid place-items-center shrink-0 bg-[var(--surface-3)] text-[var(--brand-bright)]">
              <Icon name={r.icon} size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <div className="t-small font-medium text-[var(--text)]">{r.name}</div>
                <Badge tone={r.engine === "ai_recommendation" ? "brand" : "neutral"}>
                  {r.engine === "ai_recommendation" ? <Sparkles size={10} /> : <Zap size={10} />}
                  {r.engine === "ai_recommendation" ? "AI" : "Rule engine"}
                </Badge>
              </div>
              <div className="t-caption text-[var(--muted)] leading-relaxed">
                If <b className="text-[var(--brand-bright)] font-medium">{r.metric}</b>
                {r.threshold ? (
                  <> {r.operator} <b className="text-[var(--brand-bright)] font-medium">{r.threshold}</b></>
                ) : (
                  <> {r.operator}</>
                )}{" "}
                · {r.frequency} →{" "}
                <span className="inline-block bg-[var(--brand-tint)] text-[var(--brand-bright)] font-medium t-caption px-2 py-0.5 rounded-[var(--r-pill)] align-middle">
                  {r.reward}
                </span>
                {r.engine === "ai_recommendation"
                  ? " · always routed to a manager"
                  : r.approval === "needs approval"
                  ? " · needs approval"
                  : " · auto-approve"}
              </div>
            </div>
            <button
              onClick={() => toggle(r.id)}
              aria-label={`Toggle ${r.name}`}
              className={`w-[46px] h-[27px] rounded-[var(--r-pill)] relative shrink-0 transition-colors ${
                r.enabled ? "bg-[var(--brand)]" : "bg-[var(--surface-3)]"
              }`}
            >
              <span
                className={`absolute w-[21px] h-[21px] rounded-full bg-white top-[3px] shadow-[var(--sh-sm)] transition-all ${
                  r.enabled ? "right-[3px]" : "left-[3px]"
                }`}
              />
            </button>
          </Card>
        ))}
      </div>

      <Modal
        open={showForm}
        onClose={closeForm}
        title="New reward rule"
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={closeForm}>Cancel</Button>
            <Button onClick={createRule}>Create rule</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Rule name">
            {({ id }) => (
              <Input id={id} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Sprint Completion Bonus" />
            )}
          </Field>
          <Field label="Evaluated by">
            {() => (
              <div className="grid grid-cols-2 gap-2">
                {(["rule_engine", "ai_recommendation"] as const).map((eng) => (
                  <button
                    key={eng}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, engine: eng }))}
                    className={`text-left rounded-[var(--r)] border px-3 py-2 transition-colors ${
                      form.engine === eng ? "border-[var(--brand)] bg-[var(--brand-tint)]" : "border-[var(--line-2)] hover:bg-[var(--surface-3)]"
                    }`}
                  >
                    <div className={`flex items-center gap-1.5 t-small font-medium ${form.engine === eng ? "text-[var(--brand-bright)]" : "text-[var(--text)]"}`}>
                      {eng === "rule_engine" ? <Zap size={13} /> : <Sparkles size={13} />}
                      {eng === "rule_engine" ? "Rule engine" : "AI recommendation"}
                    </div>
                    <div className="t-caption text-[var(--muted)] mt-0.5">
                      {eng === "rule_engine" ? "Deterministic threshold check" : "Always sent to a manager"}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </Field>
          <Field label="Metric">
            {({ id }) => (
              <Input id={id} value={form.metric} onChange={(e) => setForm((f) => ({ ...f, metric: e.target.value }))} placeholder="e.g. Sprint Completion" />
            )}
          </Field>
          {form.engine === "rule_engine" && (
            <div className="grid grid-cols-3 gap-3">
              <Field label="Operator">
                {({ id }) => (
                  <Select id={id} value={form.operator} onChange={(e) => setForm((f) => ({ ...f, operator: e.target.value }))}>
                    <option value="≥">≥</option>
                    <option value="≤">≤</option>
                    <option value="=">=</option>
                    <option value="received">received</option>
                    <option value="completed">completed</option>
                  </Select>
                )}
              </Field>
              <Field label="Threshold" className="col-span-2">
                {({ id }) => (
                  <Input id={id} value={form.threshold} onChange={(e) => setForm((f) => ({ ...f, threshold: e.target.value }))} placeholder="e.g. 100% or 7 days" />
                )}
              </Field>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Frequency">
              {({ id }) => (
                <Select id={id} value={form.frequency} onChange={(e) => setForm((f) => ({ ...f, frequency: e.target.value as typeof form.frequency }))}>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </Select>
              )}
            </Field>
            <Field label="Reward">
              {({ id }) => (
                <Input id={id} value={form.reward} onChange={(e) => setForm((f) => ({ ...f, reward: e.target.value }))} placeholder="e.g. +300 pts" />
              )}
            </Field>
          </div>
        </div>
      </Modal>
    </div>
  );
}
