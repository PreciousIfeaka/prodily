"use client";

import { useEffect, useState, startTransition } from "react";
import {
  getActiveSessionAction,
  clockAction,
  logManualTimeAction,
  getMyTimeEntriesAction,
} from "@/app/actions/challenges";
import { getMyTasksAction } from "@/app/actions/tasks";
import { Clock, Play, Pause, Square, Plus, History } from "lucide-react";
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
  Table,
  Tr,
  Td,
  EmptyState,
  ErrorState,
  SkeletonCard,
} from "@/components/ui";

export default function TimeTrackingPage() {
  const [activeSession, setActiveSession] = useState<any>(null);
  const [entries, setEntries] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [logOpen, setLogOpen] = useState(false);

  const [taskId, setTaskId] = useState("");
  const [date, setDate] = useState("");
  const [durationHours, setDurationHours] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [logLoading, setLogLoading] = useState(false);

  const { toast } = useToast();

  const loadData = async () => {
    setLoading(true);
    setError(false);
    try {
      const [sess, entryList, taskList] = await Promise.all([
        getActiveSessionAction(),
        getMyTimeEntriesAction(),
        getMyTasksAction(),
      ]);

      if (sess) {
        setActiveSession(sess);
        if (sess.status === "ACTIVE") {
          const started = new Date(sess.lastActionAt).getTime();
          setSeconds(
            Math.floor((Date.now() - started) / 1000) + Number(sess.accumulatedSeconds)
          );
        } else if (sess.status === "PAUSED") {
          setSeconds(Number(sess.accumulatedSeconds));
        }
      } else {
        setActiveSession(null);
        setSeconds(0);
      }

      if (entryList?.success && entryList.entries) setEntries(entryList.entries);
      else if (Array.isArray(entryList)) setEntries(entryList);

      setTasks((taskList || []).filter((t: any) => t.status !== "APPROVED"));
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

  useEffect(() => {
    if (activeSession && activeSession.status === "ACTIVE") {
      const interval = setInterval(() => setSeconds((prev) => prev + 1), 1000);
      return () => clearInterval(interval);
    }
  }, [activeSession]);

  const handleClockAction = (action: "CLOCK_IN" | "PAUSE" | "RESUME" | "CLOCK_OUT") => {
    startTransition(async () => {
      try {
        const res = await clockAction(action);
        if (res.success) {
          toast(`Session ${action.replace("_", " ").toLowerCase()} recorded.`);
          loadData();
        } else {
          toast(res.error || "Failed to update time clock.");
        }
      } catch {
        toast("Connection error.");
      }
    });
  };

  const handleLogManual = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!date) errs.date = "Pick a date.";
    if (!durationHours) errs.durationHours = "Enter the hours worked.";
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setLogLoading(true);
    const formData = new FormData();
    formData.append("date", date);
    formData.append("durationHours", durationHours);
    formData.append("description", description);
    formData.append("taskId", taskId);

    startTransition(async () => {
      try {
        const res = await logManualTimeAction(null, formData);
        if (res.success) {
          toast("Work hours logged.");
          setDate("");
          setDurationHours("");
          setDescription("");
          setTaskId("");
          setLogOpen(false);
          loadData();
        } else {
          toast(res.error || "Failed to log manual time entry.");
        }
      } catch {
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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Time Tracking"
        subtitle="Track live work sessions and log hours toward attendance challenges."
        action={
          <Button variant="secondary" onClick={() => setLogOpen(true)} icon={<Plus className="w-[18px] h-[18px]" />}>
            Log manual time
          </Button>
        }
      />

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <SkeletonCard className="lg:col-span-1 h-64" />
          <SkeletonCard className="lg:col-span-2 h-64" />
        </div>
      ) : error ? (
        <ErrorState onRetry={loadData} message="We couldn't load your time tracker. Please try again." />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Live Timer */}
          <Card className="lg:col-span-1 p-6 flex flex-col justify-between">
            <div>
              <h3 className="t-h3 text-[var(--text)] mb-1 flex items-center gap-2">
                <Clock className="w-5 h-5 text-[var(--brand-bright)]" /> Live Session
              </h3>
              <p className="t-caption text-[var(--muted)] mb-4">
                Record active session durations in real time.
              </p>
              <div className="text-center py-8 bg-[var(--surface-2)] rounded-[var(--r)] border border-[var(--line)] mb-4">
                <div className="font-mono text-4xl font-medium text-[var(--text)] tracking-wider">
                  {formatTime(seconds)}
                </div>
                <div className="t-micro text-[var(--muted)] font-medium uppercase mt-2">
                  Status: {activeSession ? activeSession.status : "CLOCKED OUT"}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              {!activeSession ? (
                <Button onClick={() => handleClockAction("CLOCK_IN")} fullWidth icon={<Play className="w-3.5 h-3.5 fill-current" />}>
                  Clock In
                </Button>
              ) : (
                <>
                  {activeSession.status === "ACTIVE" ? (
                    <Button variant="secondary" onClick={() => handleClockAction("PAUSE")} fullWidth icon={<Pause className="w-3.5 h-3.5 fill-current" />}>
                      Pause
                    </Button>
                  ) : (
                    <Button onClick={() => handleClockAction("RESUME")} fullWidth icon={<Play className="w-3.5 h-3.5 fill-current" />}>
                      Resume
                    </Button>
                  )}
                  <Button variant="danger" onClick={() => handleClockAction("CLOCK_OUT")} fullWidth icon={<Square className="w-3.5 h-3.5 fill-current" />}>
                    Stop
                  </Button>
                </>
              )}
            </div>
          </Card>

          {/* History */}
          <Card className="lg:col-span-2 p-6">
            <h3 className="t-h3 text-[var(--text)] mb-4 flex items-center gap-2">
              <History className="w-5 h-5 text-[var(--brand-bright)]" /> Time Log Sheet
            </h3>
            {entries.length === 0 ? (
              <EmptyState
                icon={<Clock className="w-6 h-6" />}
                title="No time entries yet"
                description="Start the live clock or log manual hours to build your timesheet."
                action={
                  <Button variant="secondary" onClick={() => setLogOpen(true)} icon={<Plus className="w-[18px] h-[18px]" />}>
                    Log manual time
                  </Button>
                }
              />
            ) : (
              <Table columns={["Date", "Duration", "Description / Linked task"]} caption="Your logged time entries">
                {entries.map((entry) => (
                  <Tr key={entry.id}>
                    <Td className="text-[var(--muted)] font-medium">
                      {new Date(entry.date).toLocaleDateString()}
                    </Td>
                    <Td className="font-medium">{entry.durationHours} hrs</Td>
                    <Td className="max-w-[260px]">
                      <div className="truncate">{entry.description || "—"}</div>
                      {entry.task && (
                        <span className="inline-block mt-1">
                          <Badge tone="brand">{entry.task.title}</Badge>
                        </span>
                      )}
                    </Td>
                  </Tr>
                ))}
              </Table>
            )}
          </Card>
        </div>
      )}

      {/* Manual log modal */}
      <Modal
        open={logOpen}
        onClose={() => setLogOpen(false)}
        title="Log manual time"
        description="Add hours directly to your timesheet."
        footer={
          <>
            <Button variant="ghost" onClick={() => setLogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleLogManual} loading={logLoading}>
              Log Hours
            </Button>
          </>
        }
      >
        <form onSubmit={handleLogManual} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Date" required error={errors.date}>
              {({ id, invalid }) => (
                <Input id={id} invalid={invalid} type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              )}
            </Field>
            <Field label="Duration (hours)" required error={errors.durationHours}>
              {({ id, invalid }) => (
                <Input
                  id={id}
                  invalid={invalid}
                  type="number"
                  min="0.5"
                  max="24"
                  step="0.5"
                  placeholder="8"
                  value={durationHours}
                  onChange={(e) => setDurationHours(e.target.value)}
                />
              )}
            </Field>
          </div>
          <Field label="Link to task (optional)">
            {({ id }) => (
              <Select id={id} value={taskId} onChange={(e) => setTaskId(e.target.value)}>
                <option value="">No linked task</option>
                {tasks.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
              </Select>
            )}
          </Field>
          <Field label="Description">
            {({ id }) => (
              <Input
                id={id}
                placeholder="e.g. Worked on frontend views"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            )}
          </Field>
        </form>
      </Modal>
    </div>
  );
}
