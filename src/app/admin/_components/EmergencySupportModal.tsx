"use client";

import { useEffect, useState, startTransition } from "react";
import { disburseEmergencySupportAction } from "@/app/actions/wallet";
import { getTeamDetailsAction } from "@/app/actions/onboarding";
import { useToast } from "@/components/Toast";
import { Modal, Button, Field, Input, Select, Spinner } from "@/components/ui";

type Person = { id: string; firstName?: string; lastName?: string; email?: string };

export default function EmergencySupportModal({
  open,
  onClose,
  teams,
  onDone,
}: {
  open: boolean;
  onClose: () => void;
  teams: { id: string; name: string }[];
  onDone: () => void;
}) {
  const [people, setPeople] = useState<Person[]>([]);
  const [peopleLoading, setPeopleLoading] = useState(false);
  const [recipientId, setRecipientId] = useState("");
  const [category, setCategory] = useState("MEDICAL");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Build a recipient picker by aggregating members across teams (no list-users endpoint exists).
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setPeopleLoading(true);
    (async () => {
      try {
        const results = await Promise.all(teams.map((t) => getTeamDetailsAction(t.id)));
        if (cancelled) return;
        const map = new Map<string, Person>();
        results.forEach((r) => {
          if (r?.success && r.team?.users) {
            r.team.users.forEach((u: Person) => map.set(u.id, u));
          }
        });
        setPeople([...map.values()]);
      } catch {
        if (!cancelled) setPeople([]);
      } finally {
        if (!cancelled) setPeopleLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, teams]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientId.trim()) {
      setErrors({ recipientId: "Choose a recipient." });
      return;
    }
    setLoading(true);
    const fd = new FormData();
    fd.append("recipientId", recipientId);
    fd.append("category", category);
    startTransition(async () => {
      try {
        const res = await disburseEmergencySupportAction(null, fd);
        if (res.success) {
          toast("Support disbursement submitted for sign-off.");
          setRecipientId("");
          onDone();
        } else {
          toast(res.error || "Failed to disburse support.");
        }
      } catch {
        toast("Connection error.");
      } finally {
        setLoading(false);
      }
    });
  };

  const name = (p: Person) =>
    [p.firstName, p.lastName].filter(Boolean).join(" ") || p.email || p.id;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Emergency support"
      description="Disburse direct assistance to an employee. Submits to the workflow sign-off chain."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={submit} loading={loading}>Submit request</Button>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <Field label="Recipient" required error={errors.recipientId}>
          {({ id, invalid }) =>
            peopleLoading ? (
              <div className="flex items-center gap-2 t-small text-[var(--muted)] py-2">
                <Spinner size={16} /> Loading team members…
              </div>
            ) : people.length > 0 ? (
              <Select id={id} invalid={invalid} value={recipientId} onChange={(e) => setRecipientId(e.target.value)}>
                <option value="" disabled>Select an employee</option>
                {people.map((p) => (
                  <option key={p.id} value={p.id}>
                    {name(p)}{p.email ? ` · ${p.email}` : ""}
                  </option>
                ))}
              </Select>
            ) : (
              <Input
                id={id}
                invalid={invalid}
                placeholder="Recipient user ID"
                value={recipientId}
                onChange={(e) => setRecipientId(e.target.value)}
              />
            )
          }
        </Field>
        <Field label="Support category">
          {({ id }) => (
            <Select id={id} value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="MEDICAL">Medical</option>
              <option value="FINANCIAL">Financial</option>
              <option value="EQUIPMENT">Equipment</option>
              <option value="TRANSPORT">Transport</option>
              <option value="LUNCH">Lunch</option>
            </Select>
          )}
        </Field>
      </form>
    </Modal>
  );
}
