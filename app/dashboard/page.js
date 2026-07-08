import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase-server";
import BuyerDashboard from "../../components/BuyerDashboard";

export default async function DashboardPage() {
  const supabase = createClient();

  const { data } = await supabase.auth.getUser();
  const user = data?.user;

  if (!user) {
    redirect("/login");
  }

  // If this account is actually an agent, send them to the agent dashboard instead
  const { data: agentRow } = await supabase
    .from("agents")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (agentRow) {
    redirect("/admin");
  }

  return <BuyerDashboard user={user} />;
}