"use client";

import { useState, startTransition } from "react";
import { createTeamAction } from "@/app/actions/onboarding";
import { useToast } from "@/components/Toast";
import { Modal, Button, Field, Input, Textarea } from "@/components/ui";

export default function CreateTeamModal({
  open,
  onClose,
  onDone,
}: {
  open: boolean;
  onClose: () => void;
  onDone: (team: any) => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [size, setSize] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Team name is required.");
      return;
    }
    setLoading(true);
    const fd = new FormData();
    fd.append("name", name);
    fd.append("description", description);
    fd.append("size", size);
    startTransition(async () => {
      try {
        const res = await createTeamAction(null, fd);
        if (res.success && res.team) {
          toast(`Team "${res.team.name}" created.`);
          setName("");
          setDescription("");
          setSize("");
          setError("");
          onDone(res.team);
        } else {
          toast(res.error || "Failed to create team.");
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
      title="Create department / team"
      description="Provision a new team with a dedicated wallet."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={submit} loading={loading}>Create team</Button>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <Field label="Team name" required error={error}>
          {({ id, invalid }) => (
            <Input
              id={id}
              invalid={invalid}
              placeholder="e.g. Design, Frontend Engineering"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError("");
              }}
            />
          )}
        </Field>
        <Field label="Description">
          {({ id }) => (
            <Textarea id={id} rows={2} placeholder="Sub-budget details" value={description} onChange={(e) => setDescription(e.target.value)} />
          )}
        </Field>
        <Field label="Estimated size">
          {({ id }) => (
            <Input id={id} type="number" min="1" placeholder="10" value={size} onChange={(e) => setSize(e.target.value)} />
          )}
        </Field>
      </form>
    </Modal>
  );
}
