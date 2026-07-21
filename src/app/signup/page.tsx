"use client";

import { useState, startTransition, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signUpAction, verifyOtpAction, resendOtpAction } from "@/app/actions/auth";
import { useToast } from "@/components/Toast";
import { UserPlus, Building, Mail, Lock, ShieldAlert, ArrowRight, ArrowLeft } from "lucide-react";
import { Button, Input, Select, Field, Logo, Stepper } from "@/components/ui";

const STEPS = ["Organization", "Administrator", "Verify"];

function SignUpPageContent() {
  const [step, setStep] = useState(0);
  const [otpValues, setOtpValues] = useState<string[]>(Array(6).fill(""));
  const otpCode = otpValues.join("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [registeredEmail, setRegisteredEmail] = useState("");
  
  const searchParams = useSearchParams();

  useEffect(() => {
    const queryStep = searchParams.get("step");
    const queryEmail = searchParams.get("email");
    if (queryStep === "2" && queryEmail) {
      setStep(2);
      setRegisteredEmail(queryEmail);
    }
  }, [searchParams]);

  const handleOtpChange = (index: number, val: string) => {
    const cleanVal = val.replace(/\D/g, "").slice(-1);
    const newOtp = [...otpValues];
    newOtp[index] = cleanVal;
    setOtpValues(newOtp);

    if (cleanVal && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (!otpValues[index] && index > 0) {
        const newOtp = [...otpValues];
        newOtp[index - 1] = "";
        setOtpValues(newOtp);
        inputRefs.current[index - 1]?.focus();
      } else {
        const newOtp = [...otpValues];
        newOtp[index] = "";
        setOtpValues(newOtp);
      }
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    if (!/^\d{6}$/.test(pastedData)) return;

    const digits = pastedData.split("");
    setOtpValues(digits);
    inputRefs.current[5]?.focus();
  };

  const [name, setName] = useState("");
  const [industry, setIndustry] = useState("Technology");
  const [size, setSize] = useState("11-50");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminFirstName, setAdminFirstName] = useState("");
  const [adminLastName, setAdminLastName] = useState("");
  const [adminPassword, setAdminPassword] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [banner, setBanner] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendIn, setResendIn] = useState(0);
  const router = useRouter();
  const { celebrate, toast } = useToast();

  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

  const buildPayload = () => {
    const fd = new FormData();
    fd.append("name", name);
    fd.append("industry", industry);
    fd.append("size", size);
    fd.append("adminEmail", adminEmail);
    fd.append("adminFirstName", adminFirstName);
    fd.append("adminLastName", adminLastName);
    fd.append("adminPassword", adminPassword);
    return fd;
  };

  const validateOrg = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Company name is required.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateAdmin = () => {
    const e: Record<string, string> = {};
    if (!adminFirstName.trim()) e.adminFirstName = "First name is required.";
    if (!adminLastName.trim()) e.adminLastName = "Last name is required.";
    if (!adminEmail.trim()) e.adminEmail = "Work email is required.";
    if (adminPassword.length < 8) e.adminPassword = "Password must be at least 8 characters.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submitOrg = () => {
    setBanner("");
    if (!validateAdmin()) return;
    setLoading(true);
    startTransition(async () => {
      try {
        const res = await signUpAction(null, buildPayload());
        if (res.success && res.needsOtpVerification) {
          setRegisteredEmail(res.email || adminEmail);
          setStep(2);
          setResendIn(30);
        } else if (res.success) {
          celebrate("Organization & admin registered!");
          router.push("/admin");
          router.refresh();
        } else {
          setBanner(res.error || "Failed to register organization.");
        }
      } catch {
        setBanner("An unexpected error occurred. Please try again.");
      } finally {
        setLoading(false);
      }
    });
  };

  const resendOtp = () => {
    if (resendIn > 0) return;
    setBanner("");
    startTransition(async () => {
      const res = await resendOtpAction(registeredEmail);
      if (res.success) {
        toast("Verification code resent.");
        setResendIn(30);
      } else {
        setBanner(res.error || "Could not resend the code.");
      }
    });
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setBanner("");
    if (otpCode.length !== 6) {
      setErrors({ otp: "Enter the 6-digit code." });
      return;
    }
    setLoading(true);
    const fd = new FormData();
    fd.append("email", registeredEmail);
    fd.append("code", otpCode);
    startTransition(async () => {
      try {
        const res = await verifyOtpAction(null, fd);
        if (res.success) {
          celebrate("Account verified and activated!");
          router.push("/admin");
          router.refresh();
        } else {
          setBanner(res.error || "Verification failed.");
        }
      } catch {
        setBanner("An unexpected error occurred. Please try again.");
      } finally {
        setLoading(false);
      }
    });
  };

  const iconInput = (icon: React.ReactNode, node: React.ReactNode) => (
    <div className="relative">
      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--faint)] pointer-events-none">
        {icon}
      </span>
      {node}
    </div>
  );

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center py-10 px-4 relative z-10">
      <div className="max-w-2xl w-full bg-[var(--surface)]/90 backdrop-blur-xl border border-[var(--line-2)] rounded-[var(--r-xl)] p-8 sm:p-10 shadow-[var(--sh-lg)] relative overflow-hidden">
        <div className="absolute w-[260px] h-[260px] rounded-full bg-[var(--brand-tint)] -top-[130px] -left-[110px] blur-2xl pointer-events-none" />

        <div className="text-center relative z-10">
          <div className="flex justify-center mb-5">
            <Logo size={56} />
          </div>
          <h2 className="t-h1 text-[var(--text)]">Onboard your Organization</h2>
          <p className="mt-2 t-small text-[var(--muted)]">
            Provision your company rewards account and admin workspace
          </p>
        </div>

        <div className="mt-7 relative z-10">
          <Stepper steps={STEPS} current={step} />
        </div>

        {banner && (
          <div className="mt-6 bg-[var(--rose-tint)] border border-[var(--rose)]/30 text-[var(--rose)] px-4 py-3 rounded-[var(--r)] flex items-start gap-3 animate-fade-in relative z-10">
            <ShieldAlert className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <span className="t-small font-medium">{banner}</span>
          </div>
        )}

        <div className="mt-7 relative z-10">
          {step === 0 && (
            <div className="space-y-5 animate-fade-in">
              <Field label="Company name" required error={errors.name}>
                {({ id, invalid }) =>
                  iconInput(
                    <Building className="w-[18px] h-[18px]" />,
                    <Input
                      id={id}
                      invalid={invalid}
                      className="pl-11"
                      placeholder="Acme Corp"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  )
                }
              </Field>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Industry">
                  {({ id }) => (
                    <Select id={id} value={industry} onChange={(e) => setIndustry(e.target.value)}>
                      <option>Technology</option>
                      <option>Finance</option>
                      <option>Healthcare</option>
                      <option>Education</option>
                      <option>Retail</option>
                      <option>Other</option>
                    </Select>
                  )}
                </Field>
                <Field label="Company size">
                  {({ id }) => (
                    <Select id={id} value={size} onChange={(e) => setSize(e.target.value)}>
                      <option value="1-10">1-10 employees</option>
                      <option value="11-50">11-50 employees</option>
                      <option value="51-200">51-200 employees</option>
                      <option value="201-500">201-500 employees</option>
                      <option value="500+">500+ employees</option>
                    </Select>
                  )}
                </Field>
              </div>
              <div className="flex justify-end pt-2">
                <Button
                  onClick={() => validateOrg() && setStep(1)}
                  icon={<ArrowRight className="w-[18px] h-[18px]" />}
                >
                  Continue
                </Button>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-5 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="First name" required error={errors.adminFirstName}>
                  {({ id, invalid }) => (
                    <Input
                      id={id}
                      invalid={invalid}
                      placeholder="Jane"
                      value={adminFirstName}
                      onChange={(e) => setAdminFirstName(e.target.value)}
                    />
                  )}
                </Field>
                <Field label="Last name" required error={errors.adminLastName}>
                  {({ id, invalid }) => (
                    <Input
                      id={id}
                      invalid={invalid}
                      placeholder="Doe"
                      value={adminLastName}
                      onChange={(e) => setAdminLastName(e.target.value)}
                    />
                  )}
                </Field>
              </div>
              <Field label="Work email address" required error={errors.adminEmail}>
                {({ id, invalid }) =>
                  iconInput(
                    <Mail className="w-[18px] h-[18px]" />,
                    <Input
                      id={id}
                      invalid={invalid}
                      type="email"
                      className="pl-11"
                      placeholder="admin@company.com"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                    />
                  )
                }
              </Field>
              <Field label="Secure password" required error={errors.adminPassword} hint="At least 8 characters.">
                {({ id, invalid }) =>
                  iconInput(
                    <Lock className="w-[18px] h-[18px]" />,
                    <Input
                      id={id}
                      invalid={invalid}
                      type="password"
                      className="pl-11"
                      placeholder="••••••••••••"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                    />
                  )
                }
              </Field>
              <div className="flex justify-between pt-2">
                <Button variant="ghost" onClick={() => setStep(0)} icon={<ArrowLeft className="w-[18px] h-[18px]" />}>
                  Back
                </Button>
                <Button onClick={submitOrg} loading={loading} icon={<UserPlus className="w-[18px] h-[18px]" />}>
                  Create account
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <form className="space-y-5 animate-fade-in" onSubmit={handleVerifyOtp}>
              <p className="t-small text-[var(--muted)] text-center">
                We sent a 6-digit code to{" "}
                <strong className="text-[var(--text)]">{registeredEmail}</strong>.
              </p>
              <Field label="One-time password" error={errors.otp}>
                {({ id, invalid }) => (
                  <div className="flex justify-between gap-2 sm:gap-3 py-2" id={id}>
                    {otpValues.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => { inputRefs.current[idx] = el; }}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                        onPaste={handleOtpPaste}
                        className={`w-11 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold font-mono rounded-[var(--r)] border bg-[var(--surface-2)] text-[var(--text)] transition-all outline-none duration-150
                          ${invalid ? 'border-[var(--rose)] focus:border-[var(--rose)] focus:ring-1 focus:ring-[var(--rose)]' : 'border-[var(--line-2)] focus:border-[var(--brand-bright)] focus:ring-1 focus:ring-[var(--brand-bright)]/40 focus:shadow-[0_0_12px_rgba(85,211,150,0.15)]'}
                        `}
                      />
                    ))}
                  </div>
                )}
              </Field>
              <Button type="submit" loading={loading} disabled={otpCode.length !== 6} fullWidth size="lg">
                Verify &amp; Activate Account
              </Button>
              <div className="flex items-center justify-between t-caption text-[var(--muted)]">
                <button
                  type="button"
                  onClick={resendOtp}
                  disabled={resendIn > 0}
                  className="font-medium text-[var(--brand-bright)] hover:underline disabled:text-[var(--faint)] disabled:no-underline disabled:cursor-not-allowed"
                >
                  {resendIn > 0 ? `Resend code in ${resendIn}s` : "Resend code"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStep(0);
                    setOtpValues(Array(6).fill(""));
                    setBanner("");
                  }}
                  className="font-medium text-[var(--muted)] hover:text-[var(--text)]"
                >
                  Start over
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="text-center relative z-10 mt-7 t-caption font-medium text-[var(--muted)]">
          Already registered?{" "}
          <Link href="/signin" className="text-[var(--brand-bright)] font-medium hover:underline">
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[85vh] flex flex-col items-center justify-center py-10 px-4 relative z-10">
        <div className="max-w-2xl w-full bg-[var(--surface)]/90 backdrop-blur-xl border border-[var(--line-2)] rounded-[var(--r-xl)] p-8 sm:p-10 shadow-[var(--sh-lg)] flex justify-center items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--brand-bright)]"></div>
        </div>
      </div>
    }>
      <SignUpPageContent />
    </Suspense>
  );
}
