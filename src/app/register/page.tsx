"use client";

import { useState, useEffect, startTransition, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { registerAction } from "@/app/actions/auth";
import { useToast } from "@/components/Toast";
import { UserCheck, Mail, Lock, User, ShieldAlert, BadgeInfo, CheckCircle } from "lucide-react";
import { getRoleHome } from "@/lib/roles";

function decodeToken(token: string) {
  try {
    const parts = token.split(".");
    if (parts.length === 3) {
      const base64Url = parts[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        window
          .atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      return JSON.parse(jsonPayload);
    } else if (parts.length === 2) {
      const base64Url = parts[0];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
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
    const [role, setRole] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [invalidToken, setInvalidToken] = useState(false);
    const router = useRouter();
    const { celebrate, toast } = useToast();

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

      // Check expiration
      if (decoded.exp && Date.now() >= decoded.exp * 1000) {
        setInvalidToken(true);
        setError("This invitation token has expired.");
        return;
      }

      if (decoded.email) {
        setEmail(decoded.email);
      }
      if (decoded.role) {
        setRole(decoded.role);
      }
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
            toast(res.error || "Registration failed.");
            setLoading(false);
          }
        } catch (err) {
          setError("An unexpected error occurred. Please try again.");
          toast("Connection error.");
          setLoading(false);
        }
      });
    };

    if (invalidToken) {
      return (
        <div className="max-w-md w-full space-y-6 bg-white/80 backdrop-blur-xl border border-[var(--line)] rounded-[32px] p-8 sm:p-10 shadow-[var(--sh)] relative overflow-hidden">
          <div className="text-center">
            <div className="flex justify-center mb-5">
              <div className="w-14 h-14 rounded-[20px] bg-[var(--rose-tint)] grid place-items-center">
                <ShieldAlert className="w-8 h-8 text-[var(--rose)]" />
              </div>
            </div>
            <h2 className="font-display font-extrabold text-2xl text-[var(--ink)] tracking-tight">
              Invalid Invitation
            </h2>
            <p className="mt-3 text-sm text-[var(--muted)] font-medium">
              {error || "The invitation link you clicked is invalid or has expired. Please request a new invite from your manager."}
            </p>
            <div className="mt-8">
              <Link
                href="/signin"
                className="inline-flex items-center gap-2 bg-[var(--surface-2)] border border-[var(--line)] text-[var(--text)] hover:bg-indigo-50 font-bold px-6 py-3 rounded-xl transition-all text-sm cursor-pointer"
              >
                Go to Sign In
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return (
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
            Join your Team
          </h2>
          <p className="mt-2 text-sm text-[var(--muted)] font-medium">
            Create your account to start earning rewards
          </p>
        </div>

        {role && (
          <div className="bg-[var(--indigo-tint)] border border-indigo-200 text-[var(--indigo-700)] px-4 py-3 rounded-2xl flex items-center gap-3 animate-fade-in relative z-10 text-xs font-bold">
            <BadgeInfo className="w-5 h-5 text-[var(--indigo)] flex-shrink-0" />
            <span>
              Role invitation: <span className="underline">{role.replace("_", " ")}</span>
            </span>
          </div>
        )}

        {error && (
          <div className="bg-[var(--rose-tint)] border border-rose-300 text-rose-800 px-4 py-3 rounded-2xl flex items-start gap-3 animate-fade-in relative z-10">
            <ShieldAlert className="w-5 h-5 mt-0.5 text-rose-600 flex-shrink-0" />
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        <form className="mt-6 space-y-4 relative z-10" onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[var(--ink)] uppercase tracking-wider pl-1" htmlFor="firstName">
                First Name
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                required
                className="w-full bg-white/70 border border-[var(--line)] rounded-xl px-3.5 py-2.5 outline-none focus:border-[var(--indigo)] focus:bg-white transition-all font-body text-sm text-[var(--ink)] font-medium shadow-[var(--sh-sm)]"
                placeholder="Jane"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[var(--ink)] uppercase tracking-wider pl-1" htmlFor="lastName">
                Last Name
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                required
                className="w-full bg-white/70 border border-[var(--line)] rounded-xl px-3.5 py-2.5 outline-none focus:border-[var(--indigo)] focus:bg-white transition-all font-body text-sm text-[var(--ink)] font-medium shadow-[var(--sh-sm)]"
                placeholder="Doe"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
          </div>

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
                disabled
                className="w-full bg-gray-100 border border-[var(--line)] rounded-xl pl-11 pr-4 py-3 outline-none font-body text-[14px] text-[var(--muted)] font-medium shadow-[var(--sh-sm)] cursor-not-allowed"
                placeholder="your-email@company.com"
                value={email}
              />
            </div>
            <span className="text-[11px] text-[var(--faint)] pl-1 block">
              Email is locked to the invitation recipient.
            </span>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[var(--ink)] uppercase tracking-wider pl-1" htmlFor="password">
              Secure Password
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
                minLength={8}
                className="w-full bg-white/70 border border-[var(--line)] rounded-xl pl-11 pr-4 py-3 outline-none focus:border-[var(--indigo)] focus:bg-white transition-all font-body text-[14px] text-[var(--ink)] font-medium shadow-[var(--sh-sm)]"
                placeholder="At least 8 characters"
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
                  <UserCheck className="w-5 h-5" />
                  Register Account
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    );
  }

  export default function RegisterPage() {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative z-10">
        <Suspense fallback={
          <div className="flex items-center gap-3 bg-white/80 p-8 rounded-[32px] border border-[var(--line)] shadow-[var(--sh)]">
            <span className="w-6 h-6 border-2 border-[var(--indigo)]/30 border-t-[var(--indigo)] rounded-full animate-spin" />
            <span className="font-semibold text-sm text-[var(--ink)]">Loading invitation details...</span>
          </div>
        }>
          <RegisterForm />
        </Suspense>
      </div>
    );
  }
