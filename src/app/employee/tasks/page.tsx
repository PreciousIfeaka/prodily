"use client";

import { useEffect, useState, startTransition } from "react";
import { getMyTasksAction, createTaskAction, completeTaskAction, deleteTaskAction } from "@/app/actions/tasks";
import { getActiveChallengesAction } from "@/app/actions/challenges";
import { CheckSquare, Plus, Clock, AlertCircle, Trash2, CheckCircle2 } from "lucide-react";
import { useToast } from "@/components/Toast";

export default function EmployeeTasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [challenges, setChallenges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [dueDate, setDueDate] = useState("");
  const [challengeId, setChallengeId] = useState("");
  const [createLoading, setCreateLoading] = useState(false);

  const { celebrate, toast } = useToast();

  const loadData = async () => {
    try {
      const taskList = await getMyTasksAction();
      setTasks(taskList || []);

      const chalList = await getActiveChallengesAction();
      if (chalList.success && chalList.challenges) {
        setChallenges(chalList.challenges);
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

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

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
          celebrate("Task created successfully!");
          setTitle("");
          setDescription("");
          setPriority("MEDIUM");
          setDueDate("");
          setChallengeId("");
          loadData();
        } else {
          toast(res.error || "Failed to create task.");
        }
      } catch (err) {
        toast("Connection error.");
      } finally {
        setCreateLoading(false);
      }
    });
  };

  const handleCompleteTask = async (id: string) => {
    startTransition(async () => {
      try {
        const res = await completeTaskAction(id);
        if (res.success) {
          celebrate("Task completed! Routed to Team Lead review queue.");
          loadData();
        } else {
          toast(res.error || "Failed to complete task.");
        }
      } catch (err) {
        toast("Connection error.");
      }
    });
  };

  const handleDeleteTask = async (id: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return;

    startTransition(async () => {
      try {
        const res = await deleteTaskAction(id);
        if (res.success) {
          celebrate("Task deleted successfully.");
          loadData();
        } else {
          toast(res.error || "Failed to delete task.");
        }
      } catch (err) {
        toast("Connection error.");
      }
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex items-center gap-3 bg-white p-8 rounded-[32px] border border-[var(--line)] shadow-[var(--sh)]">
          <span className="w-6 h-6 border-2 border-[var(--indigo)]/30 border-t-[var(--indigo)] rounded-full animate-spin" />
          <span className="font-semibold text-sm">Loading task board...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left">
      {/* Title */}
      <div>
        <h1 className="font-display font-extrabold text-3xl text-[var(--ink)] tracking-tight">
          My Tasks Board
        </h1>
        <p className="text-[14px] text-[var(--muted)] font-medium mt-1">
          Create, complete, and link your tasks to active organization or team challenges to earn points.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Create Task Form */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-[var(--line)] rounded-[26px] p-6 shadow-[var(--sh-sm)] sticky top-24">
            <h3 className="font-display font-extrabold text-[18px] text-[var(--ink)] mb-1 flex items-center gap-2">
              <Plus className="w-5 h-5 text-[var(--indigo)]" /> New Task
            </h3>
            <p className="text-[12px] text-[var(--muted)] font-medium mb-4">
              Add a new task to your personal log.
            </p>

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[var(--ink)] uppercase tracking-wider pl-1" htmlFor="taskTitle">
                  Task Title
                </label>
                <input
                  id="taskTitle"
                  type="text"
                  required
                  placeholder="e.g. Implement User Profile UX"
                  className="w-full bg-white border border-[var(--line)] rounded-xl px-4 py-2.5 outline-none focus:border-[var(--indigo)] transition-all font-body text-xs text-[var(--ink)] font-medium shadow-[var(--sh-sm)]"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[var(--ink)] uppercase tracking-wider pl-1" htmlFor="taskDesc">
                  Description / Deliverables
                </label>
                <textarea
                  id="taskDesc"
                  rows={2}
                  required
                  placeholder="Details of your task..."
                  className="w-full bg-white border border-[var(--line)] rounded-xl px-4 py-2.5 outline-none focus:border-[var(--indigo)] transition-all font-body text-xs text-[var(--ink)] font-medium shadow-[var(--sh-sm)] resize-none"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[var(--ink)] uppercase tracking-wider pl-1" htmlFor="taskPriority">
                    Priority
                  </label>
                  <select
                    id="taskPriority"
                    className="w-full bg-white border border-[var(--line)] rounded-xl px-3 py-2 outline-none focus:border-[var(--indigo)] transition-all font-body text-xs text-[var(--ink)] font-medium shadow-[var(--sh-sm)]"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    required
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[var(--ink)] uppercase tracking-wider pl-1" htmlFor="taskDueDate">
                    Due Date
                  </label>
                  <input
                    id="taskDueDate"
                    type="date"
                    required
                    className="w-full bg-white border border-[var(--line)] rounded-xl px-3 py-2 outline-none focus:border-[var(--indigo)] transition-all font-body text-xs text-[var(--ink)] font-medium shadow-[var(--sh-sm)]"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[var(--ink)] uppercase tracking-wider pl-1" htmlFor="linkChallenge">
                  Link to Active Challenge
                </label>
                <select
                  id="linkChallenge"
                  className="w-full bg-white border border-[var(--line)] rounded-xl px-3 py-2 outline-none focus:border-[var(--indigo)] transition-all font-body text-xs text-[var(--ink)] font-medium shadow-[var(--sh-sm)]"
                  value={challengeId}
                  onChange={(e) => setChallengeId(e.target.value)}
                >
                  <option value="">No Challenge Link</option>
                  {challenges.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} (+{c.rewardPoints} pts)
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={createLoading}
                className="w-full bg-[var(--indigo)] hover:bg-[var(--indigo-600)] disabled:opacity-50 text-white font-bold py-2.5 px-4 rounded-xl shadow-sm hover:translate-y-[-1px] transition-all cursor-pointer font-body text-xs uppercase tracking-wider"
              >
                {createLoading ? "Saving..." : "Add Task"}
              </button>
            </form>
          </div>
        </div>

        {/* Right column: Task List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-[var(--line)] rounded-[26px] p-6 shadow-[var(--sh-sm)] min-h-[400px]">
            <h3 className="font-display font-extrabold text-[18px] text-[var(--ink)] mb-4 flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-[var(--indigo)]" /> Active Log &amp; Statuses
            </h3>

            {tasks.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-[var(--line)] rounded-[20px]">
                <CheckSquare className="w-10 h-10 text-[var(--faint)] mx-auto mb-2" />
                <p className="text-xs text-[var(--muted)] font-semibold">No tasks logged.</p>
                <p className="text-[11px] text-[var(--muted)] mt-1">Start by adding a task on the left panel.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {tasks.map((task) => {
                  const isPendingReview = task.status === "COMPLETED";
                  const isApproved = task.status === "APPROVED";
                  const isActive = task.status === "PENDING";

                  return (
                    <div
                      key={task.id}
                      className="p-4 bg-[var(--surface-2)] border border-[var(--line)] rounded-2xl flex items-center justify-between gap-4 text-left"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className={`px-2 py-0.5 rounded text-[8.5px] uppercase font-extrabold border ${
                            task.priority === "HIGH" ? "bg-red-50 text-[var(--rose)] border-red-200" : "bg-gray-100 text-gray-500"
                          }`}>
                            {task.priority}
                          </span>
                          {task.challenge && (
                            <span className="px-2 py-0.5 bg-[var(--violet-tint)] text-[var(--violet)] border border-purple-100 rounded text-[8.5px] uppercase font-bold">
                              🏆 {task.challenge.name}
                            </span>
                          )}
                        </div>
                        <h4 className="text-xs font-bold text-[var(--ink)] leading-snug">{task.title}</h4>
                        {task.description && (
                          <p className="text-[11px] text-[var(--muted)] mt-0.5 line-clamp-2 leading-relaxed">{task.description}</p>
                        )}
                        {task.dueDate && (
                          <div className="flex items-center gap-1 text-[10.5px] text-[var(--muted)] mt-1.5 font-medium">
                            <Clock className="w-3.5 h-3.5" /> Due {new Date(task.dueDate).toLocaleDateString()}
                          </div>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2">
                        {isActive && (
                          <button
                            onClick={() => handleCompleteTask(task.id)}
                            className="px-3 py-1.5 bg-[var(--mint-tint)] hover:bg-mint text-[var(--mint)] hover:text-white rounded-lg text-[11px] font-bold border border-green-200 hover:translate-y-[-1px] transition-all cursor-pointer whitespace-nowrap"
                          >
                            Mark Completed
                          </button>
                        )}
                        {isPendingReview && (
                          <span className="px-2.5 py-1.5 bg-amber-50 text-amber-600 border border-amber-100 rounded-lg text-[10.5px] font-bold uppercase tracking-wider flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" /> Under Review
                          </span>
                        )}
                        {isApproved && (
                          <span className="px-2.5 py-1.5 bg-[var(--mint-tint)] text-[var(--mint)] border border-green-100 rounded-lg text-[10.5px] font-bold uppercase tracking-wider flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Approved
                          </span>
                        )}
                        {isActive && (
                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            className="p-2 hover:bg-white text-rose-500 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-[var(--line)]"
                            title="Delete Task"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
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
