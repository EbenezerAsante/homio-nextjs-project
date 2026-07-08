import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import AdminDashboard from "@/components/AdminDashboard";

export default async function OwnerDashboardPage() {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Must have activated the owner role first
  const { data: ownerRow } = await supabase
    .from("owner_profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (!ownerRow) redirect("/dashboard/apply/owner");

  const { data: agent } = await supabase
    .from("agents")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  return <AdminDashboard agent={agent} userId={user.id} />;
}