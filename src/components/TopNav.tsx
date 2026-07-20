"use client";

import Link from "next/link";
import { Logo } from "@/components/ui";

export default function TopNav() {
  return (
    <div className="flex items-center justify-between gap-5 flex-wrap mb-7">
      <Link href="/" className="flex items-center gap-3">
        <Logo size={44} withWordmark subtitle="Reward & Recognition" />
      </Link>

      <div className="hidden sm:flex items-center gap-2 t-small text-[var(--muted)] font-medium">
        <span
          className="w-[7px] h-[7px] rounded-full bg-[var(--brand-bright)]"
          style={{ boxShadow: "0 0 0 4px var(--brand-tint)" }}
        />
        Live app
      </div>
    </div>
  );
}
