"use client";

import { useEffect, useState, startTransition } from "react";
import { getMeAction } from "@/app/actions/auth";
import { getTeamDetailsAction } from "@/app/actions/onboarding";
import {
  getTeamWalletAction,
  fundTeamWalletExternalAction,
  disburseEmergencySupportAction,
  getRewardRequestsAction,
  approveRewardRequestAction,
  rejectRewardRequestAction,
} from "@/app/actions/wallet";
import { getTasksForReviewAction, approveTaskAction, rejectTaskAction } from "@/app/actions/tasks";
import { getTeamTimeEntriesAction } from "@/app/actions/challenges";
import { useToast } from "@/components/Toast";
import { Coins, CheckSquare, Users, Clock, ShieldAlert } from "lucide-react";
import {
  PageHeader,
  Card,
  StatCard,
  Button,
  Badge,
  Modal,
  Field,
  Input,
  Select,
  Textarea,
  Tabs,
  Table,
  Tr,
  Td,
  EmptyState,
  ErrorState,
  SkeletonCard,
  type TabItem,
} from "@/components/ui";

export default function TeamLeadDashboard() {
  const [user, setUser] = useState<any>(null);
  const [team, setTeam] = useState<any>(null);
  const [wallet, setWallet] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [tasksForReview, setTasksForReview] = useState<any[]>([]);
  const [approvedTasks, setApprovedTasks] = useState<any[]>([]);
  const [timeEntries, setTimeEntries] = useState<any[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [tab, setTab] = useState("reviews");

  const [modal, setModal] = useState<null | "fund" | "support" | "members">(null);
  const [fundAmount, setFundAmount] = useState("");
  const [fundLoading, setFundLoading] = useState(false);
  const [supportRecipientId, setSupportRecipientId] = useState("");
  const [supportCategory, setSupportCategory] = useState("MEDICAL");
  const [supportLoading, setSupportLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Unified reject modal for both task reviews and support requests.
  const [reject, setReject] = useState<{ type: "task" | "request"; id: string } | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectError, setRejectError] = useState("");
  const [rejectLoading, setRejectLoading] = useState(false);

  const { toast } = useToast();

  const loadData = async () => {
    setLoading(true);
    setError(false);
    try {
      const me = await getMeAction();
      if (!me) {
        setError(true);
        return;
      }
      setUser(me);
      const tId = me.teamId || me.team?.id;
      const [teamRes, walletRes, tasksRes, approvedTasksRes, timeRes, reqs] = await Promise.all([
        tId ? getTeamDetailsAction(tId) : Promise.resolve(null),
        tId ? getTeamWalletAction(tId) : Promise.resolve(null),
        getTasksForReviewAction("COMPLETED"),
        getTasksForReviewAction("APPROVED"),
        getTeamTimeEntriesAction(),
        getRewardRequestsAction("PENDING"),
      ]);
      if (teamRes?.success && teamRes.team) {
        setTeam(teamRes.team);
        setMembers(teamRes.team.users || []);
      }
      if (walletRes) setWallet(walletRes);
      setTasksForReview(tasksRes || []);
      setApprovedTasks(approvedTasksRes || []);
      if (timeRes?.success && timeRes.entries) setTimeEntries(timeRes.entries);
      const normalized = Array.isArray(reqs) ? reqs : reqs?.requests || reqs?.data || [];
      setPendingRequests(normalized);
    } catch (err) {
      console.error("Failed to load team lead dashboard data", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const closeModal = () => {
    setModal(null);
    setFormErrors({});
  };

  const handleFundExternal = (e: React.FormEvent) => {
    e.preventDefault();
    const tId = user?.teamId || user?.team?.id;
    const amount = parseFloat(fundAmount);
    if (!tId || !fundAmount || isNaN(amount) || amount <= 0) {
      setFormErrors({ fund: "Enter a valid amount." });
      return;
    }
    setFundLoading(true);
    startTransition(async () => {
      try {
        const res = await fundTeamWalletExternalAction(tId, amount);
        if (res.success) {
          toast(`Team wallet funded with ₦${amount.toLocaleString()}.`);
          setFundAmount("");
          closeModal();
          loadData();
        } else {
          toast(res.error || "Failed to fund team wallet.");
        }
      } catch {
        toast("Connection error.");
      } finally {
        setFundLoading(false);
      }
    });
  };

  const handleDisburseSupport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportRecipientId) {
      setFormErrors({ support: "Select a team member." });
      return;
    }
    setSupportLoading(true);
    const fd = new FormData();
    fd.append("recipientId", supportRecipientId);
    fd.append("category", supportCategory);
    startTransition(async () => {
      try {
        const res = await disburseEmergencySupportAction(null, fd);
        if (res.success) {
          toast("Support request routed for approval.");
          setSupportRecipientId("");
          closeModal();
          loadData();
        } else {
          toast(res.error || "Failed to disburse support.");
        }
      } catch {
        toast("Connection error.");
      } finally {
        setSupportLoading(false);
      }
    });
  };

  const handleApproveTask = (taskId: string) => {
    startTransition(async () => {
      try {
        const res = await approveTaskAction(taskId);
        if (res.success) {
          toast("Task approved.");
          loadData();
        } else {
          toast(res.error || "Failed to approve task.");
        }
      } catch {
        toast("Connection error.");
      }
    });
  };

  const handleApproveRequest = (requestId: string) => {
    startTransition(async () => {
      try {
        const res = await approveRewardRequestAction(requestId);
        if (res.success) {
          toast("Request approved.");
          loadData();
        } else {
          toast(res.error || "Failed to approve request.");
        }
      } catch {
        toast("Connection error.");
      }
    });
  };

  const submitReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reject) return;
    if (!rejectReason.trim()) {
      setRejectError("A reason is required.");
      return;
    }
    setRejectLoading(true);
    startTransition(async () => {
      try {
        const res =
          reject.type === "task"
            ? await rejectTaskAction(reject.id, rejectReason)
            : await rejectRewardRequestAction(reject.id, rejectReason);
        if (res.success) {
          toast(reject.type === "task" ? "Task sent back." : "Request rejected.");
          setReject(null);
          setRejectReason("");
          setRejectError("");
          loadData();
        } else {
          toast(res.error || "Failed to reject.");
        }
      } catch {
        toast("Connection error.");
      } finally {
        setRejectLoading(false);
      }
    });
  };

  const teamName = team ? team.name : "My Team";
  const teamBalance = wallet ? Number(wallet.balance ?? 0) : 0;

  const approvedThisWeek = approvedTasks.filter((task: any) => {
    if (!task.approvedAt) return false;
    const approvedDate = new Date(task.approvedAt);
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day;
    const startOfWeek = new Date(now.setDate(diff));
    startOfWeek.setHours(0, 0, 0, 0);
    return approvedDate >= startOfWeek;
  });

  const tabs: TabItem[] = [
    { key: "reviews", label: "Task Reviews", count: tasksForReview.length },
    { key: "approvals", label: "Approvals", count: pendingRequests.length },
    { key: "time", label: "Time Entries", count: timeEntries.length },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${teamName} Dashboard`}
        subtitle="Review completed tasks, monitor hours, and manage your team's sub-budget."
        action={
          <>
            <Button variant="secondary" onClick={() => setModal("support")} icon={<ShieldAlert className="w-[18px] h-[18px]" />}>
              Support
            </Button>
            <Button onClick={() => setModal("fund")} icon={<Coins className="w-[18px] h-[18px]" />}>
              Fund wallet
            </Button>
          </>
        }
      />

      {loading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <SkeletonCard className="h-24" />
            <SkeletonCard className="h-24" />
            <SkeletonCard className="h-24" />
            <SkeletonCard className="h-24" />
          </div>
          <SkeletonCard className="h-64" />
        </div>
      ) : error ? (
        <ErrorState onRetry={loadData} message="We couldn't load your workspace. Please try again." />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <StatCard tone="brand" icon={<Coins className="w-5 h-5" />} label="Team wallet balance" value={`₦${teamBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}`} />
            <div
              onClick={() => setModal("members")}
              className="cursor-pointer transition-all duration-200 hover:translate-y-[-2px] active:translate-y-0"
            >
              <StatCard
                icon={<Users className="w-5 h-5" />}
                label="Team members"
                value={members.length}
                hint="Click to view details"
              />
            </div>
            <StatCard icon={<CheckSquare className="w-5 h-5" />} label="Tasks for review" value={tasksForReview.length} />
            <StatCard icon={<CheckSquare className="w-5 h-5 text-[var(--brand-bright)]" />} label="Approved (This Week)" value={approvedThisWeek.length} hint="Verifications since Sunday" />
          </div>

          <Tabs tabs={tabs} active={tab} onChange={setTab} />

          {tab === "reviews" && (
            <div className="space-y-6">
              <Card className="p-6">
                <h3 className="t-h3 text-[var(--text)] mb-4 flex items-center gap-2">
                  <CheckSquare className="w-5 h-5 text-[var(--brand-bright)]" /> Tasks awaiting review
                </h3>
                {tasksForReview.length === 0 ? (
                  <EmptyState icon={<CheckSquare className="w-6 h-6" />} title="Nothing to review" description="No completed tasks await approval." />
                ) : (
                  <Table columns={["Employee", "Task", "Priority", ""]} caption="Tasks awaiting review">
                    {tasksForReview.map((t) => {
                      const empName = t.userTasks?.[0]?.user 
                        ? `${t.userTasks[0].user.firstName} ${t.userTasks[0].user.lastName}` 
                        : (t.creator ? `${t.creator.firstName} ${t.creator.lastName}` : "Employee");
                      return (
                        <Tr key={t.id}>
                          <Td className="font-medium">{empName}</Td>
                          <Td className="max-w-[220px] truncate">{t.title}</Td>
                          <Td>
                            <Badge tone={t.priority === "HIGH" ? "danger" : "neutral"}>{t.priority}</Badge>
                          </Td>
                          <Td>
                            <div className="flex items-center justify-end gap-2">
                              <Button size="sm" variant="subtle" onClick={() => handleApproveTask(t.id)}>Approve</Button>
                              <Button size="sm" variant="danger" onClick={() => setReject({ type: "task", id: t.id })}>Reject</Button>
                            </div>
                          </Td>
                        </Tr>
                      );
                    })}
                  </Table>
                )}
              </Card>

              {approvedTasks.length > 0 && (
                <Card className="p-6">
                  <h3 className="t-h3 text-[var(--text)] mb-4 flex items-center gap-2">
                    <CheckSquare className="w-5 h-5 text-[var(--brand-bright)]" /> Already approved tasks
                  </h3>
                  <Table columns={["Employee", "Task", "Priority", "Approved At"]} caption="Approved tasks list">
                    {approvedTasks.map((t) => {
                      const empName = t.userTasks?.[0]?.user 
                        ? `${t.userTasks[0].user.firstName} ${t.userTasks[0].user.lastName}` 
                        : (t.creator ? `${t.creator.firstName} ${t.creator.lastName}` : "Employee");
                      const approvedTime = t.approvedAt ? new Date(t.approvedAt).toLocaleDateString() : "Recently";
                      return (
                        <Tr key={t.id}>
                          <Td className="font-medium text-[var(--muted)]">{empName}</Td>
                          <Td className="max-w-[220px] truncate text-[var(--muted)]">{t.title}</Td>
                          <Td>
                            <Badge tone="neutral">{t.priority}</Badge>
                          </Td>
                          <Td className="text-xs text-[var(--muted)]">
                            {approvedTime}
                          </Td>
                        </Tr>
                      );
                    })}
                  </Table>
                </Card>
              )}
            </div>
          )}

          {tab === "approvals" && (
            <Card className="p-6">
              {pendingRequests.length === 0 ? (
                <EmptyState icon={<CheckSquare className="w-6 h-6" />} title="You're all caught up" description="No pending requests await your sign-off." />
              ) : (
                <Table columns={["Requester", "Recipient", "Category", "Amount", ""]} caption="Pending approval requests">
                  {pendingRequests.map((req) => (
                    <Tr key={req.id}>
                      <Td className="font-medium">{req.requestor ? `${req.requestor.firstName} ${req.requestor.lastName}` : "Admin"}</Td>
                      <Td className="font-medium">{req.recipient ? `${req.recipient.firstName} ${req.recipient.lastName}` : "User"}</Td>
                      <Td>
                        <Badge tone="brand">{req.category?.replace(/_/g, " ")}</Badge>
                      </Td>
                      <Td className="font-medium">₦{Number(req.amount).toLocaleString()}</Td>
                      <Td>
                        <div className="flex items-center justify-end gap-2">
                          <Button size="sm" variant="subtle" onClick={() => handleApproveRequest(req.id)}>Approve</Button>
                          <Button size="sm" variant="danger" onClick={() => setReject({ type: "request", id: req.id })}>Reject</Button>
                        </div>
                      </Td>
                    </Tr>
                  ))}
                </Table>
              )}
            </Card>
          )}

          {tab === "time" && (
            <Card className="p-6">
              {timeEntries.length === 0 ? (
                <EmptyState icon={<Clock className="w-6 h-6" />} title="No hours logged" description="Team members haven't logged any work hours yet." />
              ) : (
                <Table columns={["Date", "Employee", "Duration", "Description"]} caption="Team time entries">
                  {timeEntries.map((entry) => (
                    <Tr key={entry.id}>
                      <Td className="text-[var(--muted)]">{new Date(entry.date).toLocaleDateString()}</Td>
                      <Td className="font-medium">{entry.user ? `${entry.user.firstName} ${entry.user.lastName}` : "User"}</Td>
                      <Td className="font-medium">{entry.durationHours} hrs</Td>
                      <Td className="max-w-[220px] truncate">{entry.description || "—"}</Td>
                    </Tr>
                  ))}
                </Table>
              )}
            </Card>
          )}
        </>
      )}

      {/* Fund wallet modal */}
      <Modal
        open={modal === "fund"}
        onClose={closeModal}
        title="External wallet funding"
        description="Inject external capital into your department's sub-wallet."
        footer={
          <>
            <Button variant="ghost" onClick={closeModal}>Cancel</Button>
            <Button onClick={handleFundExternal} loading={fundLoading}>Inject funds</Button>
          </>
        }
      >
        <form onSubmit={handleFundExternal}>
          <Field label="Funding amount (NGN)" required error={formErrors.fund}>
            {({ id, invalid }) => (
              <Input id={id} invalid={invalid} type="number" min="10" placeholder="e.g. 25000" value={fundAmount} onChange={(e) => setFundAmount(e.target.value)} />
            )}
          </Field>
        </form>
      </Modal>

      {/* Emergency support modal */}
      <Modal
        open={modal === "support"}
        onClose={closeModal}
        title="Emergency support"
        description="Request a support payout for a team member. Category rules determine approval stages."
        footer={
          <>
            <Button variant="ghost" onClick={closeModal}>Cancel</Button>
            <Button onClick={handleDisburseSupport} loading={supportLoading} disabled={members.length === 0}>Submit request</Button>
          </>
        }
      >
        <form onSubmit={handleDisburseSupport} className="space-y-4">
          <Field label="Team member" required error={formErrors.support}>
            {({ id, invalid }) => (
              <Select id={id} invalid={invalid} value={supportRecipientId} onChange={(e) => setSupportRecipientId(e.target.value)}>
                <option value="" disabled>Select employee</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.firstName} {m.lastName} · {m.email}
                  </option>
                ))}
              </Select>
            )}
          </Field>
          <Field label="Category">
            {({ id }) => (
              <Select id={id} value={supportCategory} onChange={(e) => setSupportCategory(e.target.value)}>
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

      {/* Shared reject modal */}
      <Modal
        open={!!reject}
        onClose={() => {
          setReject(null);
          setRejectError("");
        }}
        title={reject?.type === "task" ? "Reject task completion" : "Reject support request"}
        description="Provide a clear reason. This is shared with the requester."
        footer={
          <>
            <Button variant="ghost" onClick={() => setReject(null)}>Cancel</Button>
            <Button variant="danger" onClick={submitReject} loading={rejectLoading}>Confirm rejection</Button>
          </>
        }
      >
        <form onSubmit={submitReject}>
          <Field label="Reason for rejection" required error={rejectError}>
            {({ id, invalid }) => (
              <Textarea
                id={id}
                invalid={invalid}
                rows={3}
                placeholder="Explain what needs to change…"
                value={rejectReason}
                onChange={(e) => {
                  setRejectReason(e.target.value);
                  if (rejectError) setRejectError("");
                }}
              />
            )}
          </Field>
        </form>
      </Modal>

      {/* Team Members List Modal */}
      <Modal
        open={modal === "members"}
        onClose={closeModal}
        title="Team Members"
        description={`${team?.name || "Department Details"} · ${members.length} active roles`}
        footer={<Button onClick={closeModal}>Close</Button>}
      >
        <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
          {members.length === 0 ? (
            <div className="text-center py-6 text-sm text-[var(--muted)]">No members in this department yet.</div>
          ) : (
            members.map((m) => (
              <div key={m.id} className="flex items-center justify-between p-3.5 bg-[var(--surface-2)] border border-[var(--line)] rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[var(--brand-tint)] text-[var(--brand-bright)] font-bold grid place-items-center uppercase text-sm">
                    {m.firstName?.[0] || ""}{m.lastName?.[0] || ""}
                  </div>
                  <div>
                    <div className="t-small font-bold text-[var(--text)]">{m.firstName} {m.lastName}</div>
                    <div className="t-caption text-[var(--muted)] mt-0.5">{m.email}</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <Badge tone="neutral">
                    {m.userRole ? m.userRole.replace(/_/g, " ").toLowerCase() : "employee"}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </div>
      </Modal>
    </div>
  );
}
