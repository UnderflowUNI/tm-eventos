import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import AdminDashboard from "./AdminDashboard";

export default async function AdminPage() {
  const session = await getSession();
  if (!session) redirect("/painel/login");

  return <AdminDashboard userName={session.name} />;
}
