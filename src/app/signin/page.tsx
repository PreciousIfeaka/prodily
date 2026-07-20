"use client";

import { useState, startTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signInAction } from "@/app/actions/auth";
import { useToast } from "@/components/Toast";
import { LogIn, Mail, Lock, ShieldAlert, Sparkles } from "lucide-react";
import { getRoleHome } from "@/lib/roles";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { celebrate, toast } = useToast();

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
          celebrate(`Welcome back, ${res.name}!`);
          router.push(getRoleHome(res.role));
          router.refresh();
        } else {
          setError(res.error || "Invalid email or password.");
          toast(res.error || "Failed to sign in.");
          setLoading(false);
        }
      } catch (err) {
        setError("An unexpected error occurred. Please try again.");
        toast("Connection error.");
        setLoading(false);
      }
    });
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative z-10">
      <div className="max-w-md w-full space-y-8 bg-white/80 backdrop-blur-xl border border-[var(--line)] rounded-[32px] p-8 sm:p-10 shadow-[var(--sh)] relative overflow-hidden">
        {/* Glow effect inside card */}
        <div className="absolute w-[200px] h-[200px] rounded-full bg-[var(--violet-tint)] -top-[100px] -right-[100px] opacity-60 pointer-events-none" />
        
        <div className="text-center relative z-10">
          <div className="flex justify-center mb-5">
            <div
              className="w-14 h-14 rounded-[20px] grid place-items-center shadow-[var(--sh-indigo)]"
              style={{ background: "linear-gradient(140deg, var(--indigo), var(--violet))" }}
            >
              <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2l2.6 6.1L21 8.6l-4.7 4.3L17.6 20 12 16.6 6.4 20l1.3-7.1L3 8.6l6.4-.5z" />
              </svg>
            </div>
          </div>
          <h2 className="font-display font-extrabold text-[32px] text-[var(--ink)] tracking-tight leading-none">
            Welcome back
          </h2>
          <p className="mt-2 text-sm text-[var(--muted)] font-medium">
            Sign in to access your Prodily dashboard
          </p>
        </div>

        {error && (
          <div className="bg-[var(--rose-tint)] border border-rose-300 text-rose-800 px-4 py-3 rounded-2xl flex items-start gap-3 animate-fade-in">
            <ShieldAlert className="w-5 h-5 mt-0.5 text-rose-600 flex-shrink-0" />
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        <form className="mt-8 space-y-5 relative z-10" onSubmit={handleSubmit}>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[var(--ink)] uppercase tracking-wider pl-1" htmlFor="email">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--faint)]">
                <Mail className="w-5 h-5" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full bg-white/70 border border-[var(--line)] rounded-2xl pl-11 pr-4 py-3.5 outline-none focus:border-[var(--indigo)] focus:bg-white transition-all font-body text-[14px] text-[var(--ink)] font-medium shadow-[var(--sh-sm)]"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[var(--ink)] uppercase tracking-wider pl-1" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--faint)]">
                <Lock className="w-5 h-5" />
              </div>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="w-full bg-white/70 border border-[var(--line)] rounded-2xl pl-11 pr-4 py-3.5 outline-none focus:border-[var(--indigo)] focus:bg-white transition-all font-body text-[14px] text-[var(--ink)] font-medium shadow-[var(--sh-sm)]"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[var(--indigo)] hover:bg-[var(--indigo-600)] disabled:opacity-50 text-white font-bold py-3.5 px-4 rounded-2xl shadow-[var(--sh-indigo)] hover:translate-y-[-1px] transition-all flex items-center justify-center gap-2 cursor-pointer font-body text-sm"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Sign In
                </>
              )}
            </button>
          </div>
        </form>

        <div className="text-center relative z-10 text-xs font-medium text-[var(--muted)]">
          Need to onboard your business?{" "}
          <Link href="/signup" className="text-[var(--indigo)] font-bold hover:underline">
            Register Organization
          </Link>
        </div>
      </div>
    </div>
  );
}
