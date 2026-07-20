"use client";

import { useState, useEffect, startTransition } from "react";
import LinkNext from "next/link";
import { Flame, Award, TrendingUp, ChevronRight, Sparkles, Clock, Coins, Play, Pause, Square, Trophy, History } from "lucide-react";
import { getMeAction, getWalletAction } from "@/app/actions/auth";
import { getActiveChallengesAction, getActiveSessionAction, clockAction } from "@/app/actions/challenges";
import { getMyTransactionsAction } from "@/app/actions/transactions";
import { useToast } from "@/components/Toast";

export default function EmployeeDashboard() {
  const [user, setUser] = useState<any>(null);
  const [wallet, setWallet] = useState<any>(null);
  const [challenges, setChallenges] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [activeSession, setActiveSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Live Timer states
  const [seconds, setSeconds] = useState(0);
  const [timerInterval, setTimerInterval] = useState<any>(null);

  const { celebrate, toast } = useToast();

  const loadData = async () => {
    try {
      const me = await getMeAction();
      if (me) setUser(me);

      const w = await getWalletAction();
      if (w) setWallet(w);

      const chRes = await getActiveChallengesAction();
      if (chRes.success && chRes.challenges) {
        setChallenges(chRes.challenges);
      }

      const txRes = await getMyTransactionsAction(undefined, 1, 5);
      if (txRes.success && txRes.transactions) {
        setTransactions(txRes.transactions);
      }

      const sess = await getActiveSessionAction();
      if (sess) {
        setActiveSession(sess);
        // Calculate seconds
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
          celebrate(`Successfully updated clock status to ${action.replace("_", " ").toLowerCase()}`);
          loadData();
        } else {
          toast(res.error || "Failed to update clock session.");
        }
      } catch (err) {
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex items-center gap-3 bg-white p-8 rounded-[32px] border border-[var(--line)] shadow-[var(--sh)]">
          <span className="w-6 h-6 border-2 border-[var(--indigo)]/30 border-t-[var(--indigo)] rounded-full animate-spin" />
          <span className="font-semibold text-sm">Loading employee workspace...</span>
        </div>
      </div>
    );
  }

  const points = wallet ? wallet.bonusPoints : 0;
  const cashBalance = wallet ? wallet.balance : 0.0;
  const username = user ? user.firstName : "Employee";

  return (
    <div className="space-y-6 text-left">
      {/* Welcome banner */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-display font-extrabold text-[28px] text-[var(--ink)] tracking-tight">
            Hey, {username} 👋
          </h1>
          <p className="text-[13px] text-[var(--muted)] font-medium">Welcome back to your recognition space.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-amber-50 border border-amber-100 text-amber-600 font-extrabold text-[12.5px] px-3.5 py-1.5 rounded-full shadow-sm">
            <Flame size={14} fill="currentColor" />
            12 day streak
          </div>
        </div>
      </div>

      {/* Hero Points card */}
      <div
        className="relative overflow-hidden rounded-[26px] p-6 text-white shadow-[var(--sh-indigo)] animate-fade-in"
        style={{ background: "radial-gradient(120% 120% at 85% -10%, #8b5cf6 0%, #6366f1 45%, #4338ca 100%)" }}
      >
        <div className="absolute w-[220px] h-[220px] rounded-full bg-white/10 -top-[90px] -right-10 pointer-events-none" />
        <div className="relative z-10 flex justify-between items-center">
          <span className="text-xs opacity-90 font-semibold uppercase tracking-wider">Reward Bonus Points</span>
          <span className="inline-flex items-center gap-1.5 bg-white/20 px-3 py-1 rounded-full text-xs font-bold border border-white/10">
            <Sparkles size={12} className="text-amber-200" />
            Bronze Member
          </span>
        </div>

        <div className="relative z-10 font-display font-extrabold text-[46px] tracking-tight leading-none mt-4">
          {points.toLocaleString()} <span className="text-lg opacity-80 font-semibold">pts</span>
        </div>

        <div className="relative z-10 h-[9px] rounded-full bg-white/20 overflow-hidden mt-5">
          <div
            className="h-full rounded-full"
            style={{
              width: `${Math.min((points / 1000) * 100, 100)}%`,
              background: "linear-gradient(90deg, #fff, #fde68a)",
              boxShadow: "0 0 10px rgba(253,230,138,0.7)"
            }}
          />
        </div>

        <div className="relative z-10 flex justify-between items-center mt-4">
          <div className="text-[12.5px] opacity-80 font-medium">
            ≈ ₦{cashBalance.toLocaleString()} NGN cash value
          </div>
          <LinkNext
            href="/employee/wallet"
            className="bg-white text-[var(--indigo)] font-bold text-xs rounded-xl px-4 py-2.5 flex items-center gap-1 hover:scale-[1.01] transition-all"
          >
            Redeem points <ChevronRight size={14} />
          </LinkNext>
        </div>
      </div>

      {/* Grid: Timer card and challenges carousel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Clock Timer card */}
        <div className="lg:col-span-1 bg-white border border-[var(--line)] rounded-[26px] p-6 shadow-[var(--sh-sm)] flex flex-col justify-between">
          <div>
            <h3 className="font-display font-extrabold text-[17px] text-[var(--ink)] mb-1 flex items-center gap-2">
              <Clock className="w-5 h-5 text-[var(--indigo)]" /> Time Session Tracker
            </h3>
            <p className="text-[11.5px] text-[var(--muted)] font-medium mb-4">
              Track your work hours for attendance challenges.
            </p>

            <div className="text-center py-6 bg-[var(--surface-2)] rounded-2xl border border-[var(--line)] mb-4">
              <div className="font-mono text-3xl font-bold text-[var(--ink)] tracking-wider">
                {formatTime(seconds)}
              </div>
              <div className="text-[10px] text-[var(--muted)] font-bold uppercase mt-1">
                Status: {activeSession ? activeSession.status : "CLOCKED OUT"}
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

        {/* Challenges carousel banner */}
        <div className="lg:col-span-2 bg-white border border-[var(--line)] rounded-[26px] p-6 shadow-[var(--sh-sm)] flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-display font-extrabold text-[17px] text-[var(--ink)] flex items-center gap-2">
                <Trophy className="w-5 h-5 text-[var(--indigo)]" /> Active Challenges
              </h3>
              <LinkNext href="/employee/challenges" className="text-xs font-bold text-[var(--indigo)] flex items-center gap-0.5">
                View all <ChevronRight size={12} />
              </LinkNext>
            </div>

            {challenges.length === 0 ? (
              <div className="text-center py-10 bg-[var(--surface-2)] border border-[var(--line)] border-dashed rounded-2xl">
                <Trophy className="w-8 h-8 text-[var(--faint)] mx-auto mb-2" />
                <p className="text-xs text-[var(--muted)] font-semibold">No active challenges available right now.</p>
              </div>
            ) : (
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none pr-1">
                {challenges.map((ch) => (
                  <div
                    key={ch.id}
                    className="min-w-[240px] max-w-[260px] bg-[var(--surface-2)] border border-[var(--line)] rounded-2xl p-4 flex flex-col justify-between flex-shrink-0"
                  >
                    <div>
                      <span className="px-2 py-0.5 bg-[var(--violet-tint)] text-[var(--violet)] text-[9px] font-extrabold border border-purple-100 rounded-md uppercase tracking-wider block w-max mb-2">
                        {ch.category}
                      </span>
                      <h4 className="text-xs font-bold text-[var(--ink)] line-clamp-1 mb-1">{ch.name}</h4>
                      <p className="text-[11px] text-[var(--muted)] line-clamp-2 leading-relaxed">{ch.description}</p>
                    </div>
                    <div className="flex justify-between items-center border-t border-[var(--line)] pt-3 mt-3">
                      <span className="text-[11px] font-extrabold text-[var(--indigo)]">🏅 {ch.rewardPoints} pts</span>
                      <span className="text-[10px] text-[var(--muted)] font-medium">Ends {new Date(ch.endDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity (transactions timeline) */}
      <div className="bg-white border border-[var(--line)] rounded-[26px] p-6 shadow-[var(--sh-sm)]">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-display font-extrabold text-[18px] text-[var(--ink)] flex items-center gap-2">
            <History className="w-5 h-5 text-[var(--indigo)]" /> Recent Transactions
          </h3>
          <LinkNext href="/employee/transactions" className="text-xs font-bold text-[var(--indigo)]">
            See history
          </LinkNext>
        </div>

        {transactions.length === 0 ? (
          <p className="text-xs text-[var(--muted)] italic text-center py-6">No transaction records found.</p>
        ) : (
          <div className="space-y-3.5">
            {transactions.map((tx) => {
              const isCredit = tx.type === "CREDIT";
              return (
                <div key={tx.id} className="flex items-center justify-between border-b last:border-b-0 pb-3 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl grid place-items-center ${isCredit ? "bg-green-50 text-[var(--mint)]" : "bg-red-50 text-[var(--rose)]"}`}>
                      <Coins className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[var(--ink)]">
                        {tx.purpose?.replace(/_/g, " ").toUpperCase() || "TRANSACTION"}
                      </div>
                      <div className="text-[10px] text-[var(--muted)] font-medium">
                        {new Date(tx.createdAt).toLocaleDateString()} · {tx.status}
                      </div>
                    </div>
                  </div>
                  <div className={`text-sm font-bold ${isCredit ? "text-[var(--mint)]" : "text-[var(--rose)]"}`}>
                    {isCredit ? "+" : "-"}₦{Number(tx.amount).toLocaleString()}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
