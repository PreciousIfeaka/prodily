"use client";

import { useState, useEffect, startTransition, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { registerAction } from "@/app/actions/auth";
import { useToast } from "@/components/Toast";
import { UserCheck, Mail, Lock, ShieldAlert, BadgeInfo, Eye, EyeOff } from "lucide-react";
import { getRoleHome } from "@/lib/roles";
import { Button, Input, Field, Logo, Spinner } from "@/components/ui";

function decodeToken(token: string) {
  try {
    const parts = token.split(".");
    if (parts.length === 3) {
      const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        window
          .atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      return JSON.parse(jsonPayload);
    } else if (parts.length === 2) {
      const base64 = parts[0].replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        window
          .atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      const parsed = JSON.parse(jsonPayload);
      if (parsed.expiresAt) {
        parsed.exp = Math.floor(parsed.expiresAt / 1000);
      }
      return parsed;
    }
    return null;
  } catch (e) {
    console.error("Failed to decode token", e);
    return null;
  }
}

function RegisterForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [role, setRole] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [invalidToken, setInvalidToken] = useState(false);
  const router = useRouter();
  const { celebrate } = useToast();

  useEffect(() => {
    if (!token) {
      setInvalidToken(true);
      setError("Invitation token is missing.");
      return;
    }
    const decoded = decodeToken(token);
    if (!decoded) {
      setInvalidToken(true);
      setError("Invitation token is invalid or corrupted.");
      return;
    }
    if (decoded.exp && Date.now() >= decoded.exp * 1000) {
      setInvalidToken(true);
      setError("This invitation token has expired.");
      return;
    }
    if (decoded.email) setEmail(decoded.email);
    if (decoded.role) setRole(decoded.role);
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!token) {
      setError("Token is missing.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    setLoading(true);
    const formData = new FormData();
    formData.append("firstName", firstName);
    formData.append("lastName", lastName);
    formData.append("email", email);
    formData.append("password", password);
    formData.append("token", token);

    startTransition(async () => {
      try {
        const res = await registerAction(null, formData);
        if (res.success) {
          celebrate("Registration completed successfully!");
          router.push(getRoleHome(res.role));
          router.refresh();
        } else {
          setError(res.error || "Failed to complete registration.");
          setLoading(false);
        }
      } catch {
        setError("An unexpected error occurred. Please try again.");
        setLoading(false);
      }
    });
  };

  if (invalidToken) {
    return (
      <div className="max-w-md w-full bg-[var(--surface)]/90 backdrop-blur-xl border border-[var(--line-2)] rounded-[var(--r-xl)] p-8 sm:p-10 shadow-[var(--sh-lg)]">
        <div className="text-center">
          <div className="flex justify-center mb-5">
            <div className="w-14 h-14 rounded-[var(--r-lg)] bg-[var(--rose-tint)] grid place-items-center">
              <ShieldAlert className="w-8 h-8 text-[var(--rose)]" />
            </div>
          </div>
          <h2 className="t-h2 text-[var(--text)]">Invalid Invitation</h2>
          <p className="mt-3 t-small text-[var(--muted)]">
            {error ||
              "The invitation link you clicked is invalid or has expired."}
          </p>
          <div className="mt-4 rounded-[var(--r)] bg-[var(--surface-2)] border border-[var(--line)] p-4 t-caption text-[var(--muted)] text-left">
            <p className="font-medium text-[var(--text)] mb-1">Need a new invite?</p>
            Ask your team lead or an admin to re-send your invitation link from their
            dashboard. Each link is single-use and time-limited.
          </div>
          <div className="mt-6">
            <Link href="/signin">
              <Button variant="secondary" fullWidth>
                Go to Sign In
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md w-full bg-[var(--surface)]/90 backdrop-blur-xl border border-[var(--line-2)] rounded-[var(--r-xl)] p-8 sm:p-10 shadow-[var(--sh-lg)] relative overflow-hidden">
      <div className="absolute w-[220px] h-[220px] rounded-full bg-[var(--brand-tint)] -top-[110px] -right-[90px] blur-2xl pointer-events-none" />

      <div className="text-center relative z-10">
        <div className="flex justify-center mb-5">
          <Logo size={56} />
        </div>
        <h2 className="t-h1 text-[var(--text)]">Join your Team</h2>
        <p className="mt-2 t-small text-[var(--muted)]">
          Create your account to start earning rewards
        </p>
      </div>

      {role && (
        <div className="mt-6 bg-[var(--brand-tint)] border border-[var(--brand)]/25 text-[var(--brand-bright)] px-4 py-3 rounded-[var(--r)] flex items-center gap-3 animate-fade-in relative z-10 t-caption font-medium">
          <BadgeInfo className="w-5 h-5 flex-shrink-0" />
          <span>
            Role invitation: <span className="underline capitalize">{role.replace(/_/g, " ")}</span>
          </span>
        </div>
      )}

      {error && (
        <div className="mt-4 bg-[var(--rose-tint)] border border-[var(--rose)]/30 text-[var(--rose)] px-4 py-3 rounded-[var(--r)] flex items-start gap-3 animate-fade-in relative z-10">
          <ShieldAlert className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <span className="t-small font-medium">{error}</span>
        </div>
      )}

      <form className="mt-6 space-y-4 relative z-10" onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-4">
          <Field label="First name" required>
            {({ id }) => (
              <Input id={id} required placeholder="Jane" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            )}
          </Field>
          <Field label="Last name" required>
            {({ id }) => (
              <Input id={id} required placeholder="Doe" value={lastName} onChange={(e) => setLastName(e.target.value)} />
            )}
          </Field>
        </div>

        <Field label="Email address" hint="Email is locked to the invitation recipient.">
          {({ id }) => (
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[var(--faint)] pointer-events-none" />
              <Input id={id} type="email" required disabled className="pl-11" value={email} />
            </div>
          )}
        </Field>

        <Field label="Secure password" required hint="At least 8 characters.">
          {({ id }) => (
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[var(--faint)] pointer-events-none" />
              <Input
                id={id}
                type={showPw ? "text" : "password"}
                required
                minLength={8}
                className="pl-11 pr-11"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                aria-label={showPw ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--faint)] hover:text-[var(--text)] transition-colors"
              >
                {showPw ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
              </button>
            </div>
          )}
        </Field>

        <Button type="submit" loading={loading} fullWidth size="lg" icon={<UserCheck className="w-[18px] h-[18px]" />} className="mt-2">
          Register Account
        </Button>
      </form>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center py-12 px-4 relative z-10">
      <Suspense
        fallback={
          <div className="flex items-center gap-3 bg-[var(--surface)] p-8 rounded-[var(--r-lg)] border border-[var(--line)] shadow-[var(--sh)]">
            <Spinner size={20} />
            <span className="font-medium text-sm text-[var(--text)]">Loading invitation details…</span>
          </div>
        }
      >
        <RegisterForm />
      </Suspense>
    </div>
  );
}
