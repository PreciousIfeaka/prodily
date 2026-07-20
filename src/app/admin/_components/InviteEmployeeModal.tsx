"use client";

import { useState, startTransition } from "react";
import { inviteUserAction } from "@/app/actions/onboarding";
import { useToast } from "@/components/Toast";
import { Modal, Button, Field, Input, Select } from "@/components/ui";

export type Team = { id: string; name: string };
export type Invite = {
  email: string;
  role: string;
  inviteLink: string;
  teamName: string;
  expiresAt: string;
};

export default function InviteEmployeeModal({
  open,
  onClose,
  teams,
  onDone,
}: {
  open: boolean;
  onClose: () => void;
  teams: Team[];
  onDone: (invite: Invite) => void;
}) {
  const [email, setEmail] = useState("");
  const [teamId, setTeamId] = useState(teams[0]?.id ?? "");
  const [role, setRole] = useState("TEAM_MEMBER");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const needsTeam = role !== "ADMIN";

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!email.trim()) errs.email = "Work email is required.";
    if (needsTeam && !teamId) errs.teamId = "Select a team.";
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setLoading(true);
    const fd = new FormData();
    fd.append("email", email);
    if (needsTeam) fd.append("teamId", teamId);
    fd.append("role", role);
    startTransition(async () => {
      try {
        const res = await inviteUserAction(null, fd);
        if (res.success && res.inviteLink) {
          const target = needsTeam ? teams.find((t) => t.id === teamId) : null;
          toast("Invitation link generated.");
          onDone({
            email: res.email,
            role: res.role,
            inviteLink: res.inviteLink,
            teamName: target ? target.name : "Organization Admin",
            expiresAt: res.expiresAt,
          });
          setEmail("");
        } else {
          toast(res.error || "Failed to generate invite.");
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
      title="Invite employee"
      description="Generate a signed invitation link for a teammate."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={submit} loading={loading} disabled={needsTeam && teams.length === 0}>
            Generate invite
          </Button>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <Field label="Work email address" required error={errors.email}>
          {({ id, invalid }) => (
            <Input id={id} invalid={invalid} type="email" placeholder="employee@company.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          )}
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Workspace role">
            {({ id }) => (
              <Select id={id} value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="TEAM_MEMBER">Team member</option>
                <option value="TEAM_LEAD">Team lead</option>
                <option value="ADMIN">HR admin</option>
              </Select>
            )}
          </Field>
          <Field label="Assign to team" error={errors.teamId}>
            {({ id, invalid }) => (
              <Select
                id={id}
                invalid={invalid}
                value={needsTeam ? teamId : ""}
                onChange={(e) => setTeamId(e.target.value)}
                disabled={!needsTeam}
              >
                {!needsTeam ? (
                  <option value="">N/A (org admin)</option>
                ) : (
                  <>
                    <option value="" disabled>Select team</option>
                    {teams.map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </>
                )}
              </Select>
            )}
          </Field>
        </div>
        {needsTeam && teams.length === 0 && (
          <p className="t-caption text-[var(--rose)]">Create at least one team first.</p>
        )}
      </form>
    </Modal>
  );
}
