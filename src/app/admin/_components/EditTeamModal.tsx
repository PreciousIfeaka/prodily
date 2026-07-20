"use client";

import { useState, useEffect, startTransition } from "react";
import { updateTeamAction } from "@/app/actions/onboarding";
import { useToast } from "@/components/Toast";
import { Modal, Button, Field, Input, Textarea } from "@/components/ui";

type Team = { id: string; name: string; description?: string; size?: string };

export default function EditTeamModal({
  team,
  onClose,
  onDone,
}: {
  team: Team | null;
  onClose: () => void;
  onDone: () => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [size, setSize] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (team) {
      setName(team.name);
      setDescription(team.description || "");
      setSize(team.size || "");
      setError("");
    }
  }, [team]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!team) return;
    if (!name.trim()) {
      setError("Team name is required.");
      return;
    }
    setLoading(true);
    const fd = new FormData();
    fd.append("teamId", team.id);
    fd.append("name", name);
    fd.append("description", description);
    fd.append("size", size);
    startTransition(async () => {
      try {
        const res = await updateTeamAction(null, fd);
        if (res.success) {
          toast("Team updated.");
          onDone();
        } else {
          toast(res.error || "Failed to update team.");
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
      open={!!team}
      onClose={onClose}
      title="Edit team"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={submit} loading={loading}>Save changes</Button>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <Field label="Team name" required error={error}>
          {({ id, invalid }) => (
            <Input id={id} invalid={invalid} value={name} onChange={(e) => setName(e.target.value)} />
          )}
        </Field>
        <Field label="Description">
          {({ id }) => (
            <Textarea id={id} rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
          )}
        </Field>
        <Field label="Estimated size">
          {({ id }) => (
            <Input id={id} placeholder="e.g. 10" value={size} onChange={(e) => setSize(e.target.value)} />
          )}
        </Field>
      </form>
    </Modal>
  );
}
