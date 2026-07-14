import { createClient } from "@/lib/supabase-client";

// Table name for each role, keyed by the role id used across the app
export const ROLE_TABLES = {
  owner: "owner_profiles",
  agent: "agent_profiles",
  agency: "agency_profiles",
  developer: "developer_profiles",
  property_manager: "property_manager_profiles",
};

// Fetch the user's profile plus whatever role rows exist for them.
// Returns { profile, roles: { owner: row|null, agent: row|null, ... } }
export async function fetchUserRoles(userId) {
  const supabase = createClient();

  const [profileRes, ownerRes, agentRes, agencyRes, developerRes, pmRes] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
    supabase.from("owner_profiles").select("*").eq("id", userId).maybeSingle(),
    supabase.from("agent_profiles").select("*").eq("id", userId).maybeSingle(),
    supabase.from("agency_profiles").select("*").eq("id", userId).maybeSingle(),
    supabase.from("developer_profiles").select("*").eq("id", userId).maybeSingle(),
    supabase.from("property_manager_profiles").select("*").eq("id", userId).maybeSingle(),
  ]);

  return {
    profile: profileRes.data ?? null,
    roles: {
      owner: ownerRes.data ?? null,
      agent: agentRes.data ?? null,
      agency: agencyRes.data ?? null,
      developer: developerRes.data ?? null,
      property_manager: pmRes.data ?? null,
    },
  };
}

// Instantly activate the "owner" role — no approval needed.
// Also bridges into the legacy `agents` table so the existing
// listings/enquiries dashboard (AdminDashboard) works for owners too.
export async function activateOwnerRole(userId) {
  const supabase = createClient();

  const { error } = await supabase.from("owner_profiles").insert({ id: userId });
  if (error && error.code !== "23505") throw error; // ignore "already exists"

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email, phone")
    .eq("id", userId)
    .maybeSingle();

  const { error: bridgeErr } = await supabase.from("agents").upsert({
    id: userId,
    company: "",
    full_name: profile?.full_name || "",
    phone: profile?.phone || "",
    email: profile?.email || "",
  });
  if (bridgeErr) throw bridgeErr;

  return true;
}

// Submit an application for a role that requires admin approval
// (agent, agency, developer, property_manager). Uses upsert so someone
// who was previously rejected can resubmit — their old row is updated
// and its status reset to "pending" rather than blocked by a duplicate
// key error.
export async function submitRoleApplication(role, userId, fields) {
  const supabase = createClient();
  const table = ROLE_TABLES[role];
  if (!table) throw new Error(`Unknown role: ${role}`);

  const { error } = await supabase.from(table).upsert({
    id: userId,
    ...fields,
    status: "pending",
    submitted_at: new Date().toISOString(),
    reviewed_at: null,
  });
  if (error) throw error;
  return true;
}