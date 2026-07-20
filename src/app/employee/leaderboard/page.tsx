"use client";

import { useEffect, useState } from "react";
import { getWeeklyLeaderboardAction } from "@/app/actions/challenges";
import { Trophy, Award, Sparkles, Star } from "lucide-react";

export default function LeaderboardPage() {
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await getWeeklyLeaderboardAction();
        if (res.success && res.leaderboard) {
          setList(res.leaderboard);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex items-center gap-3 bg-white p-8 rounded-[32px] border border-[var(--line)] shadow-[var(--sh)]">
          <span className="w-6 h-6 border-2 border-[var(--indigo)]/30 border-t-[var(--indigo)] rounded-full animate-spin" />
          <span className="font-semibold text-sm">Loading weekly rankings...</span>
        </div>
      </div>
    );
  }

  // Extract top 3 podium items if list has enough length
  const podium1 = list[0] || null;
  const podium2 = list[1] || null;
  const podium3 = list[2] || null;

  const remainder = list.slice(3);

  return (
    <div className="space-y-6 text-left max-w-4xl mx-auto">
      {/* Title */}
      <div>
        <h1 className="font-display font-extrabold text-3xl text-[var(--ink)] tracking-tight">
          Weekly Leaderboard
        </h1>
        <p className="text-[14px] text-[var(--muted)] font-medium mt-1">
          Compete in challenges and clock sessions to climb the leaderboard rankings. Updated every Monday.
        </p>
      </div>

      {list.length === 0 ? (
        <div className="text-center py-16 bg-white border border-[var(--line)] rounded-[26px]">
          <Trophy className="w-12 h-12 text-[var(--faint)] mx-auto mb-2" />
          <p className="text-sm text-[var(--muted)] font-semibold">No performance records logged yet this week.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Visual Podium */}
          <div className="grid grid-cols-3 gap-3 md:gap-5 pt-8 items-end max-w-lg mx-auto text-center">
            {/* Podium Rank 2 (Left) */}
            <div className="flex flex-col items-center">
              {podium2 ? (
                <>
                  <div className="w-10 h-10 rounded-full bg-[var(--violet-tint)] text-[var(--violet)] font-bold grid place-items-center mb-2 shadow-sm border border-purple-200">
                    2nd
                  </div>
                  <div className="text-xs font-bold text-[var(--ink)] truncate max-w-[80px]">
                    {podium2.user?.firstName || "Member"}
                  </div>
                  <div className="text-[10px] text-[var(--muted)] font-bold mb-3">{podium2.points} pts</div>
                  <div
                    className="w-full bg-white border border-[var(--line)] border-b-0 rounded-t-2xl shadow-sm flex items-center justify-center"
                    style={{ height: "100px" }}
                  >
                    <span className="font-display font-extrabold text-2xl text-[var(--faint)]">2</span>
                  </div>
                </>
              ) : (
                <div className="h-[100px]" />
              )}
            </div>

            {/* Podium Rank 1 (Center) */}
            <div className="flex flex-col items-center">
              {podium1 ? (
                <>
                  <Trophy className="w-8 h-8 text-[var(--gold)] mb-1 animate-bounce" />
                  <div className="w-12 h-12 rounded-full bg-[var(--gold-tint)] text-[var(--gold-600)] font-bold grid place-items-center mb-2 shadow-md border border-amber-300">
                    1st
                  </div>
                  <div className="text-xs font-extrabold text-[var(--ink)] truncate max-w-[100px]">
                    {podium1.user?.firstName || "Winner"}
                  </div>
                  <div className="text-[11px] text-[var(--indigo)] font-extrabold mb-3">{podium1.points} pts</div>
                  <div
                    className="w-full bg-white border border-2 border-[var(--indigo)] border-b-0 rounded-t-2xl shadow-md flex items-center justify-center relative overflow-hidden"
                    style={{ height: "135px" }}
                  >
                    <div className="absolute w-[200px] h-[200px] rounded-full bg-[var(--indigo-tint)] -bottom-[120px] opacity-40" />
                    <span className="font-display font-extrabold text-3xl text-[var(--indigo)] relative z-10">1</span>
                  </div>
                </>
              ) : (
                <div className="h-[135px]" />
              )}
            </div>

            {/* Podium Rank 3 (Right) */}
            <div className="flex flex-col items-center">
              {podium3 ? (
                <>
                  <div className="w-10 h-10 rounded-full bg-[var(--rose-tint)] text-[var(--rose)] font-bold grid place-items-center mb-2 shadow-sm border border-red-200">
                    3rd
                  </div>
                  <div className="text-xs font-bold text-[var(--ink)] truncate max-w-[80px]">
                    {podium3.user?.firstName || "Member"}
                  </div>
                  <div className="text-[10px] text-[var(--muted)] font-bold mb-3">{podium3.points} pts</div>
                  <div
                    className="w-full bg-white border border-[var(--line)] border-b-0 rounded-t-2xl shadow-sm flex items-center justify-center"
                    style={{ height: "80px" }}
                  >
                    <span className="font-display font-extrabold text-2xl text-[var(--faint)]">3</span>
                  </div>
                </>
              ) : (
                <div className="h-[80px]" />
              )}
            </div>
          </div>

          {/* Ranking list table */}
          <div className="bg-white border border-[var(--line)] rounded-[26px] p-6 shadow-[var(--sh-sm)]">
            <h3 className="font-display font-extrabold text-[18px] text-[var(--ink)] mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[var(--indigo)]" /> Leaderboard Rankings
            </h3>
            <div className="space-y-2.5">
              {list.map((item, index) => {
                const rank = index + 1;
                const isPodium = rank <= 3;
                let rankBg = "bg-gray-100 text-gray-600";
                if (rank === 1) rankBg = "bg-amber-100 text-amber-600 border border-amber-300";
                if (rank === 2) rankBg = "bg-purple-100 text-purple-600 border border-purple-200";
                if (rank === 3) rankBg = "bg-red-100 text-red-600 border border-red-200";

                return (
                  <div
                    key={item.userId}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                      isPodium
                        ? "bg-[var(--surface-2)] border-[var(--line)] shadow-sm"
                        : "bg-white border-gray-100 hover:bg-[var(--surface-2)]"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <span className={`w-8 h-8 rounded-xl font-bold grid place-items-center text-xs ${rankBg}`}>
                        {rank}
                      </span>
                      <div>
                        <div className="text-xs font-bold text-[var(--ink)]">
                          {item.user ? `${item.user.firstName} ${item.user.lastName}` : "Employee"}
                        </div>
                        <div className="text-[10px] text-[var(--muted)] font-medium">
                          {item.user?.email}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 font-display font-extrabold text-sm text-[var(--indigo)]">
                      <Star className="w-4 h-4 fill-current" />
                      {item.points} pts
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
