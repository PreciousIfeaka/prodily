import { budgetTree } from "@/lib/data";
import Icon from "@/components/ui/Icon";

export default function BudgetPage() {
  const org = budgetTree[0];
  return (
    <div className="bg-white border border-line rounded-[22px] p-5">
      <div className="flex flex-col gap-3">
        <div className="border border-line rounded-2xl px-4 py-3.5">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-[11px] grid place-items-center bg-indigo-tint">
                <Icon name={org.icon} size={19} color="var(--indigo-700)" />
              </div>
              <div>
                <b className="text-[14.5px] text-ink">{org.name}</b>
                <div className="text-[11.5px] text-muted">{org.subtitle}</div>
              </div>
            </div>
            <div className="font-display font-bold text-ink text-[15px]">{org.amount}</div>
          </div>
        </div>

        {org.children?.map((c) => (
          <div key={c.id} className="ml-6 relative border border-line rounded-2xl px-4 py-3.5">
            <span className="absolute -left-[14px] top-1/2 w-3.5 h-px bg-line-2" />
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-[11px] grid place-items-center bg-violet-tint">
                  <Icon name={c.icon} size={19} color="var(--violet)" />
                </div>
                <div>
                  <b className="text-[14.5px] text-ink">{c.name}</b>
                  <div className="text-[11.5px] text-muted">{c.subtitle}</div>
                </div>
              </div>
              <div className="font-display font-bold text-ink text-[15px]">{c.amount}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
