"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Gift, Trophy, Users, CircleUser } from "lucide-react";
import { employee } from "@/lib/data";
import { EmployeeProvider } from "@/components/EmployeeContext";
import RoleGuard from "@/components/RoleGuard";

const tabs = [
  { href: "/employee", label: "Home", icon: Home, match: (p: string) => p === "/employee" },
  { href: "/employee/rewards", label: "Rewards", icon: Gift, match: (p: string) => p.startsWith("/employee/rewards") },
  { href: "/employee/challenges", label: "Challenges", icon: Trophy, match: (p: string) => p === "/employee/challenges" },
  { href: "/employee/feed", label: "Feed", icon: Users, match: (p: string) => p === "/employee/feed" },
  { href: "/employee/profile", label: "Profile", icon: CircleUser, match: (p: string) => p === "/employee/profile" },
];

export default function EmployeeLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "/employee";

  return (
    <RoleGuard allow="employee">
    <EmployeeProvider>
      <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <div className="text-[13px] text-muted font-medium">
          Signed in as <b className="text-ink font-bold">{employee.fullName}</b> · {employee.team} team
        </div>
        <div
          className="w-9 h-9 rounded-full text-white font-bold text-xs grid place-items-center flex-shrink-0"
          style={{ background: "linear-gradient(140deg, var(--indigo), var(--violet))" }}
        >
          {employee.initials}
        </div>
      </div>

      <nav className="flex gap-1.5 bg-white border border-line rounded-2xl p-1.5 mb-6 overflow-x-auto scrollbar-none shadow-[var(--sh-sm)]">
        {tabs.map((t) => {
          const active = t.match(pathname);
          const Icon = t.icon;
          return (
            <Link
              key={t.href}
              href={t.href}
              className={`flex-1 flex items-center justify-center gap-2 whitespace-nowrap font-semibold text-sm px-4 py-2.5 rounded-xl transition-colors ${
                active ? "bg-ink text-white" : "text-muted hover:text-ink"
              }`}
            >
              <Icon size={17} />
              {t.label}
            </Link>
          );
        })}
      </nav>

      <div className="animate-fade-in">{children}</div>
    </div>
    </EmployeeProvider>
    </RoleGuard>
  );
}
