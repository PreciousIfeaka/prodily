"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";
import confetti from "canvas-confetti";
import { Sparkle } from "lucide-react";

type ToastContextType = {
  toast: (msg: string) => void;
  celebrate: (msg: string) => void;
};

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [msg, setMsg] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const toast = useCallback((m: string) => {
    setMsg(m);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setMsg(null), 2400);
  }, []);

  const celebrate = useCallback(
    (m: string) => {
      toast(m);
      confetti({
        particleCount: 90,
        spread: 75,
        startVelocity: 45,
        origin: { y: 0.6 },
        colors: ["#6366f1", "#8b5cf6", "#fbbf24", "#10b981", "#f43f5e"],
      });
    },
    [toast]
  );

  return (
    <ToastContext.Provider value={{ toast, celebrate }}>
      {children}
      <div
        className={`fixed left-1/2 bottom-8 z-[999] -translate-x-1/2 transition-all duration-300 ${
          msg ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3 pointer-events-none"
        }`}
      >
        <div className="flex items-center gap-2 bg-ink text-white font-semibold text-sm px-5 py-3 rounded-2xl shadow-[0_18px_40px_-14px_rgba(26,20,64,0.5)]">
          <Sparkle size={16} className="text-gold" />
          <span>{msg}</span>
        </div>
      </div>
    </ToastContext.Provider>
  );
}
