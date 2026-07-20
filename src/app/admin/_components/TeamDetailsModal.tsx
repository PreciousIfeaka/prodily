"use client";

import { useEffect, useState, startTransition } from "react";
import { getTeamDetailsAction, addTeamMemberAction } from "@/app/actions/onboarding";
import { useToast } from "@/components/Toast";
import { Modal, Button, Field, Input, Badge, Avatar, EmptyState, Spinner } from "@/components/ui";
import { Users } from "lucide-react";

export default function TeamDetailsModal({
  team,
  onClose,
}: {
  team: { id: string; name: string; description?: string } | null;
  onClose: () => void;
}) {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [adding, setAdding] = useState(false);
  const { toast } = useToast();

  const load = () => {
    if (!team) return;
    setLoading(true);
    startTransition(async () => {
      try {
        const res = await getTeamDetailsAction(team.id);
        if (res.success && res.team) setMembers(res.team.users || []);
      } catch {
        toast("Failed to load team members.");
      } finally {
        setLoading(false);
      }
    });
  };

  useEffect(() => {
    if (team) {
      setMembers([]);
      load();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [team?.id]);

  const addMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!team) return;
    if (!email.trim()) {
      setError("Enter an email.");
      return;
    }
    setAdding(true);
    const fd = new FormData();
    fd.append("teamId", team.id);
    fd.append("email", email);
    startTransition(async () => {
      try {
        const res = await addTeamMemberAction(null, fd);
        if (res.success) {
          toast("Member added to team.");
          setEmail("");
          setError("");
          load();
        } else {
          toast(res.error || "Failed to add member.");
        }
      } catch {
        toast("Connection error.");
      } finally {
        setAdding(false);
      }
    });
  };

  return (
    <Modal
      open={!!team}
      onClose={onClose}
      title={team?.name}
      description={team?.description || undefined}
      size="lg"
    >
      <div className="space-y-5">
        <div>
          <h4 className="t-small font-medium text-[var(--text)] mb-3 flex items-center gap-2">
            <Users className="w-4 h-4 text-[var(--brand-bright)]" /> Team members ({members.length})
          </h4>
          {loading ? (
            <div className="flex items-center gap-2 t-small text-[var(--muted)] py-4">
              <Spinner size={16} /> Loading members…
            </div>
          ) : members.length === 0 ? (
            <EmptyState
              icon={<Users className="w-6 h-6" />}
              title="No members yet"
              description="Invite employees to join this team."
            />
          ) : (
            <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
              {members.map((m) => (
                <div key={m.id} className="flex items-center justify-between p-2.5 bg-[var(--surface-2)] rounded-[var(--r)] border border-[var(--line)]">
                  <div className="flex items-center gap-3">
                    <Avatar name={`${m.firstName} ${m.lastName}`} size={34} />
                    <div>
                      <div className="t-small font-medium text-[var(--text)]">
                        {m.firstName} {m.lastName}
                      </div>
                      <div className="t-caption text-[var(--muted)]">{m.email}</div>
                    </div>
                  </div>
                  <Badge tone="brand">{m.userRole?.replace(/_/g, " ")}</Badge>
                </div>
              ))}
            </div>
          )}
        </div>

        <form onSubmit={addMember} className="border-t border-[var(--line)] pt-4 space-y-3">
          <Field label="Add member (must already be onboarded)" error={error}>
            {({ id, invalid }) => (
              <div className="flex gap-2">
                <Input
                  id={id}
                  invalid={invalid}
                  type="email"
                  placeholder="employee@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={addMember} loading={adding}>Add</Button>
              </div>
            )}
          </Field>
        </form>
      </div>
    </Modal>
  );
}
