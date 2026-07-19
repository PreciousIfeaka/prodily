import { employee, badges, rewardHistory } from "@/lib/data";
import Icon from "@/components/ui/Icon";

const toneColor: Record<string, string> = {
  indigo: "var(--indigo)",
  mint: "var(--mint)",
  gold: "var(--gold-600)",
};
const toneBg: Record<string, string> = {
  indigo: "var(--indigo-tint)",
  mint: "var(--mint-tint)",
  gold: "var(--gold-tint)",
};

export default function ProfilePage() {
  return (
    <div>
      <div className="flex justify-between items-center pt-1.5 pb-3.5">
        <div>
          <div className="font-display font-extrabold text-[23px] text-ink tracking-tight">Your progress</div>
          <div className="text-[12.5px] text-muted">Badges · streaks · history</div>
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

      <div className="bg-white border border-line rounded-[22px] p-4 flex gap-3.5 items-center">
        <div className="text-center flex-1">
          <div className="font-display font-extrabold text-[22px] text-ink">{employee.badgesCount}</div>
          <div className="text-[11.5px] text-muted">Badges</div>
        </div>
        <div className="w-px h-[34px] bg-line" />
        <div className="text-center flex-1">
          <div className="font-display font-extrabold text-[22px]" style={{ color: "var(--gold-600)" }}>
            {employee.streak}🔥
          </div>
          <div className="text-[11.5px] text-muted">Day streak</div>
        </div>
        <div className="w-px h-[34px] bg-line" />
        <div className="text-center flex-1">
          <div className="font-display font-extrabold text-[22px] text-ink">{employee.teamRank}</div>
          <div className="text-[11.5px] text-muted">Team rank</div>
        </div>
      </div>

      <div className="flex justify-between items-center mt-5 mb-3">
        <h3 className="text-[17px]">Badges earned</h3>
      </div>
      <div className="grid grid-cols-3 gap-2.5">
        {badges.map((b) => (
          <div key={b.id} className="flex flex-col items-center gap-2 text-center">
            <div
              className="w-14 h-14 rounded-2xl grid place-items-center"
              style={{ background: b.locked ? "var(--surface-2)" : b.gradient }}
            >
              <Icon name={b.icon} size={24} color={b.locked ? "var(--faint)" : "#fff"} />
            </div>
            <div className={`text-[11px] font-semibold ${b.locked ? "text-faint" : "text-ink"}`}>{b.name}</div>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center mt-5 mb-3">
        <h3 className="text-[17px]">Reward history</h3>
      </div>
      <div className="bg-white border border-line rounded-[20px] overflow-hidden">
        {rewardHistory.map((r, i) => (
          <div
            key={r.id}
            className={`flex items-center gap-3 px-3.5 py-3.5 ${i !== rewardHistory.length - 1 ? "border-b border-line" : ""}`}
          >
            <div className="w-10 h-10 rounded-xl grid place-items-center flex-shrink-0" style={{ background: toneBg[r.tone] }}>
              <Icon name={r.icon} size={20} color={toneColor[r.tone]} />
            </div>
            <div className="flex-1 min-w-0">
              <b className="text-sm text-ink font-semibold block truncate">{r.title}</b>
              <span className="text-xs text-muted">{r.subtitle}</span>
            </div>
            <div className={`font-bold text-sm ${r.amount > 0 ? "text-mint" : "text-rose"}`}>
              {r.amount > 0 ? "+" : ""}
              {r.amount}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
