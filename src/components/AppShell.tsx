"use client";

import { useEffect, useState, startTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { getMeAction, signOutAction, changePasswordAction } from "@/app/actions/auth";
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
  X,
  Rss,
  Gift,
  ScrollText,
  Users,
  BadgeCheck,
  Sun,
  Moon,
  Key,
  Lock,
} from "lucide-react";
import { useToast } from "@/components/Toast";
import TopNav from "@/components/TopNav";
import { Logo, Avatar, Spinner, IconButton, Modal, Button, Input, Field } from "@/components/ui";

const publicPaths = ["/signin", "/signup", "/register", "/forgot-password", "/reset-password"];

type NavItem = { label: string; href: string; icon: any; exact?: boolean };
type NavSection = { title?: string; items: NavItem[] };

const navSections: Record<string, NavSection[]> = {
  ADMIN: [
    { items: [{ label: "Dashboard", href: "/admin", icon: LayoutDashboard, exact: true }] },
    {
      title: "Approvals",
      items: [
        { label: "Reward Approvals", href: "/admin/approvals", icon: BadgeCheck },
        { label: "Workflow Rules", href: "/admin/approval-workflows", icon: Settings },
      ],
    },
    {
      title: "Risk & Rules",
      items: [
        { label: "Fraud Alerts", href: "/admin/fraud-alerts", icon: ShieldAlert },
        { label: "Fraud Cases", href: "/admin/fraud", icon: ShieldAlert },
        { label: "Rules", href: "/admin/rules", icon: ScrollText },
      ],
    },
    {
      title: "Organization",
      items: [
        { label: "Budget", href: "/admin/budget", icon: TrendingUp },
        { label: "Transactions", href: "/admin/transactions", icon: History },
      ],
    },
  ],
  TEAM_LEAD: [
    { items: [{ label: "Dashboard", href: "/team-lead", icon: LayoutDashboard, exact: true }] },
    {
      title: "Team",
      items: [
        { label: "Active Challenges", href: "/employee/challenges", icon: Trophy },
        { label: "Wallet & Funding", href: "/employee/wallet", icon: Coins },
      ],
    },
  ],
  TEAM_MEMBER: [
    { items: [{ label: "Dashboard", href: "/employee", icon: LayoutDashboard, exact: true }] },
    {
      title: "Work",
      items: [
        { label: "My Tasks", href: "/employee/tasks", icon: CheckSquare },
        { label: "Time Tracking", href: "/employee/time-tracking", icon: Activity },
      ],
    },
    {
      title: "Rewards",
      items: [
        { label: "Challenges", href: "/employee/challenges", icon: Trophy },
        { label: "Leaderboard", href: "/employee/leaderboard", icon: TrendingUp },
        { label: "Rewards", href: "/employee/rewards", icon: Gift },
      ],
    },
    {
      title: "Money",
      items: [
        { label: "Wallet & Payouts", href: "/employee/wallet", icon: Coins },
        { label: "Transactions", href: "/employee/transactions", icon: History },
      ],
    },
    {
      title: "Account",
      items: [{ label: "Profile", href: "/employee/profile", icon: Building }],
    },
  ],
};

function isActive(pathname: string, item: NavItem) {
  const base = item.href.split("#")[0].split("?")[0];
  if (pathname === base) return true;
  if (item.exact) return false;
  return pathname.startsWith(base + "/");
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLight, setIsLight] = useState(false);

  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [changePasswordLoading, setChangePasswordLoading] = useState(false);
  const [changePasswordError, setChangePasswordError] = useState("");

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      setChangePasswordError("New passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      setChangePasswordError("New password must be at least 6 characters long.");
      return;
    }

    setChangePasswordError("");
    setChangePasswordLoading(true);

    try {
      const res = await changePasswordAction(currentPassword, newPassword);
      if (res.success) {
        toast("Password changed successfully.");
        setIsChangePasswordOpen(false);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmNewPassword("");
      } else {
        setChangePasswordError(res.error || "Failed to change password.");
      }
    } catch {
      setChangePasswordError("An unexpected error occurred.");
    } finally {
      setChangePasswordLoading(false);
    }
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "light") {
      document.documentElement.classList.add("light");
      setIsLight(true);
    } else {
      document.documentElement.classList.remove("light");
      setIsLight(false);
    }
  }, []);

  const toggleTheme = () => {
    if (document.documentElement.classList.contains("light")) {
      document.documentElement.classList.remove("light");
      localStorage.setItem("theme", "dark");
      setIsLight(false);
    } else {
      document.documentElement.classList.add("light");
      localStorage.setItem("theme", "light");
      setIsLight(true);
    }
  };

  const isPublicPath = publicPaths.some((p) => pathname.startsWith(p));
  const isMarketing =
    pathname === "/" || pathname.startsWith("/privacy") || pathname.startsWith("/terms");

  useEffect(() => {
    if (isPublicPath || isMarketing) {
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
  }, [pathname, isPublicPath, isMarketing, router]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    startTransition(async () => {
      await signOutAction();
      toast("Successfully signed out.");
      setUser(null);
      router.push("/signin");
      router.refresh();
    });
  };

  if (isMarketing) {
    return (
      <>
        {/* Floating Theme Toggle for non-home marketing pages (privacy, terms, etc.) */}
        {pathname !== "/" && (
          <div className="fixed top-6 right-8 z-50">
            <IconButton onClick={toggleTheme} aria-label="Toggle theme" title="Toggle theme">
              {isLight ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-[var(--gold)]" />}
            </IconButton>
          </div>
        )}
        {children}
      </>
    );
  }

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
      <div className="relative z-10 flex items-center justify-center min-h-screen">
        <div className="flex items-center gap-3 bg-[var(--surface)] px-6 py-5 rounded-[var(--r-lg)] border border-[var(--line)] shadow-[var(--sh)]">
          <Spinner size={20} />
          <span className="font-medium text-sm text-[var(--text)]">Loading workspace…</span>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const role = user.userRole as string;
  const sections = navSections[role] || [];
  const fullName =
    [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email || "Account";
  const roleLabel = role.replace(/_/g, " ").toLowerCase();

  const NavList = ({ dense = false }: { dense?: boolean }) => (
    <>
      {sections.map((section, si) => (
        <div key={si} className={dense ? "space-y-0.5" : "space-y-1"}>
          {section.title && (
            <div className="px-3 pt-4 pb-1 t-micro font-medium uppercase tracking-wider text-[var(--faint)]">
              {section.title}
            </div>
          )}
          {section.items.map((item) => {
            const Icon = item.icon;
            const active = isActive(pathname, item);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`relative flex items-center gap-3 px-3 py-2.5 rounded-[var(--r)] t-small font-medium transition-all ${active
                  ? "bg-[var(--brand-tint)] text-[var(--brand-bright)]"
                  : "text-[var(--muted)] hover:bg-[var(--surface-3)] hover:text-[var(--text)]"
                  }`}
              >
                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full bg-[var(--brand-bright)]" />
                )}
                <Icon className={`w-[18px] h-[18px] ${active ? "text-[var(--brand-bright)]" : "text-[var(--faint)]"}`} />
                {item.label}
              </Link>
            );
          })}
        </div>
      ))}
    </>
  );

  const UserCard = () => (
    <div className="flex items-center gap-3 p-3 rounded-[var(--r)] bg-[var(--surface-2)] border border-[var(--line)]">
      <Avatar name={fullName} size={38} />
      <div className="min-w-0 flex-1">
        <div className="t-small font-medium text-[var(--text)] truncate">{fullName}</div>
        <div className="t-caption text-[var(--muted)] truncate">{user.email}</div>
      </div>
      <IconButton onClick={() => setIsChangePasswordOpen(true)} aria-label="Change password" title="Change password">
        <Key className="w-4 h-4 text-[var(--muted)] hover:text-[var(--text)]" />
      </IconButton>
      <IconButton onClick={handleLogout} aria-label="Sign out" title="Sign out">
        <LogOut className="w-4 h-4" />
      </IconButton>
    </div>
  );

  return (
    <div className="relative z-10 flex min-h-screen text-[var(--text)]">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-72 bg-[var(--surface)] border-r border-[var(--line)] p-4 fixed h-full z-30">
        <div className="px-2 py-3 mb-2">
          <Link href="/">
            <Logo size={40} withWordmark subtitle={roleLabel} />
          </Link>
        </div>
        <nav className="flex-1 overflow-y-auto scrollbar-none -mx-1 px-1">
          <NavList />
        </nav>
        <div className="pt-3 mt-2 border-t border-[var(--line)]">
          <UserCard />
        </div>
      </aside>

      {/* Main Layout Area */}
      <div className="flex-1 lg:pl-72 flex flex-col min-h-screen relative">
        {/* Desktop Theme Toggle (Floating Top Right) */}
        <div className="hidden lg:block absolute top-6 right-8 z-40">
          <IconButton onClick={toggleTheme} aria-label="Toggle theme" title="Toggle theme">
            {isLight ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-[var(--gold)]" />}
          </IconButton>
        </div>

        {/* Mobile Header */}
        <header className="lg:hidden flex items-center justify-between px-5 py-3.5 bg-[var(--surface)]/90 backdrop-blur border-b border-[var(--line)] sticky top-0 z-40">
          <Link href="/">
            <Logo size={34} withWordmark />
          </Link>
          <div className="flex items-center gap-2">
            <IconButton onClick={toggleTheme} aria-label="Toggle theme" title="Toggle theme">
              {isLight ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-[var(--gold)]" />}
            </IconButton>
            <button
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
              className="p-2 rounded-[var(--r-sm)] border border-[var(--line-2)] text-[var(--text)] hover:bg-[var(--surface-3)] transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </header>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div
            className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm animate-backdrop-in"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div
              className="absolute left-0 top-0 h-full w-[80%] max-w-xs bg-[var(--surface)] border-r border-[var(--line)] p-4 flex flex-col animate-slide-in-left"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-2 py-2 mb-2">
                <Link href="/">
                  <Logo size={36} withWordmark subtitle={roleLabel} />
                </Link>
              </div>
              <nav className="flex-1 overflow-y-auto scrollbar-none -mx-1 px-1">
                <NavList dense />
              </nav>
              <div className="pt-3 mt-2 border-t border-[var(--line)]">
                <UserCard />
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 p-5 sm:p-6 lg:p-10 max-w-6xl mx-auto w-full">
          {children}
        </main>
      </div>

      {/* Change Password Modal */}
      <Modal
        open={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
        title="Change Password"
        description="Update your account password."
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsChangePasswordOpen(false)}>Cancel</Button>
            <Button onClick={handleChangePassword} loading={changePasswordLoading}>
              Update password
            </Button>
          </>
        }
      >
        <form onSubmit={handleChangePassword} className="space-y-4">
          {changePasswordError && (
            <div className="p-3 bg-destructive/15 border border-destructive/20 text-destructive text-xs rounded-lg">
              {changePasswordError}
            </div>
          )}

          <Field label="Current Password" required>
            {({ id }) => (
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[var(--faint)] pointer-events-none" />
                <Input
                  id={id}
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="pl-11"
                />
              </div>
            )}
          </Field>

          <Field label="New Password" required>
            {({ id }) => (
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[var(--faint)] pointer-events-none" />
                <Input
                  id={id}
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="pl-11"
                />
              </div>
            )}
          </Field>

          <Field label="Confirm New Password" required>
            {({ id }) => (
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[var(--faint)] pointer-events-none" />
                <Input
                  id={id}
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  className="pl-11"
                />
              </div>
            )}
          </Field>
        </form>
      </Modal>
    </div>
  );
}
