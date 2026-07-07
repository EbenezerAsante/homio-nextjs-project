import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import AdminDashboard from "@/components/AdminDashboard";

export default async function AdminPage() {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: agent } = await supabase
    .from("agents")
    .select("*")
    .eq("id", user.id)
    .single();

  return <AdminDashboard agent={agent} userId={user.id} />;
}
