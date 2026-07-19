"use client";

import Link from "next/link";
import { session } from "@/lib/data";

export default function TopNav() {
  return (
    <div className="flex items-center justify-between gap-5 flex-wrap mb-7">
      <Link href={session.role === "admin" ? "/admin" : "/employee"} className="flex items-center gap-3">
        <div
          className="w-11 h-11 rounded-[14px] grid place-items-center shadow-[var(--sh-indigo)]"
          style={{ background: "linear-gradient(140deg, var(--indigo), var(--violet))" }}
        >
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2l2.6 6.1L21 8.6l-4.7 4.3L17.6 20 12 16.6 6.4 20l1.3-7.1L3 8.6l6.4-.5z" />
          </svg>
        </div>
        <div>
          <div className="font-display font-extrabold text-[22px] leading-none tracking-tight text-ink">
            Prodily
          </div>
          <div className="text-[12.5px] text-muted font-medium">Reward &amp; Recognition</div>
        </div>
      </Link>

      <div className="hidden sm:flex items-center gap-1.5 text-[12.5px] text-muted font-medium">
        <span
          className="w-[7px] h-[7px] rounded-full bg-mint"
          style={{ boxShadow: "0 0 0 4px var(--mint-tint)" }}
        />
        Live app
      </div>
    </div>
  );
}
