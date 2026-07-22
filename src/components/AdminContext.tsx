"use client";

import { createContext, useContext, useMemo, useState } from "react";
import { approvalRows as initialApprovalRows, fraudFlags } from "@/lib/data";

type ApprovalRow = (typeof initialApprovalRows)[number];
type FraudStatus = "Cleared" | "Blocked";

const OPEN_APPROVAL_STATUSES = new Set(["Pending", "Team Lead"]);

type AdminContextType = {
  approvalRows: ApprovalRow[];
  setApprovalStatus: (id: number, status: string) => void;
  pendingApprovalsCount: number;

  fraudStatuses: Record<number, FraudStatus | undefined>;
  setFraudStatus: (id: number, status: FraudStatus) => void;
  pendingFraudCount: number;
  pendingFraudAmount: number;
};

const AdminContext = createContext<AdminContextType | null>(null);

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used within AdminProvider");
  return ctx;
}

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [approvalRows, setApprovalRows] = useState(initialApprovalRows);
  const [fraudStatuses, setFraudStatuses] = useState<Record<number, FraudStatus | undefined>>({});

  const setApprovalStatus = (id: number, status: string) => {
    setApprovalRows((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
  };

  const setFraudStatus = (id: number, status: FraudStatus) => {
    setFraudStatuses((prev) => ({ ...prev, [id]: status }));
  };

  const pendingApprovalsCount = useMemo(
    () => approvalRows.filter((r) => OPEN_APPROVAL_STATUSES.has(r.status)).length,
    [approvalRows]
  );

  const pendingFraudCount = useMemo(
    () => fraudFlags.filter((f) => !fraudStatuses[f.id]).length,
    [fraudStatuses]
  );

  const pendingFraudAmount = useMemo(
    () => fraudFlags.filter((f) => !fraudStatuses[f.id]).reduce((sum, f) => sum + f.amount, 0),
    [fraudStatuses]
  );

  return (
    <AdminContext.Provider
      value={{
        approvalRows,
        setApprovalStatus,
        pendingApprovalsCount,
        fraudStatuses,
        setFraudStatus,
        pendingFraudCount,
        pendingFraudAmount,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}
