"use client";

import { useEffect, useState, startTransition } from "react";
import { getActiveSessionAction, clockAction, logManualTimeAction, getMyTimeEntriesAction } from "@/app/actions/challenges";
import { getMyTasksAction } from "@/app/actions/tasks";
import { Clock, Play, Pause, Square, Plus, History } from "lucide-react";
import { useToast } from "@/components/Toast";

export default function TimeTrackingPage() {
  const [activeSession, setActiveSession] = useState<any>(null);
  const [entries, setEntries] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Live timer state
  const [seconds, setSeconds] = useState(0);

  // Form states
  const [taskId, setTaskId] = useState("");
  const [date, setDate] = useState("");
  const [durationHours, setDurationHours] = useState("");
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [logLoading, setLogLoading] = useState(false);

  const { celebrate, toast } = useToast();

  const loadData = async () => {
    try {
      const sess = await getActiveSessionAction();
      if (sess) {
        setActiveSession(sess);
        if (sess.status === "ACTIVE") {
          const started = new Date(sess.lastActionAt).getTime();
          const elapsed = Math.floor((Date.now() - started) / 1000) + Number(sess.accumulatedSeconds);
          setSeconds(elapsed);
        } else if (sess.status === "PAUSED") {
          setSeconds(Number(sess.accumulatedSeconds));
        }
      } else {
        setActiveSession(null);
        setSeconds(0);
      }

      const entryList = await getMyTimeEntriesAction();
      if (entryList && entryList.success && entryList.entries) {
        setEntries(entryList.entries);
      } else if (Array.isArray(entryList)) {
        setEntries(entryList);
      }

      const taskList = await getMyTasksAction();
      setTasks(taskList.filter((t: any) => t.status !== "APPROVED"));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Timer runner
  useEffect(() => {
    if (activeSession && activeSession.status === "ACTIVE") {
      const interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [activeSession]);

  const handleClockAction = async (action: "CLOCK_IN" | "PAUSE" | "RESUME" | "CLOCK_OUT") => {
    startTransition(async () => {
      try {
        const res = await clockAction(action);
        if (res.success) {
          celebrate(`Time tracking session updated to ${action.toLowerCase()}`);
          loadData();
        } else {
          toast(res.error || "Failed to update time clock.");
        }
      } catch (err) {
        toast("Connection error.");
      }
    });
  };

  const handleLogManual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !durationHours) return;

    setLogLoading(true);
    const formData = new FormData();
    formData.append("date", date);
    formData.append("durationHours", durationHours);
    formData.append("description", description);
    formData.append("taskId", taskId);
    formData.append("startTime", startTime);
    formData.append("endTime", endTime);

    startTransition(async () => {
      try {
        const res = await logManualTimeAction(null, formData);
        if (res.success) {
          celebrate("Work hours logged successfully!");
          setDate("");
          setDurationHours("");
          setDescription("");
          setTaskId("");
          setStartTime("");
          setEndTime("");
          loadData();
        } else {
          toast(res.error || "Failed to log manual time entry.");
        }
      } catch (err) {
        toast("Connection error.");
      } finally {
        setLogLoading(false);
      }
    });
  };

  const formatTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600).toString().padStart(2, "0");
    const mins = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, "0");
    const secs = (totalSeconds % 60).toString().padStart(2, "0");
    return `${hrs}:${mins}:${secs}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex items-center gap-3 bg-white p-8 rounded-[32px] border border-[var(--line)] shadow-[var(--sh)]">
          <span className="w-6 h-6 border-2 border-[var(--indigo)]/30 border-t-[var(--indigo)] rounded-full animate-spin" />
          <span className="font-semibold text-sm">Loading time tracker...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left">
      {/* Title */}
      <div>
        <h1 className="font-display font-extrabold text-3xl text-[var(--ink)] tracking-tight">
          Time Session Tracker
        </h1>
        <p className="text-[14px] text-[var(--muted)] font-medium mt-1">
          Monitor your work hours, submit manual logs, and track timesheet records for active attendance challenges.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Live Timer and Manual Log form */}
        <div className="lg:col-span-1 space-y-6">
          {/* Live Timer Widget */}
          <div className="bg-white border border-[var(--line)] rounded-[26px] p-6 shadow-[var(--sh-sm)] flex flex-col justify-between">
            <div>
              <h3 className="font-display font-extrabold text-[18px] text-[var(--ink)] mb-1 flex items-center gap-2">
                <Clock className="w-5 h-5 text-[var(--indigo)]" /> Timer Clock Widget
              </h3>
              <p className="text-[12px] text-[var(--muted)] font-medium mb-4">
                Record active session durations in real-time.
              </p>

              <div className="text-center py-8 bg-[var(--surface-2)] rounded-[22px] border border-[var(--line)] mb-4 shadow-[var(--sh-sm)]">
                <div className="font-mono text-4xl font-bold text-[var(--ink)] tracking-wider">
                  {formatTime(seconds)}
                </div>
                <div className="text-[10px] text-[var(--muted)] font-bold uppercase mt-2">
                  Session status: {activeSession ? activeSession.status : "CLOCKED OUT"}
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              {!activeSession ? (
                <button
                  onClick={() => handleClockAction("CLOCK_IN")}
                  className="flex-1 bg-[var(--mint)] hover:bg-emerald-600 text-white font-bold py-2.5 px-4 rounded-xl shadow-sm hover:translate-y-[-1px] transition-all flex items-center justify-center gap-1.5 cursor-pointer text-xs uppercase tracking-wider"
                >
                  <Play className="w-3.5 h-3.5 fill-current" /> Clock In
                </button>
              ) : (
                <>
                  {activeSession.status === "ACTIVE" ? (
                    <button
                      onClick={() => handleClockAction("PAUSE")}
                      className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-bold py-2.5 px-4 rounded-xl shadow-sm hover:translate-y-[-1px] transition-all flex items-center justify-center gap-1.5 cursor-pointer text-xs uppercase tracking-wider"
                    >
                      <Pause className="w-3.5 h-3.5 fill-current" /> Pause
                  </button>
                  ) : (
                    <button
                      onClick={() => handleClockAction("RESUME")}
                      className="flex-1 bg-[var(--mint)] hover:bg-emerald-600 text-white font-bold py-2.5 px-4 rounded-xl shadow-sm hover:translate-y-[-1px] transition-all flex items-center justify-center gap-1.5 cursor-pointer text-xs uppercase tracking-wider"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" /> Resume
                  </button>
                  )}
                  <button
                    onClick={() => handleClockAction("CLOCK_OUT")}
                    className="flex-1 bg-[var(--rose)] hover:bg-rose-600 text-white font-bold py-2.5 px-4 rounded-xl shadow-sm hover:translate-y-[-1px] transition-all flex items-center justify-center gap-1.5 cursor-pointer text-xs uppercase tracking-wider"
                  >
                    <Square className="w-3.5 h-3.5 fill-current" /> Stop
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Manual log form */}
          <div className="bg-white border border-[var(--line)] rounded-[26px] p-6 shadow-[var(--sh-sm)]">
            <h3 className="font-display font-extrabold text-[18px] text-[var(--ink)] mb-1 flex items-center gap-2">
              <Plus className="w-5 h-5 text-[var(--indigo)]" /> Log Manual Time
            </h3>
            <p className="text-[12px] text-[var(--muted)] font-medium mb-4">
              Add hours directly to your work sheet.
            </p>

            <form onSubmit={handleLogManual} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[var(--ink)] uppercase tracking-wider pl-1" htmlFor="logDate">
                  Date
                </label>
                <input
                  id="logDate"
                  type="date"
                  required
                  className="w-full bg-white border border-[var(--line)] rounded-xl px-3 py-2 outline-none focus:border-[var(--indigo)] transition-all font-body text-xs text-[var(--ink)] font-medium shadow-[var(--sh-sm)]"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[var(--ink)] uppercase tracking-wider pl-1" htmlFor="logHrs">
                  Duration (Hours)
                </label>
                <input
                  id="logHrs"
                  type="number"
                  required
                  min="0.5"
                  max="24"
                  step="0.5"
                  placeholder="8"
                  className="w-full bg-white border border-[var(--line)] rounded-xl px-4 py-2 outline-none focus:border-[var(--indigo)] transition-all font-body text-xs text-[var(--ink)] font-medium shadow-[var(--sh-sm)]"
                  value={durationHours}
                  onChange={(e) => setDurationHours(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[var(--ink)] uppercase tracking-wider pl-1" htmlFor="logTask">
                  Link to Task (Optional)
                </label>
                <select
                  id="logTask"
                  className="w-full bg-white border border-[var(--line)] rounded-xl px-3 py-2 outline-none focus:border-[var(--indigo)] transition-all font-body text-xs text-[var(--ink)] font-medium shadow-[var(--sh-sm)]"
                  value={taskId}
                  onChange={(e) => setTaskId(e.target.value)}
                >
                  <option value="">No linked task</option>
                  {tasks.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[var(--ink)] uppercase tracking-wider pl-1" htmlFor="logDesc">
                  Description
                </label>
                <input
                  id="logDesc"
                  type="text"
                  placeholder="e.g. Worked on frontend views"
                  className="w-full bg-white border border-[var(--line)] rounded-xl px-4 py-2 outline-none focus:border-[var(--indigo)] transition-all font-body text-xs text-[var(--ink)] font-medium shadow-[var(--sh-sm)]"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={logLoading}
                className="w-full bg-[var(--indigo)] hover:bg-[var(--indigo-600)] disabled:opacity-50 text-white font-bold py-2.5 px-4 rounded-xl shadow-sm hover:translate-y-[-1px] transition-all cursor-pointer font-body text-xs uppercase tracking-wider"
              >
                {logLoading ? "Logging..." : "Log Hours"}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Historical Entries log table */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-[var(--line)] rounded-[26px] p-6 shadow-[var(--sh-sm)] h-full">
            <h3 className="font-display font-extrabold text-[18px] text-[var(--ink)] mb-4 flex items-center gap-2">
              <History className="w-5 h-5 text-[var(--indigo)]" /> Time Log Sheet
            </h3>

            {entries.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-[var(--line)] rounded-[20px]">
                <Clock className="w-10 h-10 text-[var(--faint)] mx-auto mb-2" />
                <p className="text-xs text-[var(--muted)] font-semibold">No work entries found.</p>
                <p className="text-[11px] text-[var(--muted)] mt-1">Start your live clock or log manual hours on the left.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[var(--line)]">
                      <th className="pb-3 text-xs font-bold text-[var(--muted)] uppercase tracking-wider">Date</th>
                      <th className="pb-3 text-xs font-bold text-[var(--muted)] uppercase tracking-wider">Duration</th>
                      <th className="pb-3 text-xs font-bold text-[var(--muted)] uppercase tracking-wider">Description / Linked Task</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entries.map((entry) => (
                      <tr key={entry.id} className="border-b border-[var(--line)] last:border-b-0 hover:bg-[var(--surface-2)] transition-colors">
                        <td className="py-4 text-xs font-semibold text-[var(--muted)]">
                          {new Date(entry.date).toLocaleDateString()}
                        </td>
                        <td className="py-4 text-xs font-bold text-[var(--ink)]">
                          {entry.durationHours} Hours
                        </td>
                        <td className="py-4 text-xs text-[var(--text)] font-semibold max-w-[240px] truncate leading-relaxed">
                          <div>{entry.description}</div>
                          {entry.task && (
                            <span className="inline-block mt-0.5 text-[10px] text-[var(--indigo)] font-bold">
                              Linked Task: {entry.task.title}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
