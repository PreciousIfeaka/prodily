"use client";

import { useEffect, useState, startTransition } from "react";
import { getMeAction } from "@/app/actions/auth";
import {
  getActiveChallengesAction,
  createChallengeAction,
  claimAttendanceRewardAction,
} from "@/app/actions/challenges";
import { getTeamsAction } from "@/app/actions/onboarding";
import { Trophy, Plus, Target, Calendar, Sparkles } from "lucide-react";
import { useToast } from "@/components/Toast";
import {
  PageHeader,
  Card,
  Button,
  Badge,
  Modal,
  Field,
  Input,
  Select,
  EmptyState,
  ErrorState,
  SkeletonCard,
} from "@/components/ui";

export default function ChallengesPage() {
  const [user, setUser] = useState<any>(null);
  const [challenges, setChallenges] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  const [name, setName] = useState("");
  const [category, setCategory] = useState("SPRINT_COMPLETION");
  const [rewardPoints, setRewardPoints] = useState("");
  const [totalBudget, setTotalBudget] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [createLoading, setCreateLoading] = useState(false);

  const { celebrate, toast } = useToast();

  const loadData = async () => {
    setLoading(true);
    setError(false);
    try {
      const me = await getMeAction();
      if (me) {
        setUser(me);
        if (me.userRole === "ADMIN" || me.userRole === "TEAM_LEAD") {
          const teamsRes = await getTeamsAction();
          if (teamsRes?.success && teamsRes.teams) setTeams(teamsRes.teams);
        }
      }
      const chRes = await getActiveChallengesAction();
      if (chRes?.success && chRes.challenges) setChallenges(chRes.challenges);
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateChallenge = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = "Challenge title is required.";
    if (!rewardPoints) errs.rewardPoints = "Enter payout points.";
    if (!totalBudget) errs.totalBudget = "Enter an escrow budget.";
    if (!startDate) errs.startDate = "Pick a start date.";
    if (!endDate) errs.endDate = "Pick an end date.";
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setCreateLoading(true);
    const formData = new FormData();
    formData.append("name", name);
    formData.append("category", category);
    formData.append("rewardPoints", rewardPoints);
    formData.append("totalBudget", totalBudget);
    formData.append("startDate", startDate);
    formData.append("endDate", endDate);
    formData.append("teamIds", selectedTeams.join(","));
    startTransition(async () => {
      try {
        const res = await createChallengeAction(null, formData);
        if (res.success) {
          toast("Challenge launched.");
          setName("");
          setRewardPoints("");
          setTotalBudget("");
          setStartDate("");
          setEndDate("");
          setSelectedTeams([]);
          setCreateOpen(false);
          loadData();
        } else {
          toast(res.error || "Failed to create challenge.");
        }
      } catch {
        toast("Connection error.");
      } finally {
        setCreateLoading(false);
      }
    });
  };

  const handleClaimReward = (id: string) => {
    startTransition(async () => {
      try {
        const res = await claimAttendanceRewardAction(id);
        if (res.success) {
          // Earning a payout is a genuinely meaningful moment.
          celebrate("Reward points claimed and added to your wallet!");
          loadData();
        } else {
          toast(res.error || "Not eligible yet — keep logging hours.");
        }
      } catch {
        toast("Connection error.");
      }
    });
  };

  const toggleTeam = (teamId: string) =>
    setSelectedTeams((prev) =>
      prev.includes(teamId) ? prev.filter((id) => id !== teamId) : [...prev, teamId]
    );

  const isManagement = user?.userRole === "ADMIN" || user?.userRole === "TEAM_LEAD";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Challenges"
        subtitle="Participate in performance and attendance milestones to earn rewards."
        action={
          isManagement ? (
            <Button onClick={() => setCreateOpen(true)} icon={<Plus className="w-[18px] h-[18px]" />}>
              Launch challenge
            </Button>
          ) : undefined
        }
      />

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <SkeletonCard className="h-44" />
          <SkeletonCard className="h-44" />
        </div>
      ) : error ? (
        <ErrorState onRetry={loadData} message="We couldn't load challenges. Please try again." />
      ) : challenges.length === 0 ? (
        <EmptyState
          icon={<Trophy className="w-6 h-6" />}
          title="No active challenges"
          description={
            isManagement
              ? "Launch a challenge to get your teams competing."
              : "New challenges will appear here once your team lead publishes them."
          }
          action={
            isManagement ? (
              <Button onClick={() => setCreateOpen(true)} icon={<Plus className="w-[18px] h-[18px]" />}>
                Launch challenge
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {challenges.map((ch) => {
            const isAttendance = ch.category === "ATTENDANCE";
            return (
              <Card key={ch.id} className="p-5 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start gap-3 mb-2">
                    <Badge tone="brand">{ch.category.replace(/_/g, " ")}</Badge>
                    <span className="t-small font-medium text-[var(--brand-bright)]">
                      {ch.rewardPoints} pts
                    </span>
                  </div>
                  <h4 className="t-h3 text-[var(--text)] leading-snug">{ch.name}</h4>
                  <p className="t-caption text-[var(--muted)] mt-1 leading-relaxed">{ch.description}</p>
                  <div className="mt-4 space-y-2 border-t border-[var(--line)] pt-3 t-caption font-medium text-[var(--muted)]">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(ch.startDate).toLocaleDateString()} –{" "}
                      {new Date(ch.endDate).toLocaleDateString()}
                    </div>
                    {isAttendance && ch.metadata?.attendanceTargetHours && (
                      <div className="flex items-center gap-1.5 text-[var(--brand-bright)]">
                        <Target className="w-3.5 h-3.5" />
                        Target: {ch.metadata.attendanceTargetHours} hours
                      </div>
                    )}
                  </div>
                </div>
                {isAttendance && (
                  <div className="mt-4 pt-3 border-t border-[var(--line)]">
                    <Button
                      variant="subtle"
                      fullWidth
                      onClick={() => handleClaimReward(ch.id)}
                      icon={<Sparkles className="w-3.5 h-3.5" />}
                    >
                      Claim attendance payout
                    </Button>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Create challenge modal */}
      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Launch challenge"
        description="Create a sprint or attendance milestone with a reward pool."
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateChallenge} loading={createLoading}>Launch challenge</Button>
          </>
        }
      >
        <form onSubmit={handleCreateChallenge} className="space-y-4">
          <Field label="Challenge title" required error={errors.name}>
            {({ id, invalid }) => (
              <Input id={id} invalid={invalid} placeholder="e.g. Q3 Sprint Completion" value={name} onChange={(e) => setName(e.target.value)} />
            )}
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Category">
              {({ id }) => (
                <Select id={id} value={category} onChange={(e) => setCategory(e.target.value)}>
                  <option value="SPRINT_COMPLETION">Sprint completion</option>
                  <option value="PRODUCT_LAUNCH">Product launch</option>
                  <option value="ATTENDANCE">Attendance milestone</option>
                  <option value="INNOVATION">Innovation grants</option>
                </Select>
              )}
            </Field>
            <Field label="Payout points" required error={errors.rewardPoints}>
              {({ id, invalid }) => (
                <Input id={id} invalid={invalid} type="number" placeholder="500" value={rewardPoints} onChange={(e) => setRewardPoints(e.target.value)} />
              )}
            </Field>
          </div>
          <Field label="Escrow budget (₦)" required error={errors.totalBudget}>
            {({ id, invalid }) => (
              <Input id={id} invalid={invalid} type="number" placeholder="e.g. 50000" value={totalBudget} onChange={(e) => setTotalBudget(e.target.value)} />
            )}
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Start date" required error={errors.startDate}>
              {({ id, invalid }) => (
                <Input id={id} invalid={invalid} type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              )}
            </Field>
            <Field label="End date" required error={errors.endDate}>
              {({ id, invalid }) => (
                <Input id={id} invalid={invalid} type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              )}
            </Field>
          </div>
          {user?.userRole === "ADMIN" && teams.length > 0 && (
            <Field label="Eligible teams">
              {() => (
                <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1 rounded-[var(--r)] border border-[var(--line)] p-3">
                  {teams.map((t) => (
                    <label key={t.id} className="flex items-center gap-2 t-small font-medium cursor-pointer text-[var(--text)]">
                      <input
                        type="checkbox"
                        checked={selectedTeams.includes(t.id)}
                        onChange={() => toggleTeam(t.id)}
                        className="accent-[var(--brand)]"
                      />
                      {t.name}
                    </label>
                  ))}
                </div>
              )}
            </Field>
          )}
        </form>
      </Modal>
    </div>
  );
}
