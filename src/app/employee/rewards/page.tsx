"use client";

import { useState } from "react";
import Link from "next/link";
import { Circle } from "lucide-react";
import { rewards } from "@/lib/data";
import Icon from "@/components/ui/Icon";
import { useEmployee } from "@/components/EmployeeContext";

const categories = ["All", "Food", "Transport", "Entertainment", "Learning", "Wellness"];

export default function MarketplacePage() {
  const [active, setActive] = useState("All");
  const { points } = useEmployee();
  const filtered = active === "All" ? rewards : rewards.filter((r) => r.category === active);

  return (
    <div>
      <div className="pt-1.5 pb-3.5">
        <div className="font-display font-extrabold text-[23px] text-ink tracking-tight">Marketplace</div>
        <div className="text-[12.5px] text-muted">Spend your points</div>
      </div>

      <div className="flex items-center justify-between bg-ink text-white rounded-[18px] px-4 py-3.5 mb-1">
        <div className="text-xs opacity-70">Available balance</div>
        <div className="flex items-center gap-1.5 font-display font-bold text-lg">
          <Circle size={16} fill="var(--gold)" color="var(--gold)" />
          {points.toLocaleString()} pts
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto scrollbar-none py-2">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setActive(c)}
            className={`whitespace-nowrap text-[12.5px] font-bold px-3.5 py-2 rounded-full border ${
              active === c ? "bg-indigo text-white border-indigo" : "bg-white text-muted border-line"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3.5">
        {filtered.map((r) => (
          <Link
            key={r.id}
            href={`/employee/rewards/${r.id}`}
            className="bg-white border border-line rounded-[18px] overflow-hidden hover:-translate-y-0.5 hover:shadow-[var(--sh)] transition-transform"
          >
            <div className="h-[88px] grid place-items-center relative" style={{ background: r.gradient }}>
              {r.tag && (
                <span className="absolute top-2.5 right-2.5 text-[10px] font-extrabold bg-white/90 text-ink px-2 py-0.5 rounded-[10px]">
                  {r.tag}
                </span>
              )}
              <Icon name={r.icon} size={38} color="#fff" />
            </div>
            <div className="p-3 pb-3.5">
              <div className="text-[13.5px] font-bold text-ink">{r.name}</div>
              <div className="text-[11px] text-faint mb-2">
                {r.vendor} · {r.priceLabel}
              </div>
              <div className="flex items-center gap-1.5 font-extrabold text-[13px]" style={{ color: "var(--gold-600)" }}>
                <Circle size={15} fill="var(--gold)" color="var(--gold)" />
                {r.cost} pts
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
