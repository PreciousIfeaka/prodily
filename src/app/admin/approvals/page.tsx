import { redirect } from "next/navigation";

// The real approvals queue lives on the admin dashboard. This route previously
// rendered a separate mock queue (AdminContext + lib/data) that could conflict
// with the live queue, so it now redirects to the single source of truth.
export default function ApprovalsRedirect() {
  redirect("/admin");
}
