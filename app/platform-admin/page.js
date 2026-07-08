import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import PlatformAdminQueue from "@/components/PlatformAdminQueue";

export default async function PlatformAdminPage() {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_platform_admin, full_name")
    .eq("id", user.id)
    .single();

  if (!profile?.is_platform_admin) redirect("/dashboard");

  return <PlatformAdminQueue adminName={profile.full_name} />;
}