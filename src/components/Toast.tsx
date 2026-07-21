"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";
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
        <div className="flex items-center gap-2 bg-[var(--surface-3)] text-[var(--text)] font-medium text-sm px-5 py-3 rounded-[var(--r-lg)] border border-[var(--line-2)] shadow-[var(--sh-lg)]">
          <Sparkle size={16} className="text-[var(--brand-bright)]" />
          <span>{msg}</span>
        </div>
      </div>
    </ToastContext.Provider>
  );
}
