"use client";

import { useEffect, useState, startTransition } from "react";
import {
  getMyTasksAction,
  createTaskAction,
  completeTaskAction,
  deleteTaskAction,
} from "@/app/actions/tasks";
import { getActiveChallengesAction } from "@/app/actions/challenges";
import { CheckSquare, Plus, Clock, Trash2, CheckCircle2, Trophy, AlertCircle } from "lucide-react";
import { useToast } from "@/components/Toast";
import {
  PageHeader,
  Card,
  Button,
  Badge,
  Drawer,
  Field,
  Input,
  Textarea,
  Select,
  Tabs,
  EmptyState,
  ErrorState,
  ConfirmDialog,
  SkeletonCard,
  type TabItem,
} from "@/components/ui";

const STATUS_TABS: TabItem[] = [
  { key: "ALL", label: "All" },
  { key: "PENDING", label: "Active" },
  { key: "COMPLETED", label: "Under Review" },
  { key: "APPROVED", label: "Approved" },
];

export default function EmployeeTasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [challenges, setChallenges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [tab, setTab] = useState("ALL");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [dueDate, setDueDate] = useState("");
  const [challengeId, setChallengeId] = useState("");
  const [titleError, setTitleError] = useState("");
  const [createLoading, setCreateLoading] = useState(false);

  const { toast } = useToast();

  const loadData = async () => {
    setLoading(true);
    setError(false);
    try {
      const [taskList, chalList] = await Promise.all([
        getMyTasksAction(),
        getActiveChallengesAction(),
      ]);
      setTasks(taskList || []);
      if (chalList?.success && chalList.challenges) setChallenges(chalList.challenges);
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

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setPriority("MEDIUM");
    setDueDate("");
    setChallengeId("");
    setTitleError("");
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setTitleError("Task title is required.");
      return;
    }
    setCreateLoading(true);
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("priority", priority);
    formData.append("dueDate", dueDate);
    formData.append("challengeId", challengeId);

    startTransition(async () => {
      try {
        const res = await createTaskAction(null, formData);
        if (res.success) {
          toast("Task created.");
          resetForm();
          setDrawerOpen(false);
          loadData();
        } else {
          toast(res.error || "Failed to create task.");
        }
      } catch {
        toast("Connection error.");
      } finally {
        setCreateLoading(false);
      }
    });
  };

  const handleCompleteTask = (id: string) => {
    startTransition(async () => {
      try {
        const res = await completeTaskAction(id);
        if (res.success) {
          toast("Task submitted for team-lead review.");
          loadData();
        } else {
          toast(res.error || "Failed to complete task.");
        }
      } catch {
        toast("Connection error.");
      }
    });
  };

  const handleDeleteTask = () => {
    const id = confirmId;
    if (!id) return;
    startTransition(async () => {
      try {
        const res = await deleteTaskAction(id);
        if (res.success) {
          toast("Task deleted.");
          loadData();
        } else {
          toast(res.error || "Failed to delete task.");
        }
      } catch {
        toast("Connection error.");
      } finally {
        setConfirmId(null);
      }
    });
  };

  const counts = {
    ALL: tasks.length,
    PENDING: tasks.filter((t) => t.status === "PENDING" || t.status === "REJECTED").length,
    COMPLETED: tasks.filter((t) => t.status === "COMPLETED").length,
    APPROVED: tasks.filter((t) => t.status === "APPROVED").length,
  };
  const visible = tab === "ALL" 
    ? tasks 
    : (tab === "PENDING" 
        ? tasks.filter((t) => t.status === "PENDING" || t.status === "REJECTED") 
        : tasks.filter((t) => t.status === tab));

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Tasks"
        subtitle="Create tasks, submit them for review, and link them to active challenges to earn points."
        action={
          <Button onClick={() => setDrawerOpen(true)} icon={<Plus className="w-[18px] h-[18px]" />}>
            New Task
          </Button>
        }
      />

      {loading ? (
        <div className="space-y-3">
          <SkeletonCard className="h-24" />
          <SkeletonCard className="h-24" />
          <SkeletonCard className="h-24" />
        </div>
      ) : error ? (
        <ErrorState onRetry={loadData} message="We couldn't load your tasks. Please try again." />
      ) : (
        <>
          <Tabs
            tabs={STATUS_TABS.map((t) => ({ ...t, count: counts[t.key as keyof typeof counts] }))}
            active={tab}
            onChange={setTab}
          />

          {visible.length === 0 ? (
            <EmptyState
              icon={<CheckSquare className="w-6 h-6" />}
              title={tab === "ALL" ? "No tasks yet" : "Nothing here"}
              description={
                tab === "ALL"
                  ? "Create your first task to start tracking your work."
                  : "No tasks in this status."
              }
              action={
                tab === "ALL" ? (
                  <Button onClick={() => setDrawerOpen(true)} icon={<Plus className="w-[18px] h-[18px]" />}>
                    New Task
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <div className="space-y-3">
              {visible.map((task) => {
                const isPendingReview = task.status === "COMPLETED";
                const isApproved = task.status === "APPROVED";
                const isRejected = task.status === "REJECTED";
                const isActive = task.status === "PENDING" || task.status === "REJECTED";
                return (
                  <Card key={task.id} className="p-4 flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <Badge tone={task.priority === "HIGH" ? "danger" : "neutral"}>
                          {task.priority}
                        </Badge>
                        {task.challenge && (
                          <Badge tone="brand">
                            <Trophy className="w-3 h-3" /> {task.challenge.name}
                          </Badge>
                        )}
                      </div>
                      <h4 className="t-small font-medium text-[var(--text)] leading-snug">
                        {task.title}
                      </h4>
                      {task.description && (
                        <p className="t-caption text-[var(--muted)] mt-0.5 line-clamp-2 leading-relaxed">
                          {task.description}
                        </p>
                      )}
                      {task.dueDate && (
                        <div className="flex items-center gap-1 t-caption text-[var(--muted)] mt-1.5">
                          <Clock className="w-3.5 h-3.5" /> Due{" "}
                          {new Date(task.dueDate).toLocaleDateString()}
                        </div>
                      )}
                      {isRejected && (
                        <div className="mt-2 flex flex-col gap-1 p-2 bg-[var(--rose-tint)] border border-[var(--rose-border)] rounded-[var(--r-sm)] text-[var(--rose)] t-caption">
                          <span className="font-semibold flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5" /> Task Rejected
                          </span>
                          {task.rejectionReason && (
                            <span className="italic">Reason: {task.rejectionReason}</span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {isActive && (
                        <Button size="sm" variant="subtle" onClick={() => handleCompleteTask(task.id)}>
                          Mark Completed
                        </Button>
                      )}
                      {isPendingReview && (
                        <Badge tone="warning">
                          <Clock className="w-3.5 h-3.5" /> Under Review
                        </Badge>
                      )}
                      {isApproved && (
                        <Badge tone="success">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Approved
                        </Badge>
                      )}
                      {isActive && (
                        <button
                          onClick={() => setConfirmId(task.id)}
                          aria-label="Delete task"
                          className="p-2 text-[var(--rose)] rounded-[var(--r-sm)] hover:bg-[var(--rose-tint)] transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Create task drawer */}
      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="New Task"
        description="Add a task to your personal log and optionally link it to a challenge."
        footer={
          <>
            <Button variant="ghost" onClick={() => setDrawerOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateTask} loading={createLoading}>
              Add Task
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateTask} className="space-y-4">
          <Field label="Task title" required error={titleError}>
            {({ id, invalid }) => (
              <Input
                id={id}
                invalid={invalid}
                placeholder="e.g. Implement user profile UX"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (titleError) setTitleError("");
                }}
              />
            )}
          </Field>
          <Field label="Description / deliverables">
            {({ id }) => (
              <Textarea
                id={id}
                rows={3}
                placeholder="Details of your task…"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            )}
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Priority">
              {({ id }) => (
                <Select id={id} value={priority} onChange={(e) => setPriority(e.target.value)}>
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </Select>
              )}
            </Field>
            <Field label="Due date">
              {({ id }) => (
                <Input id={id} type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
              )}
            </Field>
          </div>
          <Field label="Link to active challenge">
            {({ id }) => (
              <Select id={id} value={challengeId} onChange={(e) => setChallengeId(e.target.value)}>
                <option value="">No challenge link</option>
                {challenges.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} (+{c.rewardPoints} pts)
                  </option>
                ))}
              </Select>
            )}
          </Field>
        </form>
      </Drawer>

      <ConfirmDialog
        open={!!confirmId}
        onClose={() => setConfirmId(null)}
        onConfirm={handleDeleteTask}
        title="Delete task?"
        description="This permanently removes the task from your log. This can't be undone."
        confirmLabel="Delete"
      />
    </div>
  );
}
