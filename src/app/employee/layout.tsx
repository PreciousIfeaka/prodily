"use client";

import RoleGuard from "@/components/RoleGuard";
import { EmployeeProvider } from "@/components/EmployeeContext";
import type { SessionRole } from "@/lib/roles";

const EMPLOYEE_ROLES: SessionRole[] = ["team_member", "team_lead"];

export default function EmployeeLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allow={EMPLOYEE_ROLES}>
      <EmployeeProvider>{children}</EmployeeProvider>
    </RoleGuard>
  );
}
