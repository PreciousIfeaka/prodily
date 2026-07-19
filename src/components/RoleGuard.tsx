"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { session } from "@/lib/data";

/**
 * Restricts a section to a single role. If the signed-in user's role
 * doesn't match, they're redirected to their own home — they never see
 * even a flash of the other section's content or nav.
 *
 * This checks the local `session` stand-in; swap it for a real auth/role
 * check (e.g. server-side in middleware) once auth is wired up.
 */
export default function RoleGuard({
  allow,
  children,
}: {
  allow: "employee" | "admin";
  children: React.ReactNode;
}) {
  const router = useRouter();
  const authorized = session.role === allow;

  useEffect(() => {
    if (!authorized) {
      router.replace(session.role === "admin" ? "/admin" : "/employee");
    }
  }, [authorized, router]);

  if (!authorized) return null;

  return <>{children}</>;
}
