"use client";

import { useState, startTransition } from "react";
import { inviteUserAction } from "@/app/actions/onboarding";
import { useToast } from "@/components/Toast";
import { Modal, Button, Field, Input, Select } from "@/components/ui";

export type Team = { id: string; name: string };

export default function InviteEmployeeModal({
  open,
  onClose,
  teams,
}: {
  open: boolean;
  onClose: () => void;
  teams: Team[];
}) {
  const [email, setEmail] = useState("");
  const [teamId, setTeamId] = useState(teams[0]?.id ?? "");
  const [role, setRole] = useState("TEAM_MEMBER");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const needsTeam = role !== "ADMIN";

  const handleClose = () => {
    setGeneratedLink(null);
    setCopied(false);
    setEmail("");
    onClose();
  };

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
          const fullLink = `${window.location.origin}${res.inviteLink}`;
          setGeneratedLink(fullLink);
          toast("Invitation link generated.");
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

  if (generatedLink) {
    return (
      <Modal
        open={open}
        onClose={handleClose}
        title="Invite generated!"
        description="Share this unique invitation link with the employee."
        footer={
          <Button onClick={handleClose} fullWidth>
            Done
          </Button>
        }
      >
        <div className="space-y-4">
          <div className="p-4 bg-[var(--brand-tint)] rounded-[var(--r)] border border-[var(--brand)]/20 flex flex-col items-center justify-center text-center space-y-1">
            <span className="text-[var(--brand-bright)] font-semibold">Teammate Invited!</span>
            <span className="t-caption text-[var(--muted)]">Send this single-use registration URL to the user.</span>
          </div>

          <Field label="Invitation link">
            {({ id }) => (
              <div className="flex gap-2" id={id}>
                <Input
                  readOnly
                  value={generatedLink}
                  className="font-mono text-xs select-all bg-[var(--surface-2)] border-[var(--line-2)] flex-1"
                />
                <Button
                  variant="secondary"
                  onClick={() => {
                    navigator.clipboard.writeText(generatedLink);
                    setCopied(true);
                    toast("Link copied to clipboard.");
                    setTimeout(() => setCopied(false), 2000);
                  }}
                >
                  {copied ? "Copied" : "Copy"}
                </Button>
              </div>
            )}
          </Field>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Invite employee"
      description="Generate a signed invitation link for a teammate."
      footer={
        <>
          <Button variant="ghost" onClick={handleClose}>Cancel</Button>
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
