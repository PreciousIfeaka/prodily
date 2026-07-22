"use client";

import { useState } from "react";
import Link from "next/link";
import { forgotPasswordAction } from "@/app/actions/auth";
import { useToast } from "@/components/Toast";
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button, Input, Field, Logo } from "@/components/ui";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setError("");
    setLoading(true);

    try {
      const res = await forgotPasswordAction(email);
      if (res.success) {
        setSuccess(true);
        toast("Reset request submitted.");
      } else {
        setError(res.error || "Failed to request password reset.");
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
          Reset password
        </h2>
        <p className="text-sm text-muted-foreground">
          Enter your email and we'll send you a password reset link.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-[#0e0e11]/80 backdrop-blur-md border border-white/5 py-8 px-6 shadow-xl rounded-2xl sm:px-10">
          {success ? (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <CheckCircle2 className="w-12 h-12 text-[var(--brand-bright)]" />
              </div>
              <p className="t-body text-white font-medium">Check your email</p>
              <p className="t-caption text-[var(--muted)] leading-relaxed">
                If the email address is registered on our platform, you will receive an email shortly containing a link to reset your password.
              </p>
              <div className="pt-4">
                <Link
                  href="/signin"
                  className="inline-flex items-center gap-2 t-small font-medium text-[var(--brand-bright)] hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> Back to Sign In
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-3 bg-destructive/15 border border-destructive/20 text-destructive text-xs rounded-lg">
                  {error}
                </div>
              )}

              <Field label="Email address" required>
                {({ id }) => (
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                      <Mail className="h-4.5 w-4.5" />
                    </div>
                    <Input
                      id={id}
                      type="email"
                      required
                      placeholder="you@acme.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                )}
              </Field>

              <Button type="submit" loading={loading} className="w-full">
                Send Reset Link
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
