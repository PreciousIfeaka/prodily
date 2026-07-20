"use client";

import RoleGuard from "@/components/RoleGuard";
import { AdminProvider } from "@/components/AdminContext";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allow="admin">
      <AdminProvider>{children}</AdminProvider>
    </RoleGuard>
  );
}
