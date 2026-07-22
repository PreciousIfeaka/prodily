"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/ui";
import { Sun, Moon } from "lucide-react";

export default function TopNav() {
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

  return (
    <div className="flex items-center justify-between gap-5 flex-wrap mb-7">
      <Link href="/" className="flex items-center gap-3">
        <Logo size={44} withWordmark subtitle="Reward & Recognition" />
      </Link>

      <div className="flex items-center gap-4">
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="p-2 text-muted-foreground hover:text-foreground transition cursor-pointer"
        >
          {isLight ? <Moon className="w-[18px] h-[18px]" /> : <Sun className="w-[18px] h-[18px] text-[var(--gold)]" />}
        </button>
        
        <div className="hidden sm:flex items-center gap-2 t-small text-[var(--muted)] font-medium">
          <span
            className="w-[7px] h-[7px] rounded-full bg-[var(--brand-bright)]"
            style={{ boxShadow: "0 0 0 4px var(--brand-tint)" }}
          />
          Live app
        </div>
      </div>
    </div>
  );
}
