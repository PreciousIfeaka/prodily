"use client";

import { useEffect, useState } from "react";
import { getWeeklyLeaderboardAction } from "@/app/actions/challenges";
import { Trophy, Sparkles, Star } from "lucide-react";
import {
  PageHeader,
  Card,
  Avatar,
  EmptyState,
  ErrorState,
  SkeletonCard,
} from "@/components/ui";

export default function LeaderboardPage() {
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await getWeeklyLeaderboardAction();
      if (res?.success && res.leaderboard) setList(res.leaderboard);
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

  const podiumHeights = ["h-[120px]", "h-[92px]", "h-[72px]"];
  const podiumOrder = [1, 0, 2];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="Weekly Leaderboard"
        subtitle="Compete in challenges and clock sessions to climb the rankings. Updated every Monday."
      />

      {loading ? (
        <div className="space-y-3">
          <SkeletonCard className="h-40" />
          <SkeletonCard className="h-40" />
        </div>
      ) : error ? (
        <ErrorState onRetry={loadData} message="We couldn't load the leaderboard. Please try again." />
      ) : list.length === 0 ? (
        <EmptyState
          icon={<Trophy className="w-6 h-6" />}
          title="No rankings yet"
          description="No performance records have been logged this week."
        />
      ) : (
        <div className="space-y-8">
          {/* Podium */}
          <div className="grid grid-cols-3 gap-3 md:gap-5 pt-4 items-end max-w-lg mx-auto text-center">
            {podiumOrder.map((idx, col) => {
              const item = list[idx];
              const rank = idx + 1;
              if (!item) return <div key={col} />;
              const tone =
                rank === 1
                  ? "text-[var(--brand-bright)]"
                  : rank === 2
                  ? "text-[var(--muted)]"
                  : "text-[var(--gold)]";
              return (
                <div key={col} className="flex flex-col items-center">
                  {rank === 1 && <Trophy className="w-7 h-7 text-[var(--gold)] mb-1" />}
                  <Avatar name={item.user?.firstName || "Member"} size={rank === 1 ? 48 : 40} />
                  <div className="t-small font-medium text-[var(--text)] truncate max-w-[90px] mt-2">
                    {item.user?.firstName || "Member"}
                  </div>
                  <div className={`t-caption font-medium mb-3 ${tone}`}>{item.points} pts</div>
                  <div
                    className={`w-full rounded-t-[var(--r)] border border-b-0 flex items-center justify-center ${podiumHeights[col]} ${
                      rank === 1
                        ? "bg-[var(--brand-tint)] border-[var(--brand)]/40"
                        : "bg-[var(--surface-2)] border-[var(--line-2)]"
                    }`}
                  >
                    <span className={`font-display font-medium text-2xl ${tone}`}>{rank}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Ranking list */}
          <Card className="p-6">
            <h3 className="t-h3 text-[var(--text)] mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[var(--brand-bright)]" /> Rankings
            </h3>
            <div className="space-y-1">
              {list.map((item, index) => {
                const rank = index + 1;
                return (
                  <div
                    key={item.userId}
                    className="flex items-center justify-between py-3 border-b border-[var(--line)] last:border-0"
                  >
                    <div className="flex items-center gap-4">
                      <span
                        className={`w-8 h-8 rounded-[var(--r-sm)] font-medium grid place-items-center t-caption ${
                          rank <= 3
                            ? "bg-[var(--brand-tint)] text-[var(--brand-bright)]"
                            : "bg-[var(--surface-3)] text-[var(--muted)]"
                        }`}
                      >
                        {rank}
                      </span>
                      <div>
                        <div className="t-small font-medium text-[var(--text)]">
                          {item.user ? `${item.user.firstName} ${item.user.lastName}` : "Employee"}
                        </div>
                        <div className="t-caption text-[var(--muted)]">{item.user?.email}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 font-display font-medium t-body text-[var(--brand-bright)]">
                      <Star className="w-4 h-4 fill-current" />
                      {item.points} pts
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
