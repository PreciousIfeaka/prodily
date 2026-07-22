"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  motion,
  useInView,
  useMotionValue,
  useSpring,
  useScroll,
  useTransform,
  AnimatePresence,
} from "motion/react";
import {
  Trophy, Wallet, Gift, Zap, Target, TrendingUp, Users, Brain, ShieldCheck,
  BarChart3, Coffee, Bus, GraduationCap, Wifi, Star, ArrowRight, Menu, X,
  Crown, Flame, Medal, Phone, Mail, Sun, Moon,
} from "lucide-react";
import { Button } from "./ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import Logo from "@/components/ui/Logo";

/* Prodily brand mark — reused as the "sparkle" icon across the page (green, on-brand) */
function Sparkles({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden className={className}>
      <path transform="translate(-1 1)" fill="var(--brand)" d="M32 32 L32 38 A6 6 0 0 1 26 44 L22 44 A6 6 0 0 1 16 38 L16 32 L10 32 A6 6 0 0 1 4 26 L4 22 A6 6 0 0 1 10 16 L16 16 C24 14 24 34 32 32 Z" />
      <path transform="translate(1 -1)" fill="var(--brand-bright)" d="M16 16 L16 10 A6 6 0 0 1 22 4 L26 4 A6 6 0 0 1 32 10 L32 16 L38 16 A6 6 0 0 1 44 22 L44 26 A6 6 0 0 1 38 32 L32 32 C24 34 24 14 16 16 Z" />
    </svg>
  );
}

export default function Landing() {
  return (
    <div className="landing min-h-screen overflow-hidden bg-background text-foreground selection:bg-primary/40">
      <Nav />
      <Hero />
      <Trust />
      <Problem />
      <Solution />
      <Testimonials />
      <Features />
      <HowItWorks />
      <FAQ />
      <FinalCTA />
      <Footer />
    </div>
  );
}

/* ---------------- NAV ---------------- */
function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [isLight, setIsLight] = useState(false);

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

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = ["Features", "Solutions"];
  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${scrolled ? "backdrop-blur-xl bg-background/60 border-b border-white/5" : ""
        }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <Logo size={30} withWordmark />
        </Link>
        <ul className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
          {links.map((l) => (
            <li key={l}>
              <a href={`#${l.toLowerCase()}`} className="transition hover:text-foreground">{l}</a>
            </li>
          ))}
        </ul>
        <div className="hidden md:flex items-center gap-3">
          <Link href="/signin" className="text-sm text-muted-foreground hover:text-foreground">Login</Link>
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="p-2 text-muted-foreground hover:text-foreground transition cursor-pointer"
          >
            {isLight ? <Moon className="w-[18px] h-[18px]" /> : <Sun className="w-[18px] h-[18px] text-[var(--gold)]" />}
          </button>
          <Button asChild className="rounded-full gradient-primary shadow-glow border-0 text-primary-foreground hover:opacity-90">
            <Link href="/signup">Get Started</Link>
          </Button>
        </div>
        <button className="md:hidden" onClick={() => setOpen((v) => !v)} aria-label="Menu">
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden border-t border-white/5 bg-background/90 backdrop-blur-xl"
          >
            <div className="flex flex-col gap-4 px-6 py-6">
              {links.map((l) => (
                <a key={l} href={`#${l.toLowerCase()}`} className="text-sm" onClick={() => setOpen(false)}>{l}</a>
              ))}
              <div className="flex items-center justify-between border-t border-b border-white/5 py-2.5 my-1">
                <span className="text-sm text-muted-foreground">Theme Mode</span>
                <button
                  onClick={toggleTheme}
                  aria-label="Toggle theme"
                  className="p-2 text-muted-foreground hover:text-foreground transition cursor-pointer"
                >
                  {isLight ? <Moon className="w-[18px] h-[18px]" /> : <Sun className="w-[18px] h-[18px] text-[var(--gold)]" />}
                </button>
              </div>
              <Link href="/signin" className="text-sm" onClick={() => setOpen(false)}>Login</Link>
              <Button asChild className="rounded-full gradient-primary border-0 text-primary-foreground" onClick={() => setOpen(false)}>
                <Link href="/signup">Get Started</Link>
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

/* ---------------- HERO ---------------- */
function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const [contactOpen, setContactOpen] = useState(false);

  return (
    <section ref={ref} className="relative pt-36 md:pt-44 pb-24 md:pb-32 overflow-hidden bg-black text-white">
      {/* Decorative 3D Green Glass Backdrop */}
      <img
        src="/hero-bg.png"
        alt=""
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "center",
          mixBlendMode: "screen",
          opacity: 0.9,
          zIndex: 1,
        }}
        fetchPriority="high"
        className="pointer-events-none select-none"
      />

      {/* Dark Gradient Overlay for Readability */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 2,
          background: "linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.65) 60%, rgba(0,0,0,0.9) 100%)",
        }}
        className="pointer-events-none"
      />

      <div className="absolute inset-0 grid-bg opacity-30 z-2" />
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[560px] w-[900px] -translate-x-1/2 rounded-full bg-primary/25 blur-[140px] z-2" />

      <div className="mx-auto max-w-7xl px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl text-center relative z-10"
        >
          <h1 className="mt-6 text-5xl md:text-7xl leading-[1.02] tracking-tight font-medium text-white">
            Build a workplace where{" "}
            <span className="italic font-display gradient-text">great work</span>
            <br className="hidden md:block" /> never goes unnoticed.
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base md:text-lg text-zinc-400 leading-relaxed text-balance">
            From a successful launch to the employee who quietly delivers every week, Prodily helps you recognize achievements, reward people instantly, and build a culture they genuinely enjoy.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button asChild size="lg" className="rounded-full gradient-primary border-0 shadow-glow text-primary-foreground hover:opacity-90 h-12 px-6">
              <Link href="/signup">Get Started <ArrowRight className="ml-1 h-4 w-4" /></Link>
            </Button>
            <Button size="lg" variant="ghost" onClick={() => setContactOpen(true)} className="rounded-full h-12 px-6 glass hover:bg-white/10 text-white border-white/10 hover:text-white">
              <Phone className="mr-2 h-4 w-4" /> Contact Support
            </Button>
          </div>
        </motion.div>

        <AnimatePresence>
          {contactOpen && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setContactOpen(false)}
              className="fixed inset-0 z-[100] grid place-items-center bg-black/70 backdrop-blur-md p-4"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-md rounded-2xl glass-strong p-8"
              >
                <button
                  onClick={() => setContactOpen(false)}
                  aria-label="Close"
                  className="absolute top-3 right-3 h-9 w-9 grid place-items-center rounded-full hover:bg-white/10 text-muted-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
                <h3 className="text-2xl font-medium tracking-tight">Contact support</h3>
                <p className="mt-2 text-sm text-muted-foreground">We&apos;re here to help. Reach out anytime.</p>
                <div className="mt-6 space-y-3">
                  <a href="tel:08135503632" className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.03] px-4 py-3 hover:bg-white/[0.06] transition">
                    <span className="grid h-10 w-10 place-items-center rounded-full bg-primary/15 text-primary"><Phone className="h-4 w-4" /></span>
                    <div>
                      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Phone</div>
                      <div className="text-sm font-medium">08135503632</div>
                    </div>
                  </a>
                  <a href="mailto:contact@prodily.tech" className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.03] px-4 py-3 hover:bg-white/[0.06] transition">
                    <span className="grid h-10 w-10 place-items-center rounded-full bg-primary/15 text-primary"><Mail className="h-4 w-4" /></span>
                    <div>
                      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Email</div>
                      <div className="text-sm font-medium">contact@prodily.tech</div>
                    </div>
                  </a>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div style={{ y }} className="relative mx-auto mt-16 md:mt-24 max-w-6xl">
          <HeroDashboard />
        </motion.div>
      </div>
    </section>
  );
}

function HeroDashboard() {
  return (
    <div className="relative">
      <motion.div
        initial={{ opacity: 0, y: 40, rotateX: 10 }}
        animate={{ opacity: 1, y: 0, rotateX: 0 }}
        transition={{ duration: 0.9, delay: 0.2 }}
        className="glass-strong shadow-card p-4 md:p-6 relative"
      >
        <div className="flex items-center gap-1.5 pb-4">
          <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
          <span className="ml-3 text-xs text-muted-foreground">prodily.app / workspace</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Leaderboard />
          <RecognitionFeed />
          <div className="flex flex-col gap-4">
            <RewardWallet />
            <AIRecommend />
          </div>
        </div>
      </motion.div>

      <FloatingNotif className="hidden md:flex -left-8 top-24" delay={1} icon="🎉">
        Sarah earned <b className="text-foreground">Lunch Voucher</b>
      </FloatingNotif>
      <FloatingNotif className="hidden md:flex -right-6 top-8" delay={1.6} icon="🏆" tone="gold">
        David unlocked <b className="text-foreground">Sprint Champion</b>
      </FloatingNotif>
      <FloatingNotif className="hidden lg:flex -right-10 bottom-24" delay={2.2} icon="💰" tone="emerald">
        <b className="text-foreground">₦20,000</b> Performance Bonus Approved
      </FloatingNotif>
    </div>
  );
}

function FloatingNotif({ children, className = "", delay = 0, icon, tone }: {
  children: React.ReactNode; className?: string; delay?: number; icon: string; tone?: "gold" | "emerald";
}) {
  const ring = tone === "gold" ? "ring-gold/40" : tone === "emerald" ? "ring-emerald-reward/40" : "ring-primary/40";
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.6, type: "spring" }}
      className={`absolute z-10 items-center gap-3 glass-strong px-4 py-3 shadow-card ring-1 ${ring} animate-float ${className}`}
    >
      <div className="grid h-9 w-9 place-items-center rounded-xl bg-white/5 text-xl">{icon}</div>
      <div className="text-xs text-muted-foreground max-w-[180px] leading-tight">{children}</div>
    </motion.div>
  );
}

function Leaderboard() {
  const [rows, setRows] = useState([
    { name: "Sarah A.", pts: 2840, up: true, medal: "gold" },
    { name: "David O.", pts: 2610, up: true, medal: "silver" },
    { name: "Amaka N.", pts: 2340, up: false, medal: "bronze" },
    { name: "Tunde K.", pts: 1980, up: true },
    { name: "Ruth E.", pts: 1720, up: true },
  ]);
  useEffect(() => {
    const id = setInterval(() => {
      setRows((r) => {
        const copy = [...r];
        const i = Math.floor(Math.random() * copy.length);
        copy[i] = { ...copy[i], pts: copy[i].pts + Math.floor(Math.random() * 40) };
        return copy.sort((a, b) => b.pts - a.pts);
      });
    }, 2200);
    return () => clearInterval(id);
  }, []);
  const medalColor = (m?: string) =>
    m === "gold" ? "bg-gradient-to-br from-gold to-amber-500 text-black" :
      m === "silver" ? "bg-white/20 text-white" :
        m === "bronze" ? "bg-amber-800/60 text-white" : "bg-white/5 text-muted-foreground";
  return (
    <div className="rounded-2xl bg-white/[0.03] border border-white/5 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Trophy className="h-4 w-4 text-gold" />
          <span className="text-sm font-medium">Leaderboard</span>
        </div>
        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">This week</span>
      </div>
      <ul className="space-y-1.5">
        <AnimatePresence initial={false}>
          {rows.map((r, i) => (
            <motion.li
              key={r.name}
              layout
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-white/5"
            >
              <span className={`grid h-6 w-6 place-items-center rounded-md text-[11px] font-semibold ${medalColor(r.medal)}`}>
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium truncate">{r.name}</div>
                <div className="h-1 mt-1 rounded-full bg-white/5 overflow-hidden">
                  <motion.div
                    initial={false}
                    animate={{ width: `${Math.min(100, (r.pts / 3000) * 100)}%` }}
                    transition={{ duration: 0.6 }}
                    className="h-full gradient-primary"
                  />
                </div>
              </div>
              <span className="text-[11px] tabular-nums text-muted-foreground">{r.pts.toLocaleString()} XP</span>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </div>
  );
}

function RecognitionFeed() {
  const items = [
    { who: "Ada", act: "shipped the payments refactor", badge: "Ship it", tone: "primary" },
    { who: "Marcus", act: "closed 5 enterprise deals", badge: "Rainmaker", tone: "gold" },
    { who: "Zara", act: "onboarded 12 new hires", badge: "Team Hero", tone: "emerald" },
  ];
  return (
    <div className="rounded-2xl bg-white/[0.03] border border-white/5 p-4">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="h-4 w-4" />
        <span className="text-sm font-medium">Recognition feed</span>
      </div>
      <div className="space-y-3">
        {items.map((it, i) => (
          <motion.div
            key={it.who}
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.15 }}
            className="rounded-xl bg-white/[0.03] p-3"
          >
            <div className="flex items-center gap-2">
              <div className="grid h-7 w-7 place-items-center rounded-full gradient-primary text-[11px] font-semibold text-white">
                {it.who[0]}
              </div>
              <div className="text-xs">
                <b className="text-foreground">{it.who}</b>{" "}
                <span className="text-muted-foreground">{it.act}</span>
              </div>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <BadgePill tone={it.tone as "primary" | "gold" | "emerald"}>{it.badge}</BadgePill>
              <span className="text-[10px] text-muted-foreground">+120 XP</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function BadgePill({ children, tone = "primary" }: { children: React.ReactNode; tone?: "primary" | "gold" | "emerald" }) {
  const cls =
    tone === "gold" ? "bg-gold/15 text-gold border-gold/30" :
      tone === "emerald" ? "bg-emerald-reward/15 text-emerald-reward border-emerald-reward/30" :
        "bg-primary/15 text-violet-soft border-primary/30";
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium ${cls}`}>
      <Star className="h-2.5 w-2.5" /> {children}
    </span>
  );
}

function RewardWallet() {
  return (
    <div className="relative rounded-2xl p-4 overflow-hidden border border-white/10"
      style={{ background: "linear-gradient(135deg, var(--brand), var(--brand-600))" }}>
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/20 blur-2xl" />
      <div className="flex items-center gap-2 mb-2 relative">
        <Wallet className="h-4 w-4" />
        <span className="text-sm font-medium">Reward Wallet</span>
      </div>
      <div className="relative">
        <div className="text-[11px] text-white/70">Available balance</div>
        <div className="text-2xl font-semibold tracking-tight">₦42,500</div>
        <div className="mt-3 flex gap-2">
          <button className="text-[10px] rounded-full bg-white/15 hover:bg-white/25 px-2.5 py-1">Redeem</button>
          <button className="text-[10px] rounded-full bg-white/15 hover:bg-white/25 px-2.5 py-1">Withdraw</button>
        </div>
      </div>
    </div>
  );
}

function AIRecommend() {
  return (
    <div className="rounded-2xl bg-white/[0.03] border border-white/5 p-4">
      <div className="flex items-center gap-2 mb-2">
        <Brain className="h-4 w-4 text-violet-soft" />
        <span className="text-sm font-medium">AI recommends</span>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed">
        <b className="text-foreground">Tunde</b> shipped 3 critical fixes this week with 0 regressions. Consider a{" "}
        <b className="text-foreground">Sprint Champion</b> badge + ₦10,000.
      </p>
      <button className="mt-3 w-full text-xs rounded-lg gradient-primary py-2 font-medium">
        Approve reward
      </button>
    </div>
  );
}

/* ---------------- TRUST ---------------- */
const row1Brands = [
  { name: "Shuttlers", code: "SH", color: "#3b82f6" },
  { name: "Chowdeck", code: "CD", color: "#f05a24" },
  { name: "Glovo", code: "GL", color: "#ffc000", textDark: true },
  { name: "Uber", code: "UB", color: "#8a8a8a" },
  { name: "Bolt", code: "BO", color: "#34d399" },
  { name: "inDrive", code: "ID", color: "#22c55e" },
];

const row2Brands = [
  { name: "MTN", code: "MTN", color: "#facc15", textDark: true },
  { name: "Airtel", code: "AT", color: "#ef4444" },
  { name: "Glo", code: "GO", color: "#22c55e" },
  { isMonnify: true },
  { name: "9mobile", code: "9M", color: "#15803d" },
  { name: "Jumia", code: "JM", color: "#f97316" },
  { name: "Konga", code: "KG", color: "#ec4899" },
];

const row3Brands = [
  { name: "Netflix", code: "NF", color: "#e50914" },
  { name: "Udemy", code: "UD", color: "#a855f7" },
  { name: "Apple Music", code: "AM", color: "#fa243c" },
  { name: "Coursera", code: "CR", color: "#2563eb" },
  { name: "AltSchool Africa", code: "AS", color: "#8b5cf6" },
  { name: "Spotify", code: "SP", color: "#1db954" },
  { name: "Showmax", code: "SM", color: "#4f46e5" },
  { name: "Chicken Republic", code: "CR", color: "#ef4444" },
  { name: "Domino’s Pizza", code: "DP", color: "#1e3a8a" },
  { name: "The Place", code: "TP", color: "#b45309" },
];

function BrandChip({ brand }: { brand: any }) {
  if (brand.isMonnify) {
    return (
      <div className="flex items-center gap-3 px-5 py-2.5 rounded-full bg-[var(--brand-tint)] border border-[var(--brand-bright)]/40 shadow-[0_0_20px_rgba(85,211,150,0.15)] shrink-0 mx-2 hover:scale-105 hover:border-[var(--brand-bright)] hover:shadow-[0_0_30px_rgba(85,211,150,0.35)] transition-all duration-300">
        <span className="w-8 h-8 rounded-full bg-[var(--brand)] text-white font-bold flex items-center justify-center text-sm shadow-md">
          M
        </span>
        <div className="text-left leading-tight">
          <div className="text-[9px] font-semibold tracking-wider text-[var(--brand-bright)] uppercase">Payment Infrastructure</div>
          <div className="text-sm font-bold text-[var(--text)]">Powered by Monnify</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-[var(--surface-2)] border border-[var(--line)] hover:border-[var(--line-2)] hover:bg-[var(--surface-3)] shrink-0 mx-2 transition-all duration-300 hover:scale-105 shadow-sm">
      <span
        style={{ backgroundColor: brand.color }}
        className={`w-7 h-7 rounded-full font-bold flex items-center justify-center text-[10px] shadow-inner ${brand.textDark ? "text-black" : "text-white"}`}
      >
        {brand.code}
      </span>
      <span className="text-sm font-medium text-[var(--text)]">{brand.name}</span>
    </div>
  );
}

function LogoMarquee() {
  const r1 = [...row1Brands, ...row1Brands, ...row1Brands, ...row1Brands];
  const r2 = [...row2Brands, ...row2Brands, ...row2Brands, ...row2Brands];
  const r3 = [...row3Brands, ...row3Brands, ...row3Brands, ...row3Brands];

  return (
    <div className="relative overflow-hidden w-full flex flex-col gap-6 py-6 mt-6">
      {/* Subtle edge fades */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[var(--bg)] to-transparent z-10" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[var(--bg)] to-transparent z-10" />

      {/* Row 1 - Left to Right */}
      <div className="flex w-full overflow-hidden">
        <div className="flex gap-2 animate-marquee whitespace-nowrap hover:[animation-play-state:paused] py-1">
          {r1.map((brand, i) => (
            <BrandChip key={`r1-${i}`} brand={brand} />
          ))}
        </div>
      </div>

      {/* Row 2 - Right to Left (Reverse) */}
      <div className="flex w-full overflow-hidden">
        <div className="flex gap-2 animate-marquee-reverse whitespace-nowrap hover:[animation-play-state:paused] py-1">
          {r2.map((brand, i) => (
            <BrandChip key={`r2-${i}`} brand={brand} />
          ))}
        </div>
      </div>

      {/* Row 3 - Left to Right */}
      <div className="flex w-full overflow-hidden">
        <div className="flex gap-2 animate-marquee whitespace-nowrap hover:[animation-play-state:paused] py-1">
          {r3.map((brand, i) => (
            <BrandChip key={`r3-${i}`} brand={brand} />
          ))}
        </div>
      </div>
    </div>
  );
}

function Trust() {
  return (
    <section className="py-20 md:py-28 border-t border-white/5 bg-black/10 relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 text-center">
        {/* Header */}
        <div className="max-w-3xl mx-auto mb-12 space-y-4">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white leading-tight">
            A reward ecosystem <span className="text-[var(--brand-bright)] italic font-serif">employees actually want</span>
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            Redeem points across food, mobility, telecoms, learning and entertainment. One wallet, hundreds of brands.
          </p>
        </div>

        {/* Infinite Marquee Section */}
        <LogoMarquee />
      </div>
    </section>
  );
}

/* ---------------- PROBLEM ---------------- */
function Problem() {
  const cards = [
    { title: "The late-night win", body: "Your team just finished a successful client presentation. Everyone stayed late. Everyone gave their best. But salary is still next week. How do you say 'thank you' today?" },
    { title: "The quiet launch heroes", body: "The product has finally launched. Marketing is celebrating. Sales is posting screenshots. Your developers are already fixing production issues. How do you appreciate the people behind the launch?" },
    { title: "The difficult month", body: "One of your most reliable employees is having a difficult month. Nigeria has happened. It isn't payday. How do you support them without making it awkward?" },
    { title: "The dependable one", body: "She never misses deadlines. Always dependable. Never complains. How do you reward consistency without looking biased?" },
    { title: "The team behind the campaign", body: "Your design team carried the last campaign. You want to appreciate them, without everyone ending up in your DM asking for ₦2,000. What do you do?" },
  ];
  const [index, setIndex] = useState(0);
  const total = cards.length;
  const go = (dir: number) => setIndex((i) => (i + dir + total) % total);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % total), 10000);
    return () => clearInterval(id);
  }, [total, paused]);

  return (
    <section className="py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex items-end justify-between gap-6 flex-wrap">
          <div className="max-w-2xl">
            <div className="text-xs uppercase tracking-widest text-violet-soft">The reality</div>
            <h2 className="mt-3 text-4xl md:text-5xl tracking-tight font-medium">
              Every week, a moment worth <span className="italic font-display gradient-text">celebrating</span> slips by.
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => go(-1)} aria-label="Previous scenario" className="h-11 w-11 rounded-full glass-strong grid place-items-center hover:bg-white/10 transition">
              <ArrowRight className="h-4 w-4 rotate-180" />
            </button>
            <button onClick={() => go(1)} aria-label="Next scenario" className="h-11 w-11 rounded-full gradient-primary grid place-items-center text-primary-foreground shadow-glow">
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="mt-12 relative overflow-hidden" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
          <motion.div className="flex" animate={{ x: `${-index * 100}%` }} transition={{ type: "spring", stiffness: 120, damping: 22 }}>
            {cards.map((c, i) => (
              <div key={c.title} className="w-full shrink-0 basis-full">
                <motion.article
                  animate={{ scale: i === index ? 1 : 0.96, opacity: i === index ? 1 : 0.4 }}
                  transition={{ duration: 0.4 }}
                  className="glass-strong p-8 md:p-12 min-h-[320px] flex flex-col justify-between mx-1"
                >
                  <div>
                    <div className="text-xs uppercase tracking-widest text-violet-soft">Scenario {String(i + 1).padStart(2, "0")}</div>
                    <h3 className="mt-4 text-2xl md:text-4xl font-medium tracking-tight">{c.title}</h3>
                    <p className="mt-5 text-base md:text-lg leading-relaxed text-muted-foreground max-w-2xl">{c.body}</p>
                  </div>
                  <div className="mt-8 text-xs text-muted-foreground">
                    {String(i + 1).padStart(2, "0")} <span className="opacity-50">/ {String(total).padStart(2, "0")}</span>
                  </div>
                </motion.article>
              </div>
            ))}
          </motion.div>
        </div>

        <div className="mt-6 flex justify-center gap-2">
          {cards.map((_, i) => (
            <button key={i} onClick={() => setIndex(i)} aria-label={`Go to scenario ${i + 1}`}
              className={`h-1.5 rounded-full transition-all ${i === index ? "w-8 bg-primary" : "w-4 bg-white/15 hover:bg-white/30"}`} />
          ))}
        </div>

        <p className="mt-16 text-center text-2xl md:text-3xl font-display italic">
          Recognition shouldn&apos;t depend on memory. <span className="gradient-text">Or payday.</span>
        </p>
      </div>
    </section>
  );
}

/* ---------------- SOLUTION ---------------- */
function Solution() {
  return (
    <section id="solutions" className="py-24 md:py-32 border-t border-white/5">
      <div className="mx-auto max-w-7xl px-6 text-center">
        <div className="text-xs uppercase tracking-widest text-violet-soft">Meet Prodily</div>
        <h2 className="mt-3 text-4xl md:text-6xl tracking-tight font-medium max-w-3xl mx-auto">
          Recognition, rewards & culture, <span className="italic font-display gradient-text">in one flow.</span>
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-muted-foreground">
          Prodily helps companies recognize great work, reward employees fairly and build stronger teams through recognition,
          rewards, healthy competition and meaningful employee experiences.
        </p>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mt-14 glass-strong shadow-card p-6 md:p-8 text-left max-w-5xl mx-auto"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Trophy, l: "Recognitions this week", v: "247", tone: "text-gold" },
              { icon: Wallet, l: "Rewards paid", v: "₦1.2M", tone: "text-emerald-reward" },
              { icon: Flame, l: "Active streaks", v: "89", tone: "text-primary" },
              { icon: BarChart3, l: "Engagement lift", v: "+34%", tone: "text-blue-analytics" },
            ].map((k) => (
              <div key={k.l} className="rounded-xl bg-white/[0.03] p-4">
                <k.icon className={`h-4 w-4 ${k.tone}`} />
                <div className="mt-3 text-2xl font-semibold tracking-tight">{k.v}</div>
                <div className="text-xs text-muted-foreground">{k.l}</div>
              </div>
            ))}
          </div>
          <div className="mt-6 grid md:grid-cols-3 gap-4">
            <Leaderboard />
            <RecognitionFeed />
            <div className="flex flex-col gap-4"><RewardWallet /><AIRecommend /></div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ---------------- FEATURES ---------------- */
function Features() {
  const feats = [
    { tag: "Rewards", title: "Reward employees instantly", icon: Zap, body: "Cash, lunch, transport, gift cards, learning credits, internet allowance, emergency support, sent in seconds.", mock: <RewardsMock /> },
    { tag: "Wallet", title: "Employee Wallet", icon: Wallet, body: "Track rewards, withdraw eligible cash, redeem benefits and review history in one clean wallet.", mock: <WalletMock /> },
    { tag: "Culture", title: "Recognition Feed", icon: Sparkles, body: "Celebrate achievements publicly. Badges, shout-outs and company announcements, like a culture-first social feed.", mock: <FeedMock /> },
    { tag: "Gamification", title: "Leaderboards & gamification", icon: Trophy, body: "Weekly rankings, monthly champions, XP, achievements, streaks and challenges, make work feel like a team sport.", mock: <GameMock /> },
    { tag: "AI", title: "AI Recommendations", icon: Brain, body: "Prodily automatically recommends employees who deserve recognition based on performance, collaboration and consistency.", mock: <AIMock /> },
    { tag: "Governance", title: "Approval workflow", icon: ShieldCheck, body: "Department and finance approvals, budget controls and audit trails keep everything fair and accountable.", mock: <ApprovalMock /> },
    { tag: "Analytics", title: "Analytics dashboard", icon: BarChart3, body: "Engagement, retention, reward spend, department performance and challenge participation, all in real time.", mock: <AnalyticsMock /> },
  ];
  return (
    <section id="features" className="py-24 md:py-32 border-t border-white/5">
      <div className="mx-auto max-w-7xl px-6">
        <div className="max-w-2xl mb-16">
          <div className="text-xs uppercase tracking-widest text-violet-soft">Features</div>
          <h2 className="mt-3 text-4xl md:text-5xl tracking-tight font-medium">
            Everything you need to run a <span className="italic font-display gradient-text">recognition-first</span> workplace.
          </h2>
        </div>
        <div className="space-y-20 md:space-y-28">
          {feats.map((f, i) => (
            <FeatureRow key={f.title} feat={f} reverse={i % 2 === 1} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureRow({ feat, reverse }: { feat: { tag: string; title: string; icon: React.ComponentType<{ className?: string }>; body: string; mock: React.ReactNode }; reverse: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.7 }}
      className={`grid md:grid-cols-2 gap-10 md:gap-16 items-center ${reverse ? "md:[direction:rtl]" : ""}`}
    >
      <div className="[direction:ltr]">
        <div className="inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-[11px] uppercase tracking-widest text-violet-soft">
          <feat.icon className="h-3.5 w-3.5" /> {feat.tag}
        </div>
        <h3 className="mt-4 text-3xl md:text-4xl tracking-tight font-medium">{feat.title}</h3>
        <p className="mt-4 text-muted-foreground leading-relaxed max-w-md">{feat.body}</p>
        <div className="mt-6 flex items-center gap-2 text-sm text-violet-soft">
          Learn more <ArrowRight className="h-4 w-4" />
        </div>
      </div>
      <div className="[direction:ltr] relative">
        <div className="absolute -inset-6 bg-primary/20 blur-3xl rounded-3xl" />
        <div className="relative glass-strong shadow-card p-5">{feat.mock}</div>
      </div>
    </motion.div>
  );
}

function RewardsMock() {
  const items = [
    { icon: Wallet, l: "Cash bonus", v: "₦25,000", tone: "text-emerald-reward" },
    { icon: Coffee, l: "Lunch voucher", v: "₦5,000", tone: "text-gold" },
    { icon: Bus, l: "Transport", v: "₦8,000", tone: "text-blue-analytics" },
    { icon: Gift, l: "Gift card", v: "Amazon", tone: "text-violet-soft" },
    { icon: GraduationCap, l: "Learning credit", v: "₦20,000", tone: "text-primary" },
    { icon: Wifi, l: "Internet data", v: "50GB", tone: "text-blue-analytics" },
  ];
  return (
    <div className="grid grid-cols-2 gap-2">
      {items.map((it, i) => (
        <motion.div
          key={it.l}
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.06 }}
          className="rounded-xl bg-white/[0.03] border border-white/5 p-3 flex items-center gap-3 hover:bg-white/[0.06] transition"
        >
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-white/5">
            <it.icon className={`h-4 w-4 ${it.tone}`} />
          </div>
          <div className="min-w-0">
            <div className="text-xs">{it.l}</div>
            <div className="text-[11px] text-muted-foreground truncate">{it.v}</div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function WalletMock() {
  return (
    <div className="space-y-3">
      <RewardWallet />
      <div className="rounded-xl bg-white/[0.03] border border-white/5 p-3">
        <div className="text-[11px] text-muted-foreground mb-2">Recent</div>
        {[
          { l: "Lunch voucher", v: "-₦5,000" },
          { l: "Sprint champion", v: "+₦15,000" },
          { l: "Internet data", v: "-50GB" },
        ].map((t) => (
          <div key={t.l} className="flex justify-between py-1.5 text-xs">
            <span className="text-muted-foreground">{t.l}</span>
            <span className="tabular-nums">{t.v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function FeedMock() { return <RecognitionFeed />; }

function GameMock() {
  return (
    <div className="space-y-3">
      <Leaderboard />
      <div className="grid grid-cols-3 gap-2">
        {[
          { i: Crown, l: "Champion", tone: "text-gold" },
          { i: Flame, l: "7-day streak", tone: "text-orange-400" },
          { i: Target, l: "Weekly quest", tone: "text-emerald-reward" },
        ].map((b) => (
          <div key={b.l} className="rounded-xl bg-white/[0.03] border border-white/5 p-3 text-center">
            <b.i className={`mx-auto h-5 w-5 ${b.tone}`} />
            <div className="mt-1 text-[10px] text-muted-foreground">{b.l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AIMock() {
  return (
    <div className="space-y-3">
      <AIRecommend />
      <AIRecommend />
    </div>
  );
}

function ApprovalMock() {
  return (
    <div className="space-y-2.5">
      {[
        { r: "Sprint Champion, Tunde", s: "Manager", ok: true },
        { r: "₦25,000 bonus, Ada", s: "Finance", ok: true },
        { r: "Team lunch, Design", s: "Pending", ok: false },
      ].map((a) => (
        <div key={a.r} className="rounded-xl bg-white/[0.03] border border-white/5 p-3 flex items-center justify-between">
          <div>
            <div className="text-xs">{a.r}</div>
            <div className="text-[10px] text-muted-foreground">{a.s}</div>
          </div>
          <span className={`text-[10px] rounded-full px-2 py-0.5 border ${a.ok ? "bg-emerald-reward/15 text-emerald-reward border-emerald-reward/30" : "bg-white/5 text-muted-foreground border-white/10"}`}>
            {a.ok ? "Approved" : "Pending"}
          </span>
        </div>
      ))}
    </div>
  );
}

function AnalyticsMock() {
  const bars = [40, 65, 52, 78, 60, 88, 72];
  return (
    <div>
      <div className="flex items-end justify-between gap-1.5 h-32">
        {bars.map((b, i) => (
          <motion.div
            key={i}
            initial={{ height: 0 }}
            whileInView={{ height: `${b}%` }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08, duration: 0.6 }}
            className="w-full rounded-t-md"
            style={{ background: "linear-gradient(180deg, var(--brand-bright), var(--brand))" }}
          />
        ))}
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {[
          { l: "Engagement", v: "94%", t: "text-emerald-reward" },
          { l: "Retention", v: "+18%", t: "text-blue-analytics" },
          { l: "Spend", v: "₦412k", t: "text-gold" },
        ].map((s) => (
          <div key={s.l} className="rounded-xl bg-white/[0.03] p-2.5 text-center">
            <div className={`text-sm font-semibold ${s.t}`}>{s.v}</div>
            <div className="text-[10px] text-muted-foreground">{s.l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- TESTIMONIALS ---------------- */
function Testimonials() {
  const items = [
    { quote: "Prodily changed how we run our team. Recognition is no longer an afterthought, it's a habit.", name: "Chidinma Eze", role: "Head of People, Lumen" },
    { quote: "Our engagement scores jumped 34% in the first quarter. Employees actually look forward to Fridays now.", name: "Adewale Bakare", role: "Founder, Northwind" },
    { quote: "Finance loves the budget controls. Managers love the speed. Employees love the rewards. Rare wins.", name: "Fatima Yusuf", role: "COO, Acme Co" },
  ];
  return (
    <section className="py-24 md:py-32 border-t border-white/5">
      <div className="mx-auto max-w-7xl px-6">
        <div className="max-w-2xl">
          <div className="text-xs uppercase tracking-widest text-violet-soft">Loved by teams</div>
          <h2 className="mt-3 text-4xl md:text-5xl tracking-tight font-medium">
            Culture leaders <span className="italic font-display gradient-text">choose Prodily.</span>
          </h2>
        </div>
        <div className="mt-12 grid md:grid-cols-3 gap-5">
          {items.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: i * 0.1 }}
              className="glass-strong p-6 flex flex-col"
            >
              <div className="flex gap-0.5 text-gold">
                {Array.from({ length: 5 }).map((_, k) => (
                  <Star key={k} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <p className="mt-4 text-base leading-relaxed">&quot;{t.quote}&quot;</p>
              <div className="mt-6 flex items-center gap-3 pt-6 border-t border-white/10">
                <div className="grid h-10 w-10 place-items-center rounded-full gradient-primary text-sm font-semibold">
                  {t.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div>
                  <div className="text-sm font-medium">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- HOW IT WORKS ---------------- */
function HowItWorks() {
  const steps = [
    { n: "01", t: "Recognize", d: "Instantly, from Slack, dashboard or mobile.", icon: Sparkles },
    { n: "02", t: "Reward", d: "Cash, perks, gift cards or custom rewards.", icon: Gift },
    { n: "03", t: "Retain", d: "Watch culture, engagement and retention climb.", icon: TrendingUp },
  ];
  return (
    <section className="py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center max-w-xl mx-auto">
          <div className="text-xs uppercase tracking-widest text-violet-soft">How it works</div>
          <h2 className="mt-3 text-4xl md:text-5xl tracking-tight font-medium">
            Three steps. <span className="italic font-display gradient-text">One culture shift.</span>
          </h2>
        </div>
        <div className="mt-16 grid md:grid-cols-3 gap-6 relative">
          {steps.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="glass-strong p-8 text-center relative"
            >
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl gradient-primary shadow-glow">
                <s.icon className="h-6 w-6 text-white" />
              </div>
              <div className="mt-6 text-xs text-muted-foreground tracking-widest">{s.n}</div>
              <h3 className="mt-2 text-2xl font-medium">{s.t}</h3>
              <p className="mt-3 text-sm text-muted-foreground">{s.d}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- FAQ ---------------- */
function FAQ() {
  const qas = [
    ["Can we use our own reward policies?", "Yes. Prodily is fully configurable, set eligibility, categories, budgets and approval rules to match your policies."],
    ["Do rewards have to be cash?", "No. Choose from cash, lunch, transport, gift cards, learning credits, internet, wellness, merch and more, or design custom rewards."],
    ["Can employees redeem rewards?", "Yes. Employees have a personal wallet where they redeem, withdraw eligible cash and view history."],
    ["Can managers approve rewards?", "Absolutely. Set granular approval flows across managers, departments and finance with clear audit trails."],
    ["Can departments have separate budgets?", "Yes. Each department gets its own budget with spending limits, alerts and full visibility."],
    ["Will this replace our HR software?", "No. Prodily plugs into your existing HRIS, we focus on what HR tools were never built for: real-time recognition and rewards."],
  ];
  return (
    <section className="py-24 md:py-32 border-t border-white/5">
      <div className="mx-auto max-w-3xl px-6">
        <div className="text-center">
          <div className="text-xs uppercase tracking-widest text-violet-soft">FAQ</div>
          <h2 className="mt-3 text-4xl md:text-5xl tracking-tight font-medium">
            Answers before <span className="italic font-display gradient-text">you ask.</span>
          </h2>
        </div>
        <Accordion type="single" collapsible className="mt-12 space-y-3">
          {qas.map(([q, a], i) => (
            <AccordionItem key={i} value={`i${i}`} className="glass px-5 border-none">
              <AccordionTrigger className="text-left text-base hover:no-underline py-5">{q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-sm leading-relaxed pb-5">{a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

/* ---------------- FINAL CTA ---------------- */
function FinalCTA() {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(50);
  const my = useMotionValue(50);
  const smx = useSpring(mx, { stiffness: 80, damping: 20 });
  const smy = useSpring(my, { stiffness: 80, damping: 20 });
  const gx = useTransform(smx, (v) => `${v}%`);
  const gy = useTransform(smy, (v) => `${v}%`);
  return (
    <section id="pricing" className="py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          ref={ref}
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            mx.set(((e.clientX - rect.left) / rect.width) * 100);
            my.set(((e.clientY - rect.top) / rect.height) * 100);
          }}
          className="relative overflow-hidden rounded-[2rem] border border-white/10 p-10 md:p-16 text-center"
          style={{
            background:
              "radial-gradient(600px 300px at var(--x) var(--y), rgba(85,211,150,0.35), transparent 60%), linear-gradient(135deg, var(--brand-600), #06180f)",
            ...({
              "--x": gx,
              "--y": gy,
            } as any),
          }}
        >
          {[
            { i: Trophy, x: "10%", y: "20%", tone: "text-gold" },
            { i: Sparkles, x: "85%", y: "18%", tone: "text-white" },
            { i: Gift, x: "80%", y: "75%", tone: "text-emerald-reward" },
            { i: Medal, x: "12%", y: "72%", tone: "text-gold" },
            { i: Flame, x: "50%", y: "8%", tone: "text-orange-400" },
          ].map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.6 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              style={{ left: f.x, top: f.y }}
              className={`absolute animate-float ${f.tone}`}
            >
              <f.i className="h-6 w-6 md:h-8 md:w-8 drop-shadow-[0_0_16px_currentColor] opacity-80" />
            </motion.div>
          ))}

          <div className="relative">
            <h2 className="text-4xl md:text-6xl tracking-tight font-medium max-w-3xl mx-auto">
              Great work deserves more than a{" "}
              <span className="italic font-display">&quot;well done.&quot;</span>
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-white/70">
              Build a workplace where employees feel seen, appreciated and motivated every single day.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button asChild size="lg" className="rounded-full bg-white text-primary hover:bg-white/90 h-12 px-6 font-medium">
                <Link href="/signup">Book a Demo <ArrowRight className="ml-1 h-4 w-4" /></Link>
              </Button>
              <Button asChild size="lg" variant="ghost" className="rounded-full h-12 px-6 border border-white/25 text-white hover:bg-white/10">
                <a href="mailto:contact@prodily.tech">Talk to Sales</a>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ---------------- FOOTER ---------------- */
function Footer() {
  return (
    <footer className="relative isolate overflow-hidden border-t border-white/5">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-8 h-56 md:h-72 opacity-70 wave-fallback"
        style={{
          maskImage: "linear-gradient(to bottom, black, transparent)",
          WebkitMaskImage: "linear-gradient(to bottom, black, transparent)",
        }}
      />
      <div className="relative mx-auto max-w-7xl px-6 pt-40 md:pt-48 pb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-xs text-muted-foreground/80">
        <div className="flex items-center gap-3">
          <Logo size={22} withWordmark />
          <span className="hidden sm:inline">© {new Date().getFullYear()}</span>
        </div>
        <nav className="flex items-center gap-5">
          <a href="#features" className="hover:text-foreground transition">Features</a>
          <Link href="/privacy" className="hover:text-foreground transition">Privacy</Link>
          <Link href="/terms" className="hover:text-foreground transition">Terms</Link>
        </nav>
      </div>
    </footer>
  );
}
