"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { rewards } from "@/lib/data";
import Icon from "@/components/ui/Icon";
import { useEmployee } from "@/components/EmployeeContext";
import { PageHeader, Card, Badge } from "@/components/ui";

const categories = ["All", "Food", "Transport", "Entertainment", "Learning", "Wellness"];

export default function MarketplacePage() {
  const [active, setActive] = useState("All");
  const { points } = useEmployee();
  const filtered = active === "All" ? rewards : rewards.filter((r) => r.category === active);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Rewards Marketplace"
        subtitle="Spend your points on perks and vouchers."
      />

      <Card className="p-4 flex items-center justify-between bg-[var(--surface-3)]">
        <div className="t-caption text-[var(--muted)]">Available balance</div>
        <div className="flex items-center gap-1.5 font-display font-medium t-h3 text-[var(--brand-bright)]">
          <Sparkles size={16} />
          {points.toLocaleString()} pts
        </div>
      </Card>

      <div className="flex gap-2 overflow-x-auto scrollbar-none">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setActive(c)}
            className={`whitespace-nowrap t-small font-medium px-3.5 py-2 rounded-[var(--r-pill)] border transition-colors ${
              active === c
                ? "bg-[var(--brand)] text-white border-[var(--brand)]"
                : "bg-[var(--surface-2)] text-[var(--muted)] border-[var(--line)] hover:text-[var(--text)]"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {filtered.map((r) => (
          <Link key={r.id} href={`/employee/rewards/${r.id}`}>
            <Card interactive className="overflow-hidden h-full">
              <div className="h-[88px] grid place-items-center relative" style={{ background: r.gradient }}>
                {r.tag && (
                  <span className="absolute top-2.5 right-2.5 t-micro font-medium bg-black/40 text-white px-2 py-0.5 rounded-[var(--r-sm)]">
                    {r.tag}
                  </span>
                )}
                <Icon name={r.icon} size={38} color="#fff" />
              </div>
              <div className="p-3.5">
                <div className="t-small font-medium text-[var(--text)]">{r.name}</div>
                <div className="t-caption text-[var(--muted)] mb-2">
                  {r.vendor} · {r.priceLabel}
                </div>
                <div className="flex items-center gap-1.5 font-medium t-small text-[var(--brand-bright)]">
                  <Sparkles size={14} />
                  {r.cost} pts
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
