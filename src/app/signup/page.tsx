"use client";

import { useState, startTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signUpAction, verifyOtpAction } from "@/app/actions/auth";
import { useToast } from "@/components/Toast";
import { UserPlus, Building, Briefcase, Users, Mail, Lock, User, ShieldAlert } from "lucide-react";

export default function SignUpPage() {
  const [step, setStep] = useState<"form" | "otp">("form");
  const [otpCode, setOtpCode] = useState("");
  const [registeredEmail, setRegisteredEmail] = useState("");

  const [name, setName] = useState("");
  const [industry, setIndustry] = useState("Technology");
  const [size, setSize] = useState("11-50");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminFirstName, setAdminFirstName] = useState("");
  const [adminLastName, setAdminLastName] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { celebrate, toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (adminPassword.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("name", name);
    formData.append("industry", industry);
    formData.append("size", size);
    formData.append("adminEmail", adminEmail);
    formData.append("adminFirstName", adminFirstName);
    formData.append("adminLastName", adminLastName);
    formData.append("adminPassword", adminPassword);

    startTransition(async () => {
      try {
        const res = await signUpAction(null, formData);
        if (res.success && res.needsOtpVerification) {
          toast("Please enter the OTP sent to your email.");
          setRegisteredEmail(res.email || adminEmail);
          setStep("otp");
          setLoading(false);
        } else if (res.success) {
          celebrate("Organization & Admin successfully registered!");
          router.push("/admin");
          router.refresh();
        } else {
          setError(res.error || "Failed to register organization.");
          toast(res.error || "Signup failed.");
          setLoading(false);
        }
      } catch (err) {
        setError("An unexpected error occurred. Please try again.");
        toast("Connection error.");
        setLoading(false);
      }
    });
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (otpCode.length !== 6 || isNaN(Number(otpCode))) {
      setError("Please enter a valid 6-digit OTP code.");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("email", registeredEmail);
    formData.append("code", otpCode);

    startTransition(async () => {
      try {
        const res = await verifyOtpAction(null, formData);
        if (res.success) {
          celebrate("Account successfully verified and activated!");
          router.push("/admin");
          router.refresh();
        } else {
          setError(res.error || "Verification failed.");
          toast(res.error || "Verification failed.");
          setLoading(false);
        }
      } catch (err) {
        setError("An unexpected error occurred. Please try again.");
        toast("Connection error.");
        setLoading(false);
      }
    });
  };

  if (step === "otp") {
    return (
      <div className="min-h-[85vh] flex flex-col items-center justify-center py-10 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-md w-full space-y-8 bg-white/80 backdrop-blur-xl border border-[var(--line)] rounded-[32px] p-8 sm:p-10 shadow-[var(--sh)] relative overflow-hidden">
          <div className="absolute w-[250px] h-[250px] rounded-full bg-[var(--indigo-tint)] -top-[120px] -left-[120px] opacity-50 pointer-events-none" />

          <div className="text-center relative z-10">
            <div className="flex justify-center mb-5">
              <div
                className="w-14 h-14 rounded-[20px] grid place-items-center shadow-[var(--sh-indigo)]"
                style={{ background: "linear-gradient(140deg, var(--indigo), var(--violet))" }}
              >
                <Mail className="w-6 h-6 text-white" />
              </div>
            </div>
            <h2 className="font-display font-extrabold text-[30px] text-[var(--ink)] tracking-tight leading-none">
              Verify your Email
            </h2>
            <p className="mt-3 text-sm text-[var(--muted)] font-medium">
              We have sent a 6-digit OTP code to <strong className="text-[var(--ink)]">{registeredEmail}</strong>.
            </p>
          </div>

          {error && (
            <div className="bg-[var(--rose-tint)] border border-rose-300 text-rose-800 px-4 py-3 rounded-2xl flex items-start gap-3 animate-fade-in relative z-10">
              <ShieldAlert className="w-5 h-5 mt-0.5 text-rose-600 flex-shrink-0" />
              <span className="text-sm font-medium">{error}</span>
            </div>
          )}

          <form className="mt-8 space-y-6 relative z-10" onSubmit={handleVerifyOtp}>
            <div className="space-y-2">
              <label className="text-xs font-bold text-[var(--ink)] uppercase tracking-wider pl-1" htmlFor="otpCode">
                One-Time Password
              </label>
              <div className="relative">
                <input
                  id="otpCode"
                  name="otpCode"
                  type="text"
                  required
                  maxLength={6}
                  pattern="\d{6}"
                  className="w-full bg-white/70 border border-[var(--line)] rounded-xl px-4 py-3.5 outline-none focus:border-[var(--indigo)] focus:bg-white text-center font-mono text-2xl tracking-[10px] text-[var(--ink)] font-bold shadow-[var(--sh-sm)]"
                  placeholder="000000"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading || otpCode.length !== 6}
                className="w-full bg-[var(--indigo)] hover:bg-[var(--indigo-600)] disabled:opacity-50 text-white font-bold py-3.5 px-4 rounded-2xl shadow-[var(--sh-indigo)] hover:translate-y-[-1px] transition-all flex items-center justify-center gap-2 cursor-pointer font-body text-sm"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  "Verify & Activate Account"
                )}
              </button>
            </div>
          </form>

          <div className="text-center relative z-10 text-xs font-medium text-[var(--muted)]">
            Incorrect email?{" "}
            <button
              onClick={() => {
                setStep("form");
                setError("");
              }}
              className="text-[var(--indigo)] font-bold hover:underline bg-transparent border-none cursor-pointer"
            >
              Start over
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center py-10 px-4 sm:px-6 lg:px-8 relative z-10">
      <div className="max-w-2xl w-full space-y-8 bg-white/80 backdrop-blur-xl border border-[var(--line)] rounded-[32px] p-8 sm:p-10 shadow-[var(--sh)] relative overflow-hidden">
        {/* Glow effect inside card */}
        <div className="absolute w-[250px] h-[250px] rounded-full bg-[var(--indigo-tint)] -top-[120px] -left-[120px] opacity-50 pointer-events-none" />

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
            Onboard your Organization
          </h2>
          <p className="mt-2 text-sm text-[var(--muted)] font-medium">
            Provision your company rewards account and admin workspace
          </p>
        </div>

        {error && (
          <div className="bg-[var(--rose-tint)] border border-rose-300 text-rose-800 px-4 py-3 rounded-2xl flex items-start gap-3 animate-fade-in relative z-10">
            <ShieldAlert className="w-5 h-5 mt-0.5 text-rose-600 flex-shrink-0" />
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        <form className="mt-8 space-y-6 relative z-10" onSubmit={handleSubmit}>
          {/* Section 1: Org Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-[var(--indigo)] uppercase tracking-wider border-b border-[var(--line)] pb-2 flex items-center gap-2">
              <Building className="w-4 h-4" /> 1. Organization Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-1 space-y-1.5">
                <label className="text-xs font-bold text-[var(--ink)] uppercase tracking-wider pl-1" htmlFor="name">
                  Company Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--faint)]">
                    <Building className="w-4 h-4" />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    className="w-full bg-white/70 border border-[var(--line)] rounded-xl pl-10 pr-3 py-2.5 outline-none focus:border-[var(--indigo)] focus:bg-white transition-all font-body text-sm text-[var(--ink)] font-medium shadow-[var(--sh-sm)]"
                    placeholder="Acme Corp"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--ink)] uppercase tracking-wider pl-1" htmlFor="industry">
                  Industry
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--faint)]">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <select
                    id="industry"
                    name="industry"
                    className="w-full bg-white/70 border border-[var(--line)] rounded-xl pl-10 pr-3 py-2.5 outline-none focus:border-[var(--indigo)] focus:bg-white transition-all font-body text-sm text-[var(--ink)] font-medium shadow-[var(--sh-sm)] appearance-none"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                  >
                    <option value="Technology">Technology</option>
                    <option value="Finance">Finance</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Education">Education</option>
                    <option value="Retail">Retail</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--ink)] uppercase tracking-wider pl-1" htmlFor="size">
                  Company Size
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--faint)]">
                    <Users className="w-4 h-4" />
                  </div>
                  <select
                    id="size"
                    name="size"
                    className="w-full bg-white/70 border border-[var(--line)] rounded-xl pl-10 pr-3 py-2.5 outline-none focus:border-[var(--indigo)] focus:bg-white transition-all font-body text-sm text-[var(--ink)] font-medium shadow-[var(--sh-sm)] appearance-none"
                    value={size}
                    onChange={(e) => setSize(e.target.value)}
                  >
                    <option value="1-10">1-10 employees</option>
                    <option value="11-50">11-50 employees</option>
                    <option value="51-200">51-200 employees</option>
                    <option value="201-500">201-500 employees</option>
                    <option value="500+">500+ employees</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Admin Credentials */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-[var(--indigo)] uppercase tracking-wider border-b border-[var(--line)] pb-2 flex items-center gap-2">
              <User className="w-4 h-4" /> 2. Administrator Credentials
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--ink)] uppercase tracking-wider pl-1" htmlFor="firstName">
                  First Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--faint)]">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    className="w-full bg-white/70 border border-[var(--line)] rounded-xl pl-10 pr-3 py-2.5 outline-none focus:border-[var(--indigo)] focus:bg-white transition-all font-body text-sm text-[var(--ink)] font-medium shadow-[var(--sh-sm)]"
                    placeholder="Jane"
                    value={adminFirstName}
                    onChange={(e) => setAdminFirstName(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--ink)] uppercase tracking-wider pl-1" htmlFor="lastName">
                  Last Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--faint)]">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    required
                    className="w-full bg-white/70 border border-[var(--line)] rounded-xl pl-10 pr-3 py-2.5 outline-none focus:border-[var(--indigo)] focus:bg-white transition-all font-body text-sm text-[var(--ink)] font-medium shadow-[var(--sh-sm)]"
                    placeholder="Doe"
                    value={adminLastName}
                    onChange={(e) => setAdminLastName(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-[var(--ink)] uppercase tracking-wider pl-1" htmlFor="adminEmail">
                  Work Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--faint)]">
                    <Mail className="w-5 h-5" />
                  </div>
                  <input
                    id="adminEmail"
                    name="adminEmail"
                    type="email"
                    required
                    className="w-full bg-white/70 border border-[var(--line)] rounded-xl pl-11 pr-4 py-3 outline-none focus:border-[var(--indigo)] focus:bg-white transition-all font-body text-[14px] text-[var(--ink)] font-medium shadow-[var(--sh-sm)]"
                    placeholder="admin@company.com"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-[var(--ink)] uppercase tracking-wider pl-1" htmlFor="adminPassword">
                  Secure Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--faint)]">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    id="adminPassword"
                    name="adminPassword"
                    type="password"
                    required
                    minLength={8}
                    className="w-full bg-white/70 border border-[var(--line)] rounded-xl pl-11 pr-4 py-3 outline-none focus:border-[var(--indigo)] focus:bg-white transition-all font-body text-[14px] text-[var(--ink)] font-medium shadow-[var(--sh-sm)]"
                    placeholder="At least 8 characters"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[var(--indigo)] hover:bg-[var(--indigo-600)] disabled:opacity-50 text-white font-bold py-3.5 px-4 rounded-2xl shadow-[var(--sh-indigo)] hover:translate-y-[-1px] transition-all flex items-center justify-center gap-2 cursor-pointer font-body text-sm"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  Onboard Organization
                </>
              )}
            </button>
          </div>
        </form>

        <div className="text-center relative z-10 text-xs font-medium text-[var(--muted)]">
          Already registered?{" "}
          <Link href="/signin" className="text-[var(--indigo)] font-bold hover:underline">
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
}
