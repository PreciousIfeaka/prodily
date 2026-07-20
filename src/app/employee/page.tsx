"use client";

import { useState, useEffect, startTransition } from "react";
import Link from "next/link";
import {
  TrendingUp,
  ChevronRight,
  Clock,
  Coins,
  Play,
  Pause,
  Square,
  Trophy,
  History,
  Wallet,
} from "lucide-react";
import { getMeAction, getWalletAction } from "@/app/actions/auth";
import {
  getActiveChallengesAction,
  getActiveSessionAction,
  clockAction,
} from "@/app/actions/challenges";
import { getMyTransactionsAction } from "@/app/actions/transactions";
import { useToast } from "@/components/Toast";
import {
  Card,
  Badge,
  Button,
  Skeleton,
  SkeletonCard,
  ErrorState,
  EmptyState,
} from "@/components/ui";

export default function EmployeeDashboard() {
  const [user, setUser] = useState<any>(null);
  const [wallet, setWallet] = useState<any>(null);
  const [challenges, setChallenges] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [activeSession, setActiveSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [seconds, setSeconds] = useState(0);

  const { toast } = useToast();

  const loadData = async () => {
    setLoading(true);
    setError(false);
    try {
      // Fire all requests in parallel; a single slow call no longer gates the page.
      const [me, w, chRes, txRes, sess] = await Promise.all([
        getMeAction(),
        getWalletAction(),
        getActiveChallengesAction(),
        getMyTransactionsAction(undefined, 1, 5),
        getActiveSessionAction(),
      ]);

      if (me) setUser(me);
      if (w) setWallet(w);
      if (chRes?.success && chRes.challenges) setChallenges(chRes.challenges);
      if (txRes?.success && txRes.transactions) setTransactions(txRes.transactions);

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
          toast(`Clock ${action.replace("_", " ").toLowerCase()} recorded.`);
          loadData();
        } else {
          toast(res.error || "Failed to update clock session.");
        }
      } catch {
        toast("Connection error.");
      }
    });
  };

  const formatTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600).toString().padStart(2, "0");
    const mins = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, "0");
    const secs = (totalSeconds % 60).toString().padStart(2, "0");
    return `${hrs}:${mins}:${secs}`;
  };

  const username = user?.firstName || "there";
  const points = wallet ? Number(wallet.bonusPoints ?? 0) : 0;
  const cashBalance = wallet ? Number(wallet.balance ?? 0) : 0;

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-9 w-56" />
        <Skeleton className="h-44 w-full rounded-[var(--r-xl)]" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <SkeletonCard className="lg:col-span-1 h-56" />
          <SkeletonCard className="lg:col-span-2 h-56" />
        </div>
        <SkeletonCard className="h-52" />
      </div>
    );
  }

  if (error) {
    return <ErrorState onRetry={loadData} message="We couldn't load your workspace. Please try again." />;
  }

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div>
        <h1 className="t-display text-[var(--text)]">Hey, {username}</h1>
        <p className="t-body text-[var(--muted)] mt-1">Welcome back to your recognition space.</p>
      </div>

      {/* Hero Points card */}
      <div
        className="relative overflow-hidden rounded-[var(--r-xl)] p-6 sm:p-7 text-white shadow-[var(--glow-brand)] animate-fade-in"
        style={{
          background:
            "radial-gradient(120% 120% at 85% -10%, #55d396 0%, #169a50 46%, #0c5c30 100%)",
        }}
      >
        <div className="absolute w-[220px] h-[220px] rounded-full bg-white/10 -top-[90px] -right-10 pointer-events-none" />
        <div className="relative z-10 flex items-center justify-between gap-4">
          <span className="t-caption opacity-90 font-medium uppercase tracking-wider">
            Reward Bonus Points
          </span>
          <Link
            href="/employee/wallet"
            className="bg-white/15 hover:bg-white/25 border border-white/15 text-white font-medium t-caption rounded-[var(--r-pill)] px-3.5 py-1.5 flex items-center gap-1 transition-colors"
          >
            Redeem points <ChevronRight size={14} />
          </Link>
        </div>

        <div className="relative z-10 font-display font-medium text-[44px] sm:text-[52px] tracking-tight leading-none mt-4">
          {points.toLocaleString()}
          <span className="text-lg opacity-80 font-medium ml-2">pts</span>
        </div>

        <div className="relative z-10 mt-5 inline-flex items-center gap-2 bg-black/15 rounded-[var(--r)] px-4 py-2.5">
          <Wallet size={16} className="opacity-90" />
          <span className="t-small font-medium">
            Wallet cash balance: ₦{cashBalance.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Grid: Timer card and challenges */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Clock Timer card */}
        <Card className="lg:col-span-1 p-6 flex flex-col justify-between">
          <div>
            <h3 className="t-h3 text-[var(--text)] mb-1 flex items-center gap-2">
              <Clock className="w-5 h-5 text-[var(--brand-bright)]" /> Time Session Tracker
            </h3>
            <p className="t-caption text-[var(--muted)] mb-4">
              Track your work hours for attendance challenges.
            </p>
            <div className="text-center py-6 bg-[var(--surface-2)] rounded-[var(--r)] border border-[var(--line)] mb-4">
              <div className="font-mono text-3xl font-medium text-[var(--text)] tracking-wider">
                {formatTime(seconds)}
              </div>
              <div className="t-micro text-[var(--muted)] font-medium uppercase mt-1">
                Status: {activeSession ? activeSession.status : "CLOCKED OUT"}
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            {!activeSession ? (
              <Button
                onClick={() => handleClockAction("CLOCK_IN")}
                fullWidth
                icon={<Play className="w-3.5 h-3.5 fill-current" />}
              >
                Clock In
              </Button>
            ) : (
              <>
                {activeSession.status === "ACTIVE" ? (
                  <Button
                    variant="secondary"
                    onClick={() => handleClockAction("PAUSE")}
                    fullWidth
                    icon={<Pause className="w-3.5 h-3.5 fill-current" />}
                  >
                    Pause
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleClockAction("RESUME")}
                    fullWidth
                    icon={<Play className="w-3.5 h-3.5 fill-current" />}
                  >
                    Resume
                  </Button>
                )}
                <Button
                  variant="danger"
                  onClick={() => handleClockAction("CLOCK_OUT")}
                  fullWidth
                  icon={<Square className="w-3.5 h-3.5 fill-current" />}
                >
                  Stop
                </Button>
              </>
            )}
          </div>
        </Card>

        {/* Challenges */}
        <Card className="lg:col-span-2 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="t-h3 text-[var(--text)] flex items-center gap-2">
              <Trophy className="w-5 h-5 text-[var(--brand-bright)]" /> Active Challenges
            </h3>
            <Link
              href="/employee/challenges"
              className="t-caption font-medium text-[var(--brand-bright)] flex items-center gap-0.5 hover:underline"
            >
              View all <ChevronRight size={12} />
            </Link>
          </div>

          {challenges.length === 0 ? (
            <EmptyState
              icon={<Trophy className="w-6 h-6" />}
              title="No active challenges"
              description="New challenges will appear here when your team lead publishes them."
            />
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none pr-1">
              {challenges.map((ch) => (
                <div
                  key={ch.id}
                  className="min-w-[240px] max-w-[260px] bg-[var(--surface-2)] border border-[var(--line)] rounded-[var(--r)] p-4 flex flex-col justify-between flex-shrink-0"
                >
                  <div>
                    <Badge tone="brand" className="mb-2">
                      {ch.category}
                    </Badge>
                    <h4 className="t-small font-medium text-[var(--text)] line-clamp-1 mb-1">
                      {ch.name}
                    </h4>
                    <p className="t-caption text-[var(--muted)] line-clamp-2 leading-relaxed">
                      {ch.description}
                    </p>
                  </div>
                  <div className="flex justify-between items-center border-t border-[var(--line)] pt-3 mt-3">
                    <span className="t-caption font-medium text-[var(--brand-bright)]">
                      {ch.rewardPoints} pts
                    </span>
                    <span className="t-micro text-[var(--muted)] font-medium">
                      Ends {new Date(ch.endDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="t-h3 text-[var(--text)] flex items-center gap-2">
            <History className="w-5 h-5 text-[var(--brand-bright)]" /> Recent Transactions
          </h3>
          <Link
            href="/employee/transactions"
            className="t-caption font-medium text-[var(--brand-bright)] hover:underline"
          >
            See history
          </Link>
        </div>

        {transactions.length === 0 ? (
          <EmptyState
            icon={<Coins className="w-6 h-6" />}
            title="No transactions yet"
            description="Points and payouts you earn will show up here."
          />
        ) : (
          <div className="space-y-1">
            {transactions.map((tx) => {
              const isCredit = tx.type === "CREDIT";
              return (
                <div
                  key={tx.id}
                  className="flex items-center justify-between py-3 border-b border-[var(--line)] last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-[var(--r-sm)] grid place-items-center ${
                        isCredit
                          ? "bg-[var(--mint-tint)] text-[var(--brand-bright)]"
                          : "bg-[var(--rose-tint)] text-[var(--rose)]"
                      }`}
                    >
                      <Coins className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <div className="t-small font-medium text-[var(--text)]">
                        {tx.purpose?.replace(/_/g, " ") || "Transaction"}
                      </div>
                      <div className="t-caption text-[var(--muted)]">
                        {new Date(tx.createdAt).toLocaleDateString()} · {tx.status}
                      </div>
                    </div>
                  </div>
                  <div
                    className={`t-body font-medium ${
                      isCredit ? "text-[var(--brand-bright)]" : "text-[var(--rose)]"
                    }`}
                  >
                    {isCredit ? "+" : "-"}₦{Number(tx.amount).toLocaleString()}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
