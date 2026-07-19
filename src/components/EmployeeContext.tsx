"use client";

import { createContext, useContext, useMemo, useState } from "react";
import { employee as initialEmployee, recentActivity as initialActivity, type Reward } from "@/lib/data";
import { useToast } from "@/components/Toast";

type ActivityItem = {
  id: number;
  title: string;
  subtitle: string;
  amount: number;
  tone: string;
  icon: string;
};

type EmployeeContextType = {
  points: number;
  activity: ActivityItem[];
  checkIn: () => void;
  redeem: (reward: Reward) => boolean;
};

const EmployeeContext = createContext<EmployeeContextType | null>(null);

export function useEmployee() {
  const ctx = useContext(EmployeeContext);
  if (!ctx) throw new Error("useEmployee must be used within EmployeeProvider");
  return ctx;
}

export function EmployeeProvider({ children }: { children: React.ReactNode }) {
  const [points, setPoints] = useState(initialEmployee.points);
  const [activity, setActivity] = useState<ActivityItem[]>(initialActivity);
  const { celebrate, toast } = useToast();
  const nextId = useMemo(() => {
    let n = Math.max(0, ...initialActivity.map((a) => a.id)) + 1;
    return () => n++;
  }, []);

  const checkIn = () => {
    setPoints((p) => p + 25);
    setActivity((a) => [
      { id: nextId(), title: "Daily check-in", subtitle: "Streak bonus · Just now", amount: 25, tone: "gold", icon: "flame" },
      ...a,
    ]);
    celebrate("Checked in! +25 pts 🔥");
  };

  const redeem = (reward: Reward) => {
    if (points < reward.cost) {
      toast(`Not enough points for ${reward.name} · need ${reward.cost - points} more`);
      return false;
    }
    setPoints((p) => p - reward.cost);
    setActivity((a) => [
      {
        id: nextId(),
        title: `${reward.name} redeemed`,
        subtitle: "Marketplace · Just now",
        amount: -reward.cost,
        tone: "indigo",
        icon: reward.icon,
      },
      ...a,
    ]);
    celebrate(`${reward.name} redeemed! Check your email 🎉`);
    return true;
  };

  return (
    <EmployeeContext.Provider value={{ points, activity, checkIn, redeem }}>
      {children}
    </EmployeeContext.Provider>
  );
}
