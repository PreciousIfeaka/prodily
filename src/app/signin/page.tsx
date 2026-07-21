"use client";

import { useState, startTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signInAction, getMeAction } from "@/app/actions/auth";
import { useToast } from "@/components/Toast";
import { LogIn, Mail, Lock, ShieldAlert, Eye, EyeOff } from "lucide-react";
import { getRoleHome } from "@/lib/roles";
import { Button, Input, Field, Logo } from "@/components/ui";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const router = useRouter();
  const { celebrate } = useToast();

  useEffect(() => {
    getMeAction().then((me) => {
      if (me && me.userRole) {
        router.push(getRoleHome(me.userRole));
      } else {
        setCheckingAuth(false);
      }
    }).catch(() => {
      setCheckingAuth(false);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);

    startTransition(async () => {
      try {
        const res = await signInAction(null, formData);
        if (res.success) {
          if (res.needsOtpVerification) {
            celebrate("Account not verified yet. Redirecting to verify OTP...");
            router.push(`/signup?step=2&email=${encodeURIComponent(res.email)}`);
          } else {
            celebrate(`Welcome back, ${res.name}!`);
            router.push(getRoleHome(res.role));
            router.refresh();
          }
        } else {
          setError(res.error || "Invalid email or password.");
          setLoading(false);
        }
      } catch {
        setError("An unexpected error occurred. Please try again.");
        setLoading(false);
      }
    });
  };

  if (checkingAuth) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center relative z-10">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--brand-bright)]" />
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center py-12 px-4 relative z-10">
      <div className="max-w-md w-full bg-[var(--surface)]/90 backdrop-blur-xl border border-[var(--line-2)] rounded-[var(--r-xl)] p-8 sm:p-10 shadow-[var(--sh-lg)] relative overflow-hidden">
        <div className="absolute w-[220px] h-[220px] rounded-full bg-[var(--brand-tint)] -top-[110px] -right-[90px] blur-2xl pointer-events-none" />

        <div className="text-center relative z-10">
          <div className="flex justify-center mb-5">
            <Logo size={56} />
          </div>
          <h2 className="t-h1 text-[var(--text)]">Welcome back</h2>
          <p className="mt-2 t-small text-[var(--muted)]">
            Sign in to access your Prodily dashboard
          </p>
        </div>

        {error && (
          <div className="mt-6 bg-[var(--rose-tint)] border border-[var(--rose)]/30 text-[var(--rose)] px-4 py-3 rounded-[var(--r)] flex items-start gap-3 animate-fade-in">
            <ShieldAlert className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <span className="t-small font-medium">{error}</span>
          </div>
        )}

        <form className="mt-7 space-y-5 relative z-10" onSubmit={handleSubmit}>
          <Field label="Email address">
            {({ id }) => (
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[var(--faint)] pointer-events-none" />
                <Input
                  id={id}
                  name="email"
                  type="email"
                  required
                  className="pl-11"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            )}
          </Field>

          <Field label="Password">
            {({ id }) => (
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[var(--faint)] pointer-events-none" />
                <Input
                  id={id}
                  name="password"
                  type={showPw ? "text" : "password"}
                  required
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

          <Button type="submit" loading={loading} fullWidth size="lg" icon={<LogIn className="w-[18px] h-[18px]" />}>
            Sign In
          </Button>
        </form>

        <div className="text-center relative z-10 mt-6 t-caption font-medium text-[var(--muted)]">
          Need to onboard your business?{" "}
          <Link href="/signup" className="text-[var(--brand-bright)] font-medium hover:underline">
            Register Organization
          </Link>
        </div>
      </div>
    </div>
  );
}
