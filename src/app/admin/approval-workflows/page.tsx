"use client";

import { useEffect, useState, startTransition } from "react";
import { createWorkflowRuleAction, listWorkflowRulesAction } from "@/app/actions/wallet";
import { Plus, Info, Layers } from "lucide-react";
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
  Table,
  Tr,
  Td,
  EmptyState,
  ErrorState,
  SkeletonCard,
} from "@/components/ui";

export default function ApprovalWorkflowsPage() {
  const [rules, setRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [open, setOpen] = useState(false);

  const [category, setCategory] = useState("MEDICAL");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [stages, setStages] = useState("TEAM_LEAD, ADMIN");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formLoading, setFormLoading] = useState(false);

  const { toast } = useToast();

  const loadRules = async () => {
    setLoading(true);
    setError(false);
    try {
      const result = await listWorkflowRulesAction();
      if (result) setRules(result);
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRules();
  }, []);

  const handleCreateRule = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!minAmount) errs.minAmount = "Required.";
    if (!maxAmount) errs.maxAmount = "Required.";
    if (!stages.trim()) errs.stages = "Enter the sign-off sequence.";
    setErrors(errs);
    if (Object.keys(errs).length) return;

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
          toast("Approval rule created.");
          setMinAmount("");
          setMaxAmount("");
          setStages("TEAM_LEAD, ADMIN");
          setOpen(false);
          loadRules();
        } else {
          toast(res.error || "Failed to create rule.");
        }
      } catch {
        toast("Connection error.");
      } finally {
        setFormLoading(false);
      }
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Approval Workflows"
        subtitle="Define multi-stage approval rules by disbursement category and amount."
        action={
          <Button onClick={() => setOpen(true)} icon={<Plus className="w-[18px] h-[18px]" />}>
            New rule
          </Button>
        }
      />

      {/* Defaults info */}
      <Card className="p-6">
        <h3 className="t-h3 text-[var(--text)] mb-3 flex items-center gap-2">
          <Info className="w-5 h-5 text-[var(--brand-bright)]" /> Default fallback hierarchy
        </h3>
        <p className="t-small text-[var(--muted)] mb-4">
          When no custom rule matches, the system uses these defaults:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="flex items-center justify-between p-3 rounded-[var(--r)] bg-[var(--surface-2)] border border-[var(--line)]">
            <span className="t-small font-medium text-[var(--text)]">≤ ₦5,000</span>
            <Badge tone="success">Auto-approve</Badge>
          </div>
          <div className="flex items-center justify-between p-3 rounded-[var(--r)] bg-[var(--surface-2)] border border-[var(--line)]">
            <span className="t-small font-medium text-[var(--text)]">₦5k–₦20k</span>
            <Badge tone="brand">Team lead</Badge>
          </div>
          <div className="flex items-center justify-between p-3 rounded-[var(--r)] bg-[var(--surface-2)] border border-[var(--line)]">
            <span className="t-small font-medium text-[var(--text)]">&gt; ₦20,000</span>
            <Badge tone="warning">Lead → Admin</Badge>
          </div>
        </div>
      </Card>

      {/* Custom rules */}
      <Card className="p-6">
        <h3 className="t-h3 text-[var(--text)] mb-4 flex items-center gap-2">
          <Layers className="w-5 h-5 text-[var(--brand-bright)]" /> Custom rules
        </h3>
        {loading ? (
          <div className="space-y-3">
            <SkeletonCard className="h-14" />
            <SkeletonCard className="h-14" />
          </div>
        ) : error ? (
          <ErrorState onRetry={loadRules} message="We couldn't load workflow rules. Please try again." />
        ) : rules.length === 0 ? (
          <EmptyState
            icon={<Layers className="w-6 h-6" />}
            title="No custom rules"
            description="Default fallback thresholds govern requests until you add a rule."
            action={
              <Button onClick={() => setOpen(true)} icon={<Plus className="w-[18px] h-[18px]" />}>
                New rule
              </Button>
            }
          />
        ) : (
          <Table columns={["Category", "Range", "Sign-off sequence"]} caption="Custom approval workflow rules">
            {rules.map((rule) => (
              <Tr key={rule.id}>
                <Td>
                  <Badge tone="brand">{rule.category.replace(/_/g, " ")}</Badge>
                </Td>
                <Td className="font-medium">
                  ₦{Number(rule.minAmount).toLocaleString()} – ₦{Number(rule.maxAmount).toLocaleString()}
                </Td>
                <Td className="text-[var(--brand-bright)] font-medium">{rule.stages?.join(" → ")}</Td>
              </Tr>
            ))}
          </Table>
        )}
      </Card>

      {/* Create rule modal */}
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="New approval rule"
        description="Create a custom sign-off hierarchy for disbursements."
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateRule} loading={formLoading}>Create rule</Button>
          </>
        }
      >
        <form onSubmit={handleCreateRule} className="space-y-4">
          <Field label="Reward category">
            {({ id }) => (
              <Select id={id} value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="MEDICAL">Medical support</option>
                <option value="FINANCIAL">Financial support</option>
                <option value="EQUIPMENT">Equipment support</option>
                <option value="TRANSPORT">Transport support</option>
                <option value="LUNCH">Lunch support</option>
                <option value="AIRTIME">Airtime support</option>
                <option value="INTERNET">Internet support</option>
                <option value="ATTENDANCE">Attendance completion</option>
                <option value="INNOVATION">Innovation & idea grants</option>
                <option value="SPRINT_COMPLETION">Sprint completion</option>
                <option value="PRODUCT_LAUNCH">Product launch</option>
                <option value="ALL">All categories (fallback)</option>
              </Select>
            )}
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Min amount (₦)" required error={errors.minAmount}>
              {({ id, invalid }) => (
                <Input id={id} invalid={invalid} type="number" placeholder="0" value={minAmount} onChange={(e) => setMinAmount(e.target.value)} />
              )}
            </Field>
            <Field label="Max amount (₦)" required error={errors.maxAmount}>
              {({ id, invalid }) => (
                <Input id={id} invalid={invalid} type="number" placeholder="50000" value={maxAmount} onChange={(e) => setMaxAmount(e.target.value)} />
              )}
            </Field>
          </div>
          <Field label="Approver stages" required error={errors.stages} hint="Comma-separated roles in order of sign-off.">
            {({ id, invalid }) => (
              <Input id={id} invalid={invalid} placeholder="e.g. TEAM_LEAD, ADMIN" value={stages} onChange={(e) => setStages(e.target.value)} />
            )}
          </Field>
        </form>
      </Modal>
    </div>
  );
}
