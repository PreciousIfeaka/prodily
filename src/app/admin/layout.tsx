"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Wallet, ListChecks, Workflow, CheckCircle2, ShieldAlert, Menu, X, Search, Bell } from "lucide-react";
import RoleGuard from "@/components/RoleGuard";
import { AdminProvider, useAdmin } from "@/components/AdminContext";

const nav = [
  { href: "/admin", label: "Dashboard", icon: LayoutGrid },
  { href: "/admin/budget", label: "Budget allocation", icon: Wallet },
  { href: "/admin/rules", label: "Reward rules", icon: ListChecks },
  // { href: "/admin/pipeline", label: "Reward pipeline", icon: Workflow },
  { href: "/admin/approvals", label: "Approvals", icon: CheckCircle2 },
  { href: "/admin/fraud", label: "Fraud review", icon: ShieldAlert },
];

const titles: Record<string, [string, string]> = {
  "/admin": ["Reward analytics", "Overview · This quarter"],
  "/admin/budget": ["Budget allocation", "Org → Department → Team"],
  "/admin/rules": ["Configurable reward rules", "Automated evaluation"],
  // "/admin/pipeline": ["Reward pipeline", "Earning → evaluation → integrity → approval → redemption"],
  "/admin/approvals": ["Approval queue", "Multi-level workflow"],
  "/admin/fraud": ["Fraud & integrity review", "Suspicious activity"],
};

function BrandMark({ small }: { small?: boolean }) {
  return (
    <div
      className={`${small ? "w-9 h-9 rounded-[11px]" : "w-[38px] h-[38px] rounded-[12px]"} grid place-items-center flex-shrink-0`}
      style={{ background: "linear-gradient(140deg, var(--indigo), var(--violet))" }}
    >
      <svg viewBox="0 0 24 24" width={small ? 18 : 20} height={small ? 18 : 20} fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2l2.6 6.1L21 8.6l-4.7 4.3L17.6 20 12 16.6 6.4 20l1.3-7.1L3 8.6l6.4-.5z" />
      </svg>
    </div>
  );
}

function NavLinks({
  pathname,
  badges,
  onNavigate,
}: {
  pathname: string;
  badges: Record<string, number>;
  onNavigate?: () => void;
}) {
  return (
    <>
      {nav.map((n) => {
        const active = pathname === n.href;
        const Icon = n.icon;
        const badge = badges[n.href];
        return (
          <Link
            key={n.href}
            href={n.href}
            onClick={onNavigate}
            className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl font-semibold text-sm transition-colors ${
              active ? "bg-white/12 text-white" : "text-white/60 hover:bg-white/6 hover:text-white/90"
            }`}
          >
            <Icon size={17} className="flex-shrink-0" />
            <span>{n.label}</span>
            {!!badge && (
              <span className="ml-auto flex-shrink-0 text-[10px] font-extrabold rounded-full px-1.5 py-0.5 bg-gold text-[#4a2c00]">
                {badge}
              </span>
            )}
          </Link>
        );
      })}
    </>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allow="admin">
      <AdminProvider>
        <AdminLayoutInner>{children}</AdminLayoutInner>
      </AdminProvider>
    </RoleGuard>
  );
}

function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "/admin";
  const [title, subtitle] = titles[pathname] || titles["/admin"];
  const { pendingApprovalsCount, pendingFraudCount } = useAdmin();
  const [menuOpen, setMenuOpen] = useState(false);

  const badges: Record<string, number> = {
    "/admin/approvals": pendingApprovalsCount,
    "/admin/fraud": pendingFraudCount,
  };

  // Close the drawer whenever navigation happens, and don't let the page
  // scroll behind it while it's open.
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <div className="flex gap-5 items-start flex-col md:flex-row">
      {/* Mobile top bar: brand + hamburger trigger, replaces the sidebar below md */}
      <div
        className="w-full flex md:hidden items-center justify-between rounded-2xl px-4 py-3 shadow-[var(--sh-sm)]"
        style={{ background: "linear-gradient(160deg, var(--ink), #120c30)" }}
      >
        <div className="flex items-center gap-2.5">
          <BrandMark small />
          <div className="font-display font-extrabold text-base text-white">Prodily</div>
        </div>
        <button
          onClick={() => setMenuOpen(true)}
          aria-label="Open admin menu"
          aria-expanded={menuOpen}
          className="w-9 h-9 grid place-items-center rounded-xl border border-white/15 text-white hover:bg-white/10 transition-colors"
        >
          <Menu size={19} />
        </button>
      </div>

      {/* Mobile drawer */}
      <div
        className={`fixed inset-0 z-40 md:hidden transition-opacity duration-200 ${
          menuOpen ? "opacity-100 pointer-events-auto animate-backdrop-in" : "opacity-0 pointer-events-none"
        }`}
        style={{ background: "rgba(26, 20, 64, 0.45)" }}
        onClick={() => setMenuOpen(false)}
        aria-hidden={!menuOpen}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Admin navigation"
        className={`fixed top-0 left-0 h-full w-[82%] max-w-[300px] z-50 md:hidden shadow-[var(--sh-lg)] flex flex-col transition-transform duration-300 ease-out ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ background: "linear-gradient(160deg, var(--ink), #120c30)" }}
      >
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <BrandMark small />
            <div className="font-display font-extrabold text-base text-white">Prodily</div>
          </div>
          <button
            onClick={() => setMenuOpen(false)}
            aria-label="Close admin menu"
            className="w-8 h-8 grid place-items-center rounded-lg text-white/60 hover:bg-white/10 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex items-center gap-2.5 p-4 border-b border-white/10">
          <div className="w-9 h-9 rounded-xl bg-gold text-[#4a2c00] grid place-items-center font-bold text-xs flex-shrink-0">AC</div>
          <div>
            <div className="text-[13px] font-bold text-white">Acme Corp</div>
            <div className="text-[11px] text-white/55">HR Admin · Org Wallet</div>
          </div>
        </div>

        <nav className="flex flex-col gap-1.5 p-3 overflow-y-auto">
          <NavLinks pathname={pathname} badges={badges} onNavigate={() => setMenuOpen(false)} />
        </nav>

        <div className="mt-auto p-4 pt-3 border-t border-white/10">
          <div className="text-[11px] text-white/55 mb-1.5">Org budget utilisation</div>
          <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div className="h-full rounded-full bg-indigo" style={{ width: "64%" }} />
          </div>
          <div className="text-[11px] text-white/55 mt-1.5">₦6.4M / ₦10M used</div>
        </div>
      </div>

      {/* Desktop sidebar: dark navy card matching the brand mark */}
      <aside
        className="hidden md:flex w-[250px] flex-shrink-0 p-4 flex-col gap-5 md:sticky md:top-6 rounded-[22px] shadow-[var(--sh)]"
        style={{ background: "linear-gradient(160deg, var(--ink), #120c30)" }}
      >
        <div className="flex items-center gap-2.5">
          <BrandMark />
          <div className="font-display font-extrabold text-lg text-white">Prodily</div>
        </div>

        <div className="flex items-center gap-2.5 pb-4 border-b border-white/10">
          <div className="w-9 h-9 rounded-xl bg-gold text-[#4a2c00] grid place-items-center font-bold text-xs">AC</div>
          <div>
            <div className="text-[13px] font-bold text-white">Acme Corp</div>
            <div className="text-[11px] text-white/55">HR Admin · Org Wallet</div>
          </div>
        </div>

        <nav className="flex flex-col gap-1.5">
          <NavLinks pathname={pathname} badges={badges} />
        </nav>

        <div className="mt-auto pt-4 border-t border-white/10">
          <div className="text-[11px] text-white/55 mb-1.5">Org budget utilisation</div>
          <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div className="h-full rounded-full bg-indigo" style={{ width: "64%" }} />
          </div>
          <div className="text-[11px] text-white/55 mt-1.5">₦6.4M / ₦10M used</div>
        </div>
      </aside>

      <div className="flex-1 w-full min-w-0">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div>
            <h2 className="text-2xl">{title}</h2>
            <div className="text-[13px] text-muted mt-0.5">{subtitle}</div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 bg-surface-2 border border-line rounded-xl px-3.5 py-2.5 w-[240px]">
              <Search size={16} className="text-faint flex-shrink-0" />
              <input
                type="text"
                placeholder="Search employees, rewards..."
                className="bg-transparent outline-none text-[13px] text-ink placeholder:text-faint w-full"
              />
            </div>
            <button
              aria-label="Notifications"
              className="relative w-10 h-10 rounded-xl border border-line bg-white grid place-items-center flex-shrink-0"
            >
              <Bell size={17} className="text-ink" />
              <span className="absolute top-2 right-2.5 w-[7px] h-[7px] rounded-full bg-rose" />
            </button>
            <button className="bg-indigo hover:bg-indigo-600 transition-colors text-white font-bold text-[13.5px] rounded-xl px-4 py-2.5 whitespace-nowrap shadow-[var(--sh-indigo)]">
              Fund wallet
            </button>
          </div>
        </div>
        <div className="animate-fade-in">{children}</div>
      </div>
    </div>
  );
}
