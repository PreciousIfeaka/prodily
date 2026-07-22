"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { resetPasswordAction } from "@/app/actions/auth";
import { useToast } from "@/components/Toast";
import { Lock, ArrowLeft, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { Button, Input, Field, Logo } from "@/components/ui";

export default function ResetPasswordPage() {
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tokenParam = params.get("token") || "";
      setToken(tokenParam);
      if (!tokenParam) {
        setError("Invalid reset link. No recovery token found.");
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError("Cannot reset password without a valid token.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await resetPasswordAction(token, password);
      if (res.success) {
        setSuccess(true);
        toast("Password updated successfully!");
      } else {
        setError(res.error || "Failed to reset password. The token might have expired.");
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white flex flex-col justify-center py-12 px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-20 z-0 pointer-events-none" />
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[560px] w-[900px] -translate-x-1/2 rounded-full bg-primary/10 blur-[140px] z-0" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center space-y-4">
        <div className="flex justify-center">
          <Logo size={42} withWordmark />
        </div>
        <h2 className="text-3xl font-bold tracking-tight text-white mt-6">
          Set new password
        </h2>
        <p className="text-sm text-muted-foreground">
          Enter your new password below.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-[#0e0e11]/80 backdrop-blur-md border border-white/5 py-8 px-6 shadow-xl rounded-2xl sm:px-10">
          {success ? (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <CheckCircle2 className="w-12 h-12 text-[var(--brand-bright)]" />
              </div>
              <p className="t-body text-white font-medium">Password Reset Successful</p>
              <p className="t-caption text-[var(--muted)] leading-relaxed">
                Your credentials have been securely updated. You can now proceed to log in with your new password.
              </p>
              <div className="pt-4 w-full">
                <Link href="/signin" className="w-full">
                  <Button className="w-full">Go to Sign In</Button>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-3 bg-destructive/15 border border-destructive/20 text-destructive text-xs rounded-lg">
                  {error}
                </div>
              )}

              <Field label="New Password" required>
                {({ id }) => (
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[var(--faint)] pointer-events-none" />
                    <Input
                      id={id}
                      type={showPw ? "text" : "password"}
                      required
                      placeholder="••••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-11 pr-11"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--faint)] hover:text-[var(--text)] transition-colors"
                    >
                      {showPw ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                    </button>
                  </div>
                )}
              </Field>

              <Field label="Confirm New Password" required>
                {({ id }) => (
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[var(--faint)] pointer-events-none" />
                    <Input
                      id={id}
                      type={showConfirmPw ? "text" : "password"}
                      required
                      placeholder="••••••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-11 pr-11"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPw((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--faint)] hover:text-[var(--text)] transition-colors"
                    >
                      {showConfirmPw ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                    </button>
                  </div>
                )}
              </Field>

              <Button type="submit" loading={loading} disabled={!token} className="w-full">
                Reset Password
              </Button>

              <div className="text-center mt-4">
                <Link
                  href="/signin"
                  className="inline-flex items-center gap-2 t-small font-medium text-[var(--brand-bright)] hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> Back to Sign In
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
