"use client";

import { useEffect, useState, startTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { getMeAction, signOutAction } from "@/app/actions/auth";
import {
  LayoutDashboard,
  Building,
  CheckSquare,
  Trophy,
  Activity,
  Coins,
  History,
  TrendingUp,
  ShieldAlert,
  Settings,
  LogOut,
  Menu,
  X
} from "lucide-react";
import { useToast } from "@/components/Toast";
import TopNav from "@/components/TopNav";

const publicPaths = ["/signin", "/signup", "/register"];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isPublicPath = publicPaths.some((p) => pathname.startsWith(p));

  useEffect(() => {
    if (isPublicPath) {
      setLoading(false);
      return;
    }

    async function fetchUser() {
      try {
        const profile = await getMeAction();
        if (profile) {
          setUser(profile);
        } else {
          router.push("/signin");
        }
      } catch (err) {
        console.error("Failed to load user in shell", err);
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, [pathname, isPublicPath, router]);

  const handleLogout = () => {
    startTransition(async () => {
      await signOutAction();
      toast("Successfully signed out.");
      setUser(null);
      router.push("/signin");
      router.refresh();
    });
  };

  if (isPublicPath) {
    return (
      <div className="relative z-10 max-w-[1280px] mx-auto px-4 sm:px-6 pt-6 pb-16">
        <TopNav />
        {children}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex items-center gap-3 bg-white/80 p-8 rounded-[32px] border border-[var(--line)] shadow-[var(--sh)]">
          <span className="w-6 h-6 border-2 border-[var(--indigo)]/30 border-t-[var(--indigo)] rounded-full animate-spin" />
          <span className="font-semibold text-sm text-[var(--ink)]">Loading workspace...</span>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const role = user.userRole; // "ADMIN" | "TEAM_LEAD" | "TEAM_MEMBER"

  const navItems: { [key: string]: { label: string; href: string; icon: any }[] } = {
    ADMIN: [
      { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
      { label: "Budget Utilization", href: "/admin/budget", icon: TrendingUp },
      { label: "Fraud Alerts", href: "/admin/fraud-alerts", icon: ShieldAlert },
      { label: "Workflow rules", href: "/admin/approval-workflows", icon: Settings },
      { label: "Org Transactions", href: "/admin/transactions", icon: History },
    ],
    TEAM_LEAD: [
      { label: "Dashboard", href: "/team-lead", icon: LayoutDashboard },
      { label: "Task Reviews", href: "/team-lead#task-reviews", icon: CheckSquare },
      { label: "Time Entries", href: "/team-lead#time-entries", icon: Activity },
      { label: "Active Challenges", href: "/employee/challenges", icon: Trophy },
      { label: "Wallet & Funding", href: "/employee/wallet", icon: Coins },
    ],
    TEAM_MEMBER: [
      { label: "Dashboard", href: "/employee", icon: LayoutDashboard },
      { label: "My Tasks", href: "/employee/tasks", icon: CheckSquare },
      { label: "Active Challenges", href: "/employee/challenges", icon: Trophy },
      { label: "Weekly Leaderboard", href: "/employee/leaderboard", icon: TrendingUp },
      { label: "Time Tracking", href: "/employee/time-tracking", icon: Activity },
      { label: "My Wallet & Payouts", href: "/employee/wallet", icon: Coins },
      { label: "My Transactions", href: "/employee/transactions", icon: History },
    ],
  };

  const items = navItems[role] || [];

  return (
    <div className="flex min-h-screen bg-[var(--surface-2)] text-[var(--ink)] font-body">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-72 bg-white border-r border-[var(--line)] p-6 fixed h-full z-30">
        <div className="flex items-center gap-3 mb-8">
          <div
            className="w-10 h-10 rounded-[12px] grid place-items-center shadow-[var(--sh-indigo)] animate-fade-in"
            style={{ background: "linear-gradient(140deg, var(--indigo), var(--violet))" }}
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2l2.6 6.1L21 8.6l-4.7 4.3L17.6 20 12 16.6 6.4 20l1.3-7.1L3 8.6l6.4-.5z" />
            </svg>
          </div>
          <div>
            <div className="font-display font-extrabold text-[20px] leading-none tracking-tight text-[var(--ink)]">
              Prodily
            </div>
            <div className="text-[11px] text-[var(--muted)] font-bold uppercase tracking-wider mt-1.5">
              {role.replace("_", " ")}
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-1.5">
          {items.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href.split("#")[0];
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
                  active
                    ? "bg-[var(--indigo-tint)] text-[var(--indigo)]"
                    : "text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--ink)]"
                }`}
              >
                <Icon className={`w-5 h-5 ${active ? "text-[var(--indigo)]" : "text-[var(--faint)]"}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User Card */}
        <div className="border-t border-[var(--line)] pt-4 mt-auto">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[var(--rose-tint)] hover:bg-rose-100 text-[var(--rose)] rounded-2xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border border-rose-200/50"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Layout Area */}
      <div className="flex-1 lg:pl-72 flex flex-col min-h-screen">
        {/* Mobile Header */}
        <header className="lg:hidden flex items-center justify-between px-6 py-4 bg-white border-b border-[var(--line)] sticky top-0 z-40">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg grid place-items-center shadow-[var(--sh-indigo)]"
              style={{ background: "linear-gradient(140deg, var(--indigo), var(--violet))" }}
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2l2.6 6.1L21 8.6l-4.7 4.3L17.6 20 12 16.6 6.4 20l1.3-7.1L3 8.6l6.4-.5z" />
              </svg>
            </div>
            <div className="font-display font-extrabold text-lg text-[var(--ink)]">
              Prodily
            </div>
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-lg border border-[var(--line)] hover:bg-gray-50 text-[var(--ink)]"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </header>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-[var(--line)] px-6 py-4 space-y-1.5 fixed w-full z-30 shadow-md">
            {items.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href.split("#")[0];
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    active
                      ? "bg-[var(--indigo-tint)] text-[var(--indigo)]"
                      : "text-[var(--muted)] hover:bg-[var(--surface-2)]"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
            <div className="border-t border-[var(--line)] pt-3 mt-3 flex items-center justify-end">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--rose-tint)] text-[var(--rose)] rounded-xl text-[11px] font-bold uppercase tracking-wider"
              >
                <LogOut className="w-3.5 h-3.5" />
                Logout
              </button>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 p-6 lg:p-10 max-w-5xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
