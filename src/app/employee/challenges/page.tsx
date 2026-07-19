import { challenges } from "@/lib/data";
import Icon from "@/components/ui/Icon";

const leadColors: Record<string, string> = {
  AO: "#6366f1",
  TB: "#f59e0b",
  CN: "#8b5cf6",
  BE: "#10b981",
};

export default function ChallengesPage() {
  return (
    <div>
      <div className="pt-1.5 pb-3.5">
        <div className="font-display font-extrabold text-[23px] text-ink tracking-tight">Challenges</div>
        <div className="text-[12.5px] text-muted">Compete, earn bonus points</div>
      </div>

      {challenges.map((c) => (
        <div key={c.id} className="bg-white border border-line rounded-[20px] p-[15px] mb-3">
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-[46px] h-[46px] rounded-[14px] grid place-items-center flex-shrink-0"
              style={{ background: c.gradient }}
            >
              <Icon name={c.icon} size={24} color="#fff" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[15px] font-bold text-ink">{c.name}</div>
              <div className="text-xs text-muted">{c.meta}</div>
            </div>
          </div>
          <div className="h-2 rounded-full bg-surface-2 overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{ width: `${c.progress}%`, background: "linear-gradient(90deg, var(--indigo), var(--violet))" }}
            />
          </div>
          <div className="flex justify-between items-center mt-2.5 text-xs">
            <div className="flex items-center">
              {c.leads.map((l, i) => (
                <div
                  key={l}
                  className="w-[26px] h-[26px] rounded-full border-2 border-white grid place-items-center text-[10px] font-bold text-white"
                  style={{ background: leadColors[l] || "#6366f1", marginLeft: i === 0 ? 0 : -8 }}
                >
                  {l}
                </div>
              ))}
            </div>
            <span className="font-bold text-gold-600">{c.prize}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
