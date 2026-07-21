"use client";

import { useEffect, useState, startTransition } from "react";
import { Plus, Sparkles, Zap } from "lucide-react";
import { getActiveChallengesAction, createChallengeAction } from "@/app/actions/challenges";
import { getTeamsAction } from "@/app/actions/onboarding";
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
  Spinner,
  EmptyState,
} from "@/components/ui";

export default function RulesPage() {
  const [challenges, setChallenges] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();

  // Form State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("SPRINT_COMPLETION");
  const [rewardPoints, setRewardPoints] = useState("");
  const [totalBudget, setTotalBudget] = useState("");
  const [teamId, setTeamId] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [challengesRes, teamsRes] = await Promise.all([
        getActiveChallengesAction(),
        getTeamsAction(),
      ]);
      if (challengesRes.success && challengesRes.challenges) {
        setChallenges(challengesRes.challenges);
      }
      if (teamsRes?.success && teamsRes.teams) {
        setTeams(teamsRes.teams);
      }
    } catch (err) {
      console.error(err);
      toast("Failed to load rules data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const closeForm = () => {
    setShowForm(false);
    setName("");
    setDescription("");
    setCategory("SPRINT_COMPLETION");
    setRewardPoints("");
    setTotalBudget("");
    setTeamId("");
  };

  const handleCreateRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !rewardPoints || !totalBudget) {
      toast("Name, points, and budget are required.");
      return;
    }

    setFormLoading(true);
    const fd = new FormData();
    fd.append("name", name.trim());
    fd.append("category", category);
    fd.append("rewardPoints", rewardPoints);
    fd.append("totalBudget", totalBudget);
    
    // Default start/end dates
    const start = new Date();
    const end = new Date();
    end.setDate(end.getDate() + 30); // 30 days duration
    fd.append("startDate", start.toISOString());
    fd.append("endDate", end.toISOString());

    if (teamId) {
      fd.append("teamIds", teamId);
    }

    startTransition(async () => {
      try {
        const res = await createChallengeAction(null, fd);
        if (res.success) {
          toast(`Rule "${name}" created successfully.`);
          closeForm();
          loadData();
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

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case "SPRINT_COMPLETION":
        return "zap";
      case "PRODUCT_LAUNCH":
        return "sparkles";
      case "ATTENDANCE":
        return "circlecheck";
      default:
        return "trophy";
    }
  };

  const getCategoryTint = (cat: string) => {
    switch (cat) {
      case "SPRINT_COMPLETION":
        return "violet";
      case "PRODUCT_LAUNCH":
        return "brand";
      case "ATTENDANCE":
        return "emerald";
      default:
        return "amber";
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reward Rules"
        subtitle={`${challenges.length} active rules · evaluated automatically`}
        action={
          <Button onClick={() => setShowForm(true)} icon={<Plus className="w-[18px] h-[18px]" />}>
            New rule
          </Button>
        }
      />

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size={28} />
        </div>
      ) : challenges.length === 0 ? (
        <EmptyState
          icon={<Zap className="w-6 h-6" />}
          title="No reward rules"
          description="Create your first rule to automatically evaluate and trigger employee rewards."
        />
      ) : (
        <div className="space-y-3">
          {challenges.map((r) => {
            const icon = getCategoryIcon(r.category);
            const tint = getCategoryTint(r.category);
            return (
              <Card key={r.id} className="p-4 flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-[var(--r)] grid place-items-center shrink-0 bg-[var(--surface-3)] text-[var(--brand-bright)]">
                  <Icon name={icon} size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <div className="t-small font-medium text-[var(--text)]">{r.name}</div>
                    <Badge tone={r.category === "PRODUCT_LAUNCH" ? "brand" : "neutral"}>
                      {r.category === "PRODUCT_LAUNCH" ? <Sparkles size={10} /> : <Zap size={10} />}
                      {r.category.replace(/_/g, " ")}
                    </Badge>
                  </div>
                  <div className="t-caption text-[var(--muted)] leading-relaxed">
                    {r.description || "Active performance tracking rule"} · Automatic Evaluator →{" "}
                    <span className="inline-block bg-[var(--brand-tint)] text-[var(--brand-bright)] font-medium t-caption px-2 py-0.5 rounded-[var(--r-pill)] align-middle">
                      +{Number(r.rewardPoints).toLocaleString()} pts
                    </span>
                    {` · budget limit ₦${Number(r.totalBudget || 0).toLocaleString()}`}
                  </div>
                </div>
                <Badge tone={r.isActive ? "success" : "neutral"}>
                  {r.isActive ? "Active" : "Inactive"}
                </Badge>
              </Card>
            );
          })}
        </div>
      )}

      <Modal
        open={showForm}
        onClose={closeForm}
        title="New reward rule"
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={closeForm}>Cancel</Button>
            <Button onClick={handleCreateRule} loading={formLoading}>Create rule</Button>
          </>
        }
      >
        <form onSubmit={handleCreateRule} className="space-y-4">
          <Field label="Rule name" required>
            {({ id }) => (
              <Input id={id} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Sprint Completion Bonus" required />
            )}
          </Field>
          <Field label="Description">
            {({ id }) => (
              <Input id={id} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g. Triggers when sprint tasks hit 100% completion" />
            )}
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Category" required>
              {({ id }) => (
                <Select id={id} value={category} onChange={(e) => setCategory(e.target.value)}>
                  <option value="SPRINT_COMPLETION">Sprint Completion</option>
                  <option value="PRODUCT_LAUNCH">Product Launch</option>
                  <option value="ATTENDANCE">Attendance</option>
                  <option value="INNOVATION">Innovation</option>
                </Select>
              )}
            </Field>
            <Field label="Assign to team (optional)">
              {({ id }) => (
                <Select id={id} value={teamId} onChange={(e) => setTeamId(e.target.value)}>
                  <option value="">All Teams (organization-wide)</option>
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </Select>
              )}
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Reward (Points)" required>
              {({ id }) => (
                <Input id={id} type="number" min="1" value={rewardPoints} onChange={(e) => setRewardPoints(e.target.value)} placeholder="e.g. 300" required />
              )}
            </Field>
            <Field label="Max budget allocation (₦)" required>
              {({ id }) => (
                <Input id={id} type="number" min="1" value={totalBudget} onChange={(e) => setTotalBudget(e.target.value)} placeholder="e.g. 50000" required />
              )}
            </Field>
          </div>
        </form>
      </Modal>
    </div>
  );
}
