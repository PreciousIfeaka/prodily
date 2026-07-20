"use client";

import { useEffect, useState, startTransition } from "react";
import { getMeAction } from "@/app/actions/auth";
import { getActiveChallengesAction, createChallengeAction, claimAttendanceRewardAction } from "@/app/actions/challenges";
import { getTeamsAction } from "@/app/actions/onboarding";
import { Trophy, Plus, Clock, Target, Users, Calendar, Sparkles } from "lucide-react";
import { useToast } from "@/components/Toast";

export default function ChallengesPage() {
  const [user, setUser] = useState<any>(null);
  const [challenges, setChallenges] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states (Lead/Admin only)
  const [name, setName] = useState("");
  const [category, setCategory] = useState("SPRINT_COMPLETION");
  const [rewardPoints, setRewardPoints] = useState("");
  const [totalBudget, setTotalBudget] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [createLoading, setCreateLoading] = useState(false);

  const { celebrate, toast } = useToast();

  const loadData = async () => {
    try {
      const me = await getMeAction();
      if (me) {
        setUser(me);
        if (me.userRole === "ADMIN" || me.userRole === "TEAM_LEAD") {
          const teamsRes = await getTeamsAction();
          if (teamsRes.success && teamsRes.teams) {
            setTeams(teamsRes.teams);
          }
        }
      }

      const chRes = await getActiveChallengesAction();
      if (chRes.success && chRes.challenges) {
        setChallenges(chRes.challenges);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateChallenge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !rewardPoints || !totalBudget || !startDate || !endDate) return;

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
          celebrate("Challenge launched successfully!");
          setName("");
          setRewardPoints("");
          setTotalBudget("");
          setStartDate("");
          setEndDate("");
          setSelectedTeams([]);
          loadData();
        } else {
          toast(res.error || "Failed to create challenge.");
        }
      } catch (err) {
        toast("Connection error.");
      } finally {
        setCreateLoading(false);
      }
    });
  };

  const handleClaimReward = async (id: string) => {
    startTransition(async () => {
      try {
        const res = await claimAttendanceRewardAction(id);
        if (res.success) {
          celebrate("Reward points claimed and added to your wallet!");
          loadData();
        } else {
          toast(res.error || "Failed to claim reward. Keep logging hours!");
        }
      } catch (err) {
        toast("Connection error.");
      }
    });
  };

  const handleTeamCheckbox = (teamId: string) => {
    setSelectedTeams((prev) =>
      prev.includes(teamId) ? prev.filter((id) => id !== teamId) : [...prev, teamId]
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex items-center gap-3 bg-white p-8 rounded-[32px] border border-[var(--line)] shadow-[var(--sh)]">
          <span className="w-6 h-6 border-2 border-[var(--indigo)]/30 border-t-[var(--indigo)] rounded-full animate-spin" />
          <span className="font-semibold text-sm">Loading challenges board...</span>
        </div>
      </div>
    );
  }

  const isManagement = user?.userRole === "ADMIN" || user?.userRole === "TEAM_LEAD";

  return (
    <div className="space-y-6 text-left">
      {/* Title */}
      <div>
        <h1 className="font-display font-extrabold text-3xl text-[var(--ink)] tracking-tight">
          Challenges Engine
        </h1>
        <p className="text-[14px] text-[var(--muted)] font-medium mt-1">
          Participate in performance and attendance milestones to earn rewards.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Management Creation panel */}
        {isManagement && (
          <div className="lg:col-span-1">
            <div className="bg-white border border-[var(--line)] rounded-[26px] p-6 shadow-[var(--sh-sm)] sticky top-24">
              <h3 className="font-display font-extrabold text-[18px] text-[var(--ink)] mb-1 flex items-center gap-2">
                <Plus className="w-5 h-5 text-[var(--indigo)]" /> Launch Challenge
              </h3>
              <p className="text-[12px] text-[var(--muted)] font-medium mb-4">
                Launch a sprint or attendance completion milestone.
              </p>

              <form onSubmit={handleCreateChallenge} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[var(--ink)] uppercase tracking-wider pl-1" htmlFor="chalName">
                    Challenge Title
                  </label>
                  <input
                    id="chalName"
                    type="text"
                    required
                    placeholder="e.g. Q3 Sprint Completion"
                    className="w-full bg-white border border-[var(--line)] rounded-xl px-4 py-2 outline-none focus:border-[var(--indigo)] transition-all font-body text-xs text-[var(--ink)] font-medium shadow-[var(--sh-sm)]"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[var(--ink)] uppercase tracking-wider pl-1" htmlFor="chalCat">
                      Category
                    </label>
                    <select
                      id="chalCat"
                      className="w-full bg-white border border-[var(--line)] rounded-xl px-2 py-2 outline-none focus:border-[var(--indigo)] transition-all font-body text-xs text-[var(--ink)] font-medium shadow-[var(--sh-sm)]"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      required
                    >
                      <option value="SPRINT_COMPLETION">Sprint Completion</option>
                      <option value="PRODUCT_LAUNCH">Product Launch</option>
                      <option value="ATTENDANCE">Attendance Milestone</option>
                      <option value="INNOVATION">Innovation Grants</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[var(--ink)] uppercase tracking-wider pl-1" htmlFor="ptsReward">
                      Payout Points
                    </label>
                    <input
                      id="ptsReward"
                      type="number"
                      required
                      placeholder="500"
                      className="w-full bg-white border border-[var(--line)] rounded-xl px-3 py-2 outline-none focus:border-[var(--indigo)] transition-all font-body text-xs text-[var(--ink)] font-medium shadow-[var(--sh-sm)]"
                      value={rewardPoints}
                      onChange={(e) => setRewardPoints(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[var(--ink)] uppercase tracking-wider pl-1" htmlFor="totalBudget">
                    Escrow Budget (₦)
                  </label>
                  <input
                    id="totalBudget"
                    type="number"
                    required
                    placeholder="e.g. 50000"
                    className="w-full bg-white border border-[var(--line)] rounded-xl px-4 py-2 outline-none focus:border-[var(--indigo)] transition-all font-body text-xs text-[var(--ink)] font-medium shadow-[var(--sh-sm)]"
                    value={totalBudget}
                    onChange={(e) => setTotalBudget(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[var(--ink)] uppercase tracking-wider pl-1" htmlFor="startDt">
                      Start Date
                    </label>
                    <input
                      id="startDt"
                      type="date"
                      required
                      className="w-full bg-white border border-[var(--line)] rounded-xl px-2 py-2 outline-none focus:border-[var(--indigo)] transition-all font-body text-xs text-[var(--ink)] font-medium shadow-[var(--sh-sm)]"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[var(--ink)] uppercase tracking-wider pl-1" htmlFor="endDt">
                      End Date
                    </label>
                    <input
                      id="endDt"
                      type="date"
                      required
                      className="w-full bg-white border border-[var(--line)] rounded-xl px-2 py-2 outline-none focus:border-[var(--indigo)] transition-all font-body text-xs text-[var(--ink)] font-medium shadow-[var(--sh-sm)]"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                </div>

                {/* Team selection checkboxes */}
                {user.userRole === "ADMIN" && (
                  <div className="space-y-2 border-t pt-3">
                    <label className="text-xs font-bold text-[var(--ink)] uppercase tracking-wider pl-1 block text-left">
                      Eligible Teams
                    </label>
                    <div className="space-y-1.5 max-h-[100px] overflow-y-auto pr-1">
                      {teams.map((t) => (
                        <label key={t.id} className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedTeams.includes(t.id)}
                            onChange={() => handleTeamCheckbox(t.id)}
                            className="rounded text-[var(--indigo)]"
                          />
                          {t.name}
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={createLoading}
                  className="w-full bg-[var(--indigo)] hover:bg-[var(--indigo-600)] disabled:opacity-50 text-white font-bold py-2.5 px-4 rounded-xl shadow-sm hover:translate-y-[-1px] transition-all cursor-pointer font-body text-xs uppercase tracking-wider"
                >
                  {createLoading ? "Launching..." : "Launch Challenge"}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Right column: Challenges Grid */}
        <div className={isManagement ? "lg:col-span-2 space-y-4" : "lg:col-span-3 space-y-4"}>
          <div className="bg-white border border-[var(--line)] rounded-[26px] p-6 shadow-[var(--sh-sm)] min-h-[400px]">
            <h3 className="font-display font-extrabold text-[18px] text-[var(--ink)] mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-[var(--indigo)]" /> Running Challenges
            </h3>

            {challenges.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-[var(--line)] rounded-[20px]">
                <Trophy className="w-10 h-10 text-[var(--faint)] mx-auto mb-2" />
                <p className="text-xs text-[var(--muted)] font-semibold">No active challenges found.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {challenges.map((ch) => {
                  const isAttendance = ch.category === "ATTENDANCE";
                  const startDateStr = new Date(ch.startDate).toLocaleDateString();
                  const endDateStr = new Date(ch.endDate).toLocaleDateString();

                  return (
                    <div
                      key={ch.id}
                      className="bg-[var(--surface-2)] border border-[var(--line)] rounded-[22px] p-5 flex flex-col justify-between hover:shadow-md transition-all text-left group"
                    >
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <span className="px-2.5 py-0.5 bg-[var(--violet-tint)] text-[var(--violet)] border border-purple-100 rounded-md text-[9px] font-extrabold uppercase tracking-wide">
                            {ch.category.replace("_", " ")}
                          </span>
                          <span className="text-[12.5px] font-bold text-[var(--indigo)] group-hover:scale-105 transition-transform">
                            🏅 {ch.rewardPoints} Pts
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-[var(--ink)] leading-snug">{ch.name}</h4>
                        <p className="text-[11px] text-[var(--muted)] font-medium mt-1 leading-relaxed">{ch.description}</p>

                        {/* Extra stats */}
                        <div className="mt-4 space-y-2 border-t border-[var(--line)] pt-3 text-[10.5px] font-medium text-[var(--muted)]">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" />
                            Active: {startDateStr} – {endDateStr}
                          </div>
                          {isAttendance && ch.metadata?.attendanceTargetHours && (
                            <div className="flex items-center gap-1.5 text-[var(--indigo)] font-semibold">
                              <Target className="w-3.5 h-3.5" />
                              Target Hours: {ch.metadata.attendanceTargetHours} Hours
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Claim reward button */}
                      {isAttendance && (
                        <div className="mt-4 pt-3 border-t border-[var(--line)]">
                          <button
                            onClick={() => handleClaimReward(ch.id)}
                            className="w-full bg-[var(--mint-tint)] hover:bg-mint text-[var(--mint)] hover:text-white rounded-xl text-xs font-bold py-2 border border-green-200 hover:translate-y-[-1px] transition-all cursor-pointer flex items-center justify-center gap-1"
                          >
                            <Sparkles className="w-3.5 h-3.5" /> Claim Attendance Payout
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
