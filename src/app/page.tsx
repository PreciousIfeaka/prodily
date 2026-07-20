import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getMeAction } from "@/app/actions/auth";
import { getRoleHome } from "@/lib/roles";

export default async function Home() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;

  if (!token) {
    redirect("/signin");
  }

  const me = await getMeAction();
  if (!me) {
    redirect("/signin");
  }

  const role = me.userRole || me.role;
  redirect(getRoleHome(role));
}
