"use client";

import { useEffect, useState, startTransition } from "react";
import { getMeAction } from "@/app/actions/auth";
import { getTeamDetailsAction } from "@/app/actions/onboarding";
import { getTeamWalletAction, fundTeamWalletExternalAction, disburseEmergencySupportAction, getRewardRequestsAction, approveRewardRequestAction, rejectRewardRequestAction } from "@/app/actions/wallet";
import { getTasksForReviewAction, approveTaskAction, rejectTaskAction } from "@/app/actions/tasks";
import { getTeamTimeEntriesAction } from "@/app/actions/challenges";
import { useToast } from "@/components/Toast";
import {
  Building,
  Coins,
  CheckSquare,
  Users,
  Clock,
  PlusCircle,
  ShieldAlert,
  XCircle,
  TrendingUp,
  UserPlus
} from "lucide-react";

export default function TeamLeadDashboard() {
  const [user, setUser] = useState<any>(null);
  const [team, setTeam] = useState<any>(null);
  const [wallet, setWallet] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [tasksForReview, setTasksForReview] = useState<any[]>([]);
  const [timeEntries, setTimeEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Workflow queue
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);

  // Form states
  const [fundAmount, setFundAmount] = useState("");
  const [fundLoading, setFundLoading] = useState(false);

  const [supportRecipientId, setSupportRecipientId] = useState("");
  const [supportCategory, setSupportCategory] = useState("MEDICAL");
  const [supportLoading, setSupportLoading] = useState(false);

  // Rejection states
  const [rejectTaskId, setRejectTaskId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectLoading, setRejectLoading] = useState(false);

  const [rejectReqId, setRejectReqId] = useState<string | null>(null);
  const [rejectReqReason, setRejectReqReason] = useState("");
  const [rejectReqLoading, setRejectReqLoading] = useState(false);

  const { celebrate, toast } = useToast();

  const loadData = async () => {
    try {
      const me = await getMeAction();
      if (me) {
        setUser(me);
        if (me.teamId || (me.team && me.team.id)) {
          const tId = me.teamId || me.team.id;
          
          // Get team info & members
          const teamRes = await getTeamDetailsAction(tId);
          if (teamRes.success && teamRes.team) {
            setTeam(teamRes.team);
            setMembers(teamRes.team.users || []);
          }

          // Get team wallet
          const walletRes = await getTeamWalletAction(tId);
          if (walletRes) {
            setWallet(walletRes);
          }
        }

        // Get completed tasks for review
        const tasksRes = await getTasksForReviewAction("COMPLETED");
        setTasksForReview(tasksRes);

        // Get team time entries
        const timeRes = await getTeamTimeEntriesAction();
        if (timeRes.success && timeRes.entries) {
          setTimeEntries(timeRes.entries);
        }

        // Get pending approvals for organization/team lead
        const reqs = await getRewardRequestsAction("PENDING");
        const normalizedReqs = Array.isArray(reqs)
          ? reqs
          : (reqs?.requests || reqs?.data || []);
        setPendingRequests(normalizedReqs);
      }
    } catch (err) {
      console.error("Failed to load team lead dashboard data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleFundExternal = async (e: React.FormEvent) => {
    e.preventDefault();
    const tId = user?.teamId || user?.team?.id;
    if (!tId || !fundAmount) return;

    setFundLoading(true);
    const amount = parseFloat(fundAmount);
    if (isNaN(amount) || amount <= 0) {
      toast("Please enter a valid amount");
      setFundLoading(false);
      return;
    }

    startTransition(async () => {
      try {
        const res = await fundTeamWalletExternalAction(tId, amount);
        if (res.success) {
          celebrate(`Team wallet funded with ₦${amount.toLocaleString()} externally!`);
          setFundAmount("");
          loadData();
        } else {
          toast(res.error || "Failed to fund team wallet.");
        }
      } catch (err) {
        toast("Connection error.");
      } finally {
        setFundLoading(false);
      }
    });
  };

  const handleDisburseEmergencySupport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportRecipientId || !supportCategory) return;

    setSupportLoading(true);
    const formData = new FormData();
    formData.append("recipientId", supportRecipientId);
    formData.append("category", supportCategory);

    startTransition(async () => {
      try {
        const res = await disburseEmergencySupportAction(null, formData);
        if (res.success) {
          celebrate("Support request created and routed for approval.");
          setSupportRecipientId("");
          loadData();
        } else {
          toast(res.error || "Failed to disburse support.");
        }
      } catch (err) {
        toast("Connection error.");
      } finally {
        setSupportLoading(false);
      }
    });
  };

  const handleApproveTask = async (taskId: string) => {
    startTransition(async () => {
      try {
        const res = await approveTaskAction(taskId);
        if (res.success) {
          celebrate("Task approved successfully!");
          loadData();
        } else {
          toast(res.error || "Failed to approve task.");
        }
      } catch (err) {
        toast("Connection error.");
      }
    });
  };

  const handleRejectTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectTaskId || !rejectReason) return;

    setRejectLoading(true);
    startTransition(async () => {
      try {
        const res = await rejectTaskAction(rejectTaskId, rejectReason);
        if (res.success) {
          celebrate("Task rejected successfully.");
          setRejectTaskId(null);
          setRejectReason("");
          loadData();
        } else {
          toast(res.error || "Failed to reject task.");
        }
      } catch (err) {
        toast("Connection error.");
      } finally {
        setRejectLoading(false);
      }
    });
  };

  const handleApproveRequest = async (requestId: string) => {
    startTransition(async () => {
      try {
        const res = await approveRewardRequestAction(requestId);
        if (res.success) {
          celebrate("Request approved!");
          loadData();
        } else {
          toast(res.error || "Failed to approve request.");
        }
      } catch (err) {
        toast("Connection error.");
      }
    });
  };

  const handleRejectRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectReqId || !rejectReqReason) return;

    setRejectReqLoading(true);
    startTransition(async () => {
      try {
        const res = await rejectRewardRequestAction(rejectReqId, rejectReqReason);
        if (res.success) {
          celebrate("Request rejected successfully.");
          setRejectReqId(null);
          setRejectReqReason("");
          loadData();
        } else {
          toast(res.error || "Failed to reject request.");
        }
      } catch (err) {
        toast("Connection error.");
      } finally {
        setRejectReqLoading(false);
      }
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex items-center gap-3 bg-white/80 p-8 rounded-[32px] border border-[var(--line)] shadow-[var(--sh)]">
          <span className="w-6 h-6 border-2 border-[var(--indigo)]/30 border-t-[var(--indigo)] rounded-full animate-spin" />
          <span className="font-semibold text-sm">Loading Team Lead workspace...</span>
        </div>
      </div>
    );
  }

  const teamName = team ? team.name : "My Team";
  const teamBalance = wallet ? wallet.balance : 0;

  return (
    <div className="space-y-6 text-left">
      {/* Title */}
      <div>
        <h1 className="font-display font-extrabold text-3xl text-[var(--ink)] tracking-tight">
          {teamName} Dashboard
        </h1>
        <p className="text-[14px] text-[var(--muted)] font-medium mt-1">
          Review completed tasks, monitor logged work hours, disburse support, and fund the sub-budget wallet.
        </p>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white border border-[var(--line)] rounded-[22px] p-5 shadow-[var(--sh-sm)] flex items-center gap-4">
          <div className="w-12 h-12 rounded-[16px] bg-[var(--indigo-tint)] grid place-items-center text-[var(--indigo)]">
            <Coins className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[12.5px] text-[var(--muted)] font-medium">Team Wallet Balance</div>
            <div className="font-display font-bold text-2xl text-[var(--ink)]">
              ₦{teamBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        <div className="bg-white border border-[var(--line)] rounded-[22px] p-5 shadow-[var(--sh-sm)] flex items-center gap-4">
          <div className="w-12 h-12 rounded-[16px] bg-[var(--violet-tint)] grid place-items-center text-[var(--violet)]">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[12.5px] text(--muted) font-medium">Team Members</div>
            <div className="font-display font-bold text-2xl text-[var(--ink)]">{members.length}</div>
          </div>
        </div>

        <div className="bg-white border border-[var(--line)] rounded-[22px] p-5 shadow-[var(--sh-sm)] flex items-center gap-4">
          <div className="w-12 h-12 rounded-[16px] bg-[var(--mint-tint)] grid place-items-center text-[var(--mint)]">
            <CheckSquare className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[12.5px] text-[var(--muted)] font-medium">Tasks for Review</div>
            <div className="font-display font-bold text-2xl text-[var(--ink)]">{tasksForReview.length}</div>
          </div>
        </div>
      </div>

      {/* Sub-grid: Wallet funding & emergency support */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* External wallet funding */}
        <div className="bg-white border border-[var(--line)] rounded-[26px] p-6 shadow-[var(--sh-sm)]">
          <h3 className="font-display font-extrabold text-[20px] text-[var(--ink)] mb-1 flex items-center gap-2">
            <Coins className="w-5 h-5 text-[var(--indigo)]" /> External Wallet Funding
          </h3>
          <p className="text-[13px] text-[var(--muted)] font-medium mb-5">
            Simulate injecting external capital directly into your department's sub-wallet pool.
          </p>
          <form onSubmit={handleFundExternal} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[var(--ink)] uppercase tracking-wider pl-1" htmlFor="externalAmount">
                Funding Amount (NGN)
              </label>
              <input
                id="externalAmount"
                type="number"
                required
                min="10"
                placeholder="e.g. 25000"
                className="w-full bg-white border border-[var(--line)] rounded-xl px-4 py-2.5 outline-none focus:border-[var(--indigo)] transition-all font-body text-sm text-[var(--ink)] font-medium shadow-[var(--sh-sm)]"
                value={fundAmount}
                onChange={(e) => setFundAmount(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={fundLoading}
              className="w-full bg-[var(--indigo)] hover:bg-[var(--indigo-600)] disabled:opacity-50 text-white font-bold py-3 px-4 rounded-xl shadow-sm hover:translate-y-[-1px] transition-all cursor-pointer font-body text-xs uppercase tracking-wider"
            >
              {fundLoading ? "Processing..." : "Inject Budget Funds"}
            </button>
          </form>
        </div>

        {/* Emergency support panel */}
        <div className="bg-white border border-[var(--line)] rounded-[26px] p-6 shadow-[var(--sh-sm)]">
          <h3 className="font-display font-extrabold text-[20px] text-[var(--ink)] mb-1 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-[var(--indigo)]" /> Emergency Support Pool
          </h3>
          <p className="text-[13px] text-[var(--muted)] font-medium mb-5">
            Request support payout for a team member. Category rules determine approval stages.
          </p>
          <form onSubmit={handleDisburseEmergencySupport} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[var(--ink)] uppercase tracking-wider pl-1" htmlFor="supportRecipient">
                Select Team Member
              </label>
              <select
                id="supportRecipient"
                className="w-full bg-white border border-[var(--line)] rounded-xl px-3 py-2.5 outline-none focus:border-[var(--indigo)] transition-all font-body text-sm text-[var(--ink)] font-medium shadow-[var(--sh-sm)]"
                value={supportRecipientId}
                onChange={(e) => setSupportRecipientId(e.target.value)}
                required
              >
                <option value="" disabled>Select Employee</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.firstName} {m.lastName} ({m.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[var(--ink)] uppercase tracking-wider pl-1" htmlFor="supportCategory">
                Category
              </label>
              <select
                id="supportCategory"
                className="w-full bg-white border border-[var(--line)] rounded-xl px-3 py-2.5 outline-none focus:border-[var(--indigo)] transition-all font-body text-sm text-[var(--ink)] font-medium shadow-[var(--sh-sm)]"
                value={supportCategory}
                onChange={(e) => setSupportCategory(e.target.value)}
                required
              >
                <option value="MEDICAL">Medical</option>
                <option value="FINANCIAL">Financial</option>
                <option value="EQUIPMENT">Equipment</option>
                <option value="TRANSPORT">Transport</option>
                <option value="LUNCH">Lunch</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={supportLoading || members.length === 0}
              className="w-full bg-[var(--indigo)] hover:bg-[var(--indigo-600)] disabled:opacity-50 text-white font-bold py-3 px-4 rounded-xl shadow-sm hover:translate-y-[-1px] transition-all cursor-pointer font-body text-xs uppercase tracking-wider"
            >
              {supportLoading ? "Submitting..." : "Disburse Support Request"}
            </button>
          </form>
        </div>
      </div>

      {/* Completed tasks reviews */}
      <div id="task-reviews" className="bg-white border border-[var(--line)] rounded-[26px] p-6 shadow-[var(--sh-sm)] scroll-mt-8">
        <h3 className="font-display font-extrabold text-[18px] text-[var(--ink)] mb-4 flex items-center gap-2">
          <CheckSquare className="w-5 h-5 text-[var(--indigo)]" /> Tasks Completed Awaiting Review
        </h3>
        {tasksForReview.length === 0 ? (
          <div className="text-center py-8 bg-[var(--surface-2)] rounded-[20px] border border-dashed border-[var(--line)]">
            <CheckSquare className="w-8 h-8 text-[var(--faint)] mx-auto mb-2" />
            <p className="text-xs text-[var(--muted)] font-semibold">No completed tasks await approval.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--line)]">
                  <th className="pb-3 text-xs font-bold text-[var(--muted)] uppercase tracking-wider">Employee</th>
                  <th className="pb-3 text-xs font-bold text-[var(--muted)] uppercase tracking-wider">Task Title</th>
                  <th className="pb-3 text-xs font-bold text-[var(--muted)] uppercase tracking-wider">Priority</th>
                  <th className="pb-3 text-xs font-bold text-[var(--muted)] uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tasksForReview.map((t) => (
                  <tr key={t.id} className="border-b border-[var(--line)] last:border-b-0 hover:bg-[var(--surface-2)] transition-colors">
                    <td className="py-4 text-xs font-bold text-[var(--ink)]">
                      {t.creator ? `${t.creator.firstName} ${t.creator.lastName}` : "Employee"}
                    </td>
                    <td className="py-4 text-xs font-semibold text-[var(--ink)] max-w-[200px] truncate" title={t.description}>
                      {t.title}
                    </td>
                    <td className="py-4 text-xs font-bold">
                      <span className={`px-2 py-0.5 rounded text-[10px] ${t.priority === "HIGH" ? "bg-red-50 text-[var(--rose)] border border-red-100" : "bg-gray-100 text-gray-600 border"}`}>
                        {t.priority}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleApproveTask(t.id)}
                          className="px-3 py-1.5 bg-[var(--mint-tint)] hover:bg-mint text-[var(--mint)] hover:text-white rounded-lg text-xs font-bold border border-green-200 hover:translate-y-[-1px] transition-all cursor-pointer"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => setRejectTaskId(t.id)}
                          className="px-3 py-1.5 bg-[var(--rose-tint)] hover:bg-rose-600 text-[var(--rose)] hover:text-white rounded-lg text-xs font-bold border border-red-200 hover:translate-y-[-1px] transition-all cursor-pointer"
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pending Approvals Workflow Queue */}
      <div className="bg-white border border-[var(--line)] rounded-[26px] p-6 shadow-[var(--sh-sm)]">
        <h3 className="font-display font-extrabold text-[18px] text-[var(--ink)] mb-4 flex items-center gap-2">
          <CheckSquare className="w-5 h-5 text-[var(--indigo)]" /> Workflow Approvals Queue
        </h3>
        {pendingRequests.length === 0 ? (
          <div className="text-center py-8 bg-[var(--surface-2)] rounded-[20px] border border-dashed border-[var(--line)]">
            <CheckSquare className="w-8 h-8 text-[var(--faint)] mx-auto mb-2" />
            <p className="text-xs text-[var(--muted)] font-semibold">No pending requests await your sign-off.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--line)]">
                  <th className="pb-3 text-xs font-bold text-[var(--muted)] uppercase tracking-wider">Requester</th>
                  <th className="pb-3 text-xs font-bold text-[var(--muted)] uppercase tracking-wider">Recipient</th>
                  <th className="pb-3 text-xs font-bold text-[var(--muted)] uppercase tracking-wider">Category</th>
                  <th className="pb-3 text-xs font-bold text-[var(--muted)] uppercase tracking-wider">Amount</th>
                  <th className="pb-3 text-xs font-bold text-[var(--muted)] uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingRequests.map((req) => (
                  <tr key={req.id} className="border-b border-[var(--line)] last:border-b-0 hover:bg-[var(--surface-2)] transition-colors">
                    <td className="py-4 text-xs font-bold text-[var(--ink)]">
                      {req.requestor ? `${req.requestor.firstName} ${req.requestor.lastName}` : "Admin"}
                    </td>
                    <td className="py-4 text-xs font-bold text-[var(--ink)]">
                      {req.recipient ? `${req.recipient.firstName} ${req.recipient.lastName}` : "User"}
                    </td>
                    <td className="py-4 text-xs font-semibold">
                      <span className="px-2 py-0.5 bg-[var(--violet-tint)] text-[var(--violet)] border border-purple-100 rounded-md uppercase font-bold text-[9.5px]">
                        {req.category.replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-4 text-sm font-bold text-[var(--ink)]">
                      ₦{Number(req.amount).toLocaleString()}
                    </td>
                    <td className="py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleApproveRequest(req.id)}
                          className="px-3 py-1.5 bg-[var(--mint-tint)] hover:bg-mint text-[var(--mint)] hover:text-white rounded-lg text-xs font-bold border border-green-200 hover:translate-y-[-1px] transition-all cursor-pointer"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => setRejectReqId(req.id)}
                          className="px-3 py-1.5 bg-[var(--rose-tint)] hover:bg-rose-600 text-[var(--rose)] hover:text-white rounded-lg text-xs font-bold border border-red-200 hover:translate-y-[-1px] transition-all cursor-pointer"
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Logged Work Hours Overview */}
      <div id="time-entries" className="bg-white border border-[var(--line)] rounded-[26px] p-6 shadow-[var(--sh-sm)] scroll-mt-8">
        <h3 className="font-display font-extrabold text-[18px] text-[var(--ink)] mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-[var(--indigo)]" /> Team Hours Tracked
        </h3>
        {timeEntries.length === 0 ? (
          <p className="text-xs text-[var(--muted)] italic">No work hours logged by team members yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--line)]">
                  <th className="pb-3 text-xs font-bold text-[var(--muted)] uppercase tracking-wider">Date</th>
                  <th className="pb-3 text-xs font-bold text-[var(--muted)] uppercase tracking-wider">Employee</th>
                  <th className="pb-3 text-xs font-bold text-[var(--muted)] uppercase tracking-wider">Duration</th>
                  <th className="pb-3 text-xs font-bold text-[var(--muted)] uppercase tracking-wider">Description</th>
                </tr>
              </thead>
              <tbody>
                {timeEntries.map((entry) => (
                  <tr key={entry.id} className="border-b border-[var(--line)] last:border-b-0 hover:bg-[var(--surface-2)] transition-colors">
                    <td className="py-4 text-xs font-semibold text-[var(--muted)]">{new Date(entry.date).toLocaleDateString()}</td>
                    <td className="py-4 text-xs font-bold text-[var(--ink)]">
                      {entry.user ? `${entry.user.firstName} ${entry.user.lastName}` : "User"}
                    </td>
                    <td className="py-4 text-xs font-bold text-[var(--ink)]">{entry.durationHours} Hours</td>
                    <td className="py-4 text-xs text-[var(--text)] font-semibold max-w-[200px] truncate" title={entry.description}>
                      {entry.description || "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Task Rejection Modal */}
      {rejectTaskId && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] border border-[var(--line)] p-6 w-full max-w-md shadow-[var(--sh)] relative overflow-hidden animate-fade-in text-left">
            <h3 className="font-display font-extrabold text-xl text-[var(--ink)] mb-2 flex items-center gap-2">
              <XCircle className="w-6 h-6 text-[var(--rose)]" /> Reject Task Completion
            </h3>
            <p className="text-xs text-[var(--muted)] mb-4">
              Provide a reason to the employee explaining why this task is being sent back.
            </p>
            <form onSubmit={handleRejectTask} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[var(--ink)] uppercase tracking-wider pl-1" htmlFor="rejectReason">
                  Reason for Rejection
                </label>
                <textarea
                  id="rejectReason"
                  required
                  rows={3}
                  placeholder="e.g. Please add link to documentation, incomplete features..."
                  className="w-full bg-white border border-[var(--line)] rounded-xl px-4 py-2.5 outline-none focus:border-[var(--indigo)] transition-all font-body text-sm text-[var(--ink)] font-medium shadow-[var(--sh-sm)] resize-none"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectTaskId(null)}
                  className="flex-1 bg-[var(--surface-2)] border border-[var(--line)] text-[var(--text)] font-bold py-2.5 px-4 rounded-xl hover:bg-gray-100 transition-all cursor-pointer font-body text-xs uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={rejectLoading}
                  className="flex-1 bg-[var(--rose)] hover:bg-rose-600 disabled:opacity-50 text-white font-bold py-2.5 px-4 rounded-xl shadow-sm hover:translate-y-[-1px] transition-all cursor-pointer font-body text-xs uppercase tracking-wider"
                >
                  {rejectLoading ? "Rejecting..." : "Confirm Rejection"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Workflow Request Rejection Modal */}
      {rejectReqId && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] border border-[var(--line)] p-6 w-full max-w-md shadow-[var(--sh)] relative overflow-hidden animate-fade-in text-left">
            <h3 className="font-display font-extrabold text-xl text-[var(--ink)] mb-2 flex items-center gap-2">
              <XCircle className="w-6 h-6 text-[var(--rose)]" /> Reject Support Request
            </h3>
            <p className="text-xs text-[var(--muted)] mb-4">
              Explain why this support request is being rejected.
            </p>
            <form onSubmit={handleRejectRequest} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[var(--ink)] uppercase tracking-wider pl-1" htmlFor="rejectReqReason">
                  Reason for Rejection
                </label>
                <textarea
                  id="rejectReqReason"
                  required
                  rows={3}
                  placeholder="Provide reason..."
                  className="w-full bg-white border border-[var(--line)] rounded-xl px-4 py-2.5 outline-none focus:border-[var(--indigo)] transition-all font-body text-sm text-[var(--ink)] font-medium shadow-[var(--sh-sm)] resize-none"
                  value={rejectReqReason}
                  onChange={(e) => setRejectReqReason(e.target.value)}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectReqId(null)}
                  className="flex-1 bg-[var(--surface-2)] border border-[var(--line)] text-[var(--text)] font-bold py-2.5 px-4 rounded-xl hover:bg-gray-100 transition-all cursor-pointer font-body text-xs uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={rejectReqLoading}
                  className="flex-1 bg-[var(--rose)] hover:bg-rose-600 disabled:opacity-50 text-white font-bold py-2.5 px-4 rounded-xl shadow-sm hover:translate-y-[-1px] transition-all cursor-pointer font-body text-xs uppercase tracking-wider"
                >
                  {rejectReqLoading ? "Rejecting..." : "Confirm Rejection"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
