"use client";

import { useState, startTransition } from "react";
import { fundOrgWalletAction, fundTeamWalletAction } from "@/app/actions/wallet";
import { useToast } from "@/components/Toast";
import { Modal, Button, Field, Input, Select, Tabs } from "@/components/ui";

export default function FundWalletModal({
  open,
  onClose,
  organizationId,
  teamWallets,
  onDone,
}: {
  open: boolean;
  onClose: () => void;
  organizationId: string;
  teamWallets: any[];
  onDone: () => void;
}) {
  const [mode, setMode] = useState("org");
  const [orgAmount, setOrgAmount] = useState("");
  const [teamId, setTeamId] = useState(teamWallets[0]?.team?.id ?? "");
  const [teamAmount, setTeamAmount] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const submitOrg = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgAmount) {
      setErrors({ orgAmount: "Enter an amount." });
      return;
    }
    setLoading(true);
    const fd = new FormData();
    fd.append("organizationId", organizationId);
    fd.append("amount", orgAmount);
    startTransition(async () => {
      try {
        const res = await fundOrgWalletAction(null, fd);
        if (res.success) {
          toast("Organization wallet funded.");
          setOrgAmount("");
          onDone();
        } else {
          toast(res.error || "Failed to fund organization wallet.");
        }
      } catch {
        toast("Connection error.");
      } finally {
        setLoading(false);
      }
    });
  };

  const submitTeam = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!teamId) errs.teamId = "Select a team.";
    if (!teamAmount) errs.teamAmount = "Enter an amount.";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setLoading(true);
    const fd = new FormData();
    fd.append("teamId", teamId);
    fd.append("amount", teamAmount);
    startTransition(async () => {
      try {
        const res = await fundTeamWalletAction(null, fd);
        if (res.success) {
          toast("Team wallet funded.");
          setTeamAmount("");
          onDone();
        } else {
          toast(res.error || "Failed to fund team wallet.");
        }
      } catch {
        toast("Connection error.");
      } finally {
        setLoading(false);
      }
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Fund wallet"
      description="Add funds to the org wallet or allocate budget to a team."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          {mode === "org" ? (
            <Button onClick={submitOrg} loading={loading}>Fund org wallet</Button>
          ) : (
            <Button onClick={submitTeam} loading={loading} disabled={teamWallets.length === 0}>
              Allocate budget
            </Button>
          )}
        </>
      }
    >
      <div className="space-y-4">
        <Tabs
          tabs={[
            { key: "org", label: "Organization" },
            { key: "team", label: "Team budget" },
          ]}
          active={mode}
          onChange={setMode}
        />
        {mode === "org" ? (
          <form onSubmit={submitOrg}>
            <Field label="Amount (NGN)" required error={errors.orgAmount}>
              {({ id, invalid }) => (
                <Input id={id} invalid={invalid} type="number" min="100" placeholder="e.g. 50000" value={orgAmount} onChange={(e) => setOrgAmount(e.target.value)} />
              )}
            </Field>
          </form>
        ) : (
          <form onSubmit={submitTeam} className="space-y-4">
            <Field label="Department / team" required error={errors.teamId}>
              {({ id, invalid }) => (
                <Select id={id} invalid={invalid} value={teamId} onChange={(e) => setTeamId(e.target.value)}>
                  <option value="" disabled>Select team</option>
                  {teamWallets.map((w) => (
                    <option key={w.team.id} value={w.team.id}>
                      {w.team.name} (bal: ₦{Number(w.balance).toLocaleString()})
                    </option>
                  ))}
                </Select>
              )}
            </Field>
            <Field label="Allocation amount (NGN)" required error={errors.teamAmount}>
              {({ id, invalid }) => (
                <Input id={id} invalid={invalid} type="number" min="1" placeholder="e.g. 10000" value={teamAmount} onChange={(e) => setTeamAmount(e.target.value)} />
              )}
            </Field>
          </form>
        )}
      </div>
    </Modal>
  );
}
