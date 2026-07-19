import { redirect } from "next/navigation";
import { session } from "@/lib/data";

export default function Home() {
  redirect(session.role === "admin" ? "/admin" : "/employee");
}
