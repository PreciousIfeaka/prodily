"use client";

import Link from "next/link";
import { Flame, Award, TrendingUp, ChevronRight, Sparkles } from "lucide-react";
import { employee } from "@/lib/data";
import Icon from "@/components/ui/Icon";
import { useEmployee } from "@/components/EmployeeContext";

const toneBg: Record<string, string> = {
  indigo: "var(--indigo-tint)",
  rose: "var(--rose-tint)",
  mint: "var(--mint-tint)",
  gold: "var(--gold-tint)",
};
const toneColor: Record<string, string> = {
  indigo: "var(--indigo)",
  rose: "var(--rose)",
  mint: "var(--mint)",
  gold: "var(--gold-600)",
};

export default function EmployeeHome() {
  const { points, activity, checkIn } = useEmployee();

  return (
    <div className="flex flex-col gap-0">
      <div className="flex justify-between items-center pt-1.5 pb-3.5">
        <div>
          <div className="font-display font-extrabold text-[23px] text-ink tracking-tight">
            Hey, {employee.name} 👋
          </div>
          <div className="text-[12.5px] text-muted">Level up your week</div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-gold-tint text-gold-600 font-extrabold text-[13px] px-3 py-1.5 rounded-full">
            <Flame size={15} fill="currentColor" />
            {employee.streak}
          </div>
          <div
            className="relative w-[46px] h-[46px] rounded-full grid place-items-center"
            style={{ background: `conic-gradient(var(--gold) ${employee.ringProgress}%, rgba(0,0,0,.08) 0)` }}
          >
            <div
              className="w-[38px] h-[38px] rounded-full text-white font-bold text-[13px] grid place-items-center"
              style={{ background: "linear-gradient(140deg, var(--indigo), var(--violet))" }}
            >
              {employee.initials}
            </div>
          </div>
        </div>
      </div>

      <div
        className="relative overflow-hidden rounded-[26px] p-[22px] text-white shadow-[var(--sh-indigo)]"
        style={{ background: "radial-gradient(120% 120% at 85% -10%, #8b5cf6 0%, #6366f1 45%, #4338ca 100%)" }}
      >
        <div className="absolute w-[220px] h-[220px] rounded-full bg-white/12 -top-[90px] -right-10" />
        <div className="absolute w-[120px] h-[120px] rounded-full bg-gold/25 -bottom-[50px] -left-[30px]" />
        <div className="relative z-[2] flex justify-between items-center">
          <span className="text-[12.5px] opacity-80 font-semibold">Reward points</span>
          <span className="inline-flex items-center gap-1.5 bg-white/18 px-2.5 py-1 rounded-full text-xs font-bold">
            <Sparkles size={13} className="text-gold-tint" />
            {employee.level}
          </span>
        </div>
        <div className="relative z-[2] font-display font-extrabold text-[44px] tracking-tight leading-none mt-3 mb-0.5">
          {points.toLocaleString()} <span className="text-[19px] opacity-80 font-semibold">pts</span>
        </div>
        <div className="relative z-[2] h-[9px] rounded-md bg-white/25 overflow-hidden mt-3.5">
          <div
            className="h-full rounded-md"
            style={{
              width: `${employee.progress}%`,
              background: "linear-gradient(90deg,#fff,#fde68a)",
              boxShadow: "0 0 12px rgba(253,230,138,.8)",
            }}
          />
        </div>
        <div className="relative z-[2] flex justify-between items-center mt-2.5 text-[12.5px] opacity-85 font-medium">
          <span>{employee.pointsToNext} pts to Level 5 · Platinum</span>
        </div>
        <div className="relative z-[2] flex justify-between items-center mt-2.5">
          <span className="text-[12.5px] opacity-85 font-medium">≈ {employee.nairaValue} value</span>
          <Link
            href="/employee/rewards"
            className="bg-white text-indigo-700 font-extrabold text-[13px] rounded-xl px-3.5 py-2.5 flex items-center gap-1.5"
          >
            Redeem <ChevronRight size={14} />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2.5 mt-4">
        <div className="bg-white border border-line rounded-[18px] p-3.5">
          <div className="w-[34px] h-[34px] rounded-[11px] grid place-items-center mb-2.5" style={{ background: "var(--gold-tint)" }}>
            <Award size={18} color="var(--gold-600)" />
          </div>
          <div className="font-display font-bold text-[17px] text-ink">{employee.badgesCount}</div>
          <div className="text-[11.5px] text-muted">Badges</div>
        </div>
        <div className="bg-white border border-line rounded-[18px] p-3.5">
          <div className="w-[34px] h-[34px] rounded-[11px] grid place-items-center mb-2.5" style={{ background: "var(--mint-tint)" }}>
            <TrendingUp size={18} color="var(--mint)" />
          </div>
          <div className="font-display font-bold text-[17px] text-ink">{employee.monthDelta}</div>
          <div className="text-[11.5px] text-muted">This month</div>
        </div>
        <div className="bg-white border border-line rounded-[18px] p-3.5">
          <div className="w-[34px] h-[34px] rounded-[11px] grid place-items-center mb-2.5" style={{ background: "var(--indigo-tint)" }}>
            <Sparkles size={18} color="var(--indigo)" />
          </div>
          <div className="font-display font-bold text-[17px] text-ink">{employee.teamRank}</div>
          <div className="text-[11.5px] text-muted">Team rank</div>
        </div>
      </div>

      <div className="flex justify-between items-center mt-5 mb-3">
        <h3 className="text-[17px]">Keep it going</h3>
      </div>
      <div
        className="flex items-center gap-3 rounded-[18px] p-3.5"
        style={{ background: "linear-gradient(100deg, var(--gold-tint), #fff8e6)", border: "1px solid #fce9b8" }}
      >
        <div className="w-10 h-10 rounded-xl bg-white grid place-items-center shadow-[var(--sh-sm)] flex-shrink-0">
          <Flame size={22} color="var(--gold-600)" fill="var(--gold-600)" />
        </div>
        <div className="flex-1">
          <b className="text-sm text-ink block">Keep your {employee.streak}-day streak</b>
          <div className="text-xs text-muted">Check in today · +25 pts</div>
        </div>
        <button
          onClick={checkIn}
          className="bg-gold text-[#4a2c00] font-bold text-sm rounded-[13px] px-4 py-2.5 flex-shrink-0"
        >
          Check in
        </button>
      </div>

      <div className="flex justify-between items-center mt-5 mb-3">
        <h3 className="text-[17px]">Recent activity</h3>
        <Link href="/employee/profile" className="text-[13px] font-bold text-indigo">
          See all
        </Link>
      </div>
      <div className="bg-white border border-line rounded-[20px] overflow-hidden">
        {activity.map((a, i) => (
          <div
            key={a.id}
            className={`flex items-center gap-3 px-3.5 py-3.5 ${i !== activity.length - 1 ? "border-b border-line" : ""}`}
          >
            <div
              className="w-10 h-10 rounded-xl grid place-items-center flex-shrink-0"
              style={{ background: toneBg[a.tone] }}
            >
              <Icon name={a.icon} size={20} color={toneColor[a.tone]} />
            </div>
            <div className="flex-1 min-w-0">
              <b className="text-sm text-ink font-semibold block truncate">{a.title}</b>
              <span className="text-xs text-muted">{a.subtitle}</span>
            </div>
            <div className={`font-bold text-sm ${a.amount > 0 ? "text-mint" : "text-rose"}`}>
              {a.amount > 0 ? "+" : ""}
              {a.amount}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
