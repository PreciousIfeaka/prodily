"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { getRoleHome, type SessionRole } from "@/lib/roles";

function getRoleFromCookie() {
  if (typeof window === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; session_role=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

function subscribeToRole() {
  return () => undefined;
}

export default function RoleGuard({
  allow,
  children,
}: {
  allow: SessionRole | SessionRole[];
  children: React.ReactNode;
}) {
  const router = useRouter();
  const role = useSyncExternalStore(subscribeToRole, getRoleFromCookie, () => null);
  const allowedRoles = Array.isArray(allow) ? allow : [allow];
  const authorized = role !== null && allowedRoles.includes(role as SessionRole);

  useEffect(() => {
    if (!authorized && role) {
      router.replace(getRoleHome(role));
    } else if (!role) {
      router.replace("/signin");
    }
  }, [authorized, role, router]);

  if (!authorized) return null;

  return <>{children}</>;
}
