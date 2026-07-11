import { createClient } from "@/lib/supabase-client";
import { ROLE_TABLES } from "@/lib/profile-queries";

// Roles that require admin approval (owner is instant, not included here)
export const APPROVAL_ROLES = ["agent", "agency", "developer", "property_manager"];

// Platform-wide stats for the admin Overview tab
export async function fetchPlatformStats() {
  const supabase = createClient();

  const [
    { count: totalUsers },
    { count: totalListings },
    { count: activeListings },
    { count: pendingListings },
    { count: activeAgents },
    { count: totalEnquiries },
    pendingCounts,
  ] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("listings").select("id", { count: "exact", head: true }),
    supabase.from("listings").select("id", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("listings").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("agents").select("id", { count: "exact", head: true }),
    supabase.from("enquiries").select("id", { count: "exact", head: true }),
    fetchPendingCounts(),
  ]);

  const totalPending = Object.values(pendingCounts).reduce((sum, n) => sum + n, 0);

  return {
    totalUsers: totalUsers || 0,
    totalListings: totalListings || 0,
    activeListings: activeListings || 0,
    pendingListings: pendingListings || 0,
    activeAgents: activeAgents || 0,
    totalEnquiries: totalEnquiries || 0,
    totalPending: totalPending,
    pendingByRole: pendingCounts,
  };
}

// ---- Listing moderation ----

export async function fetchPendingListings() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("listings")
    .select("*, listing_images(url, sort_order), agents(full_name, company, email, phone)")
    .eq("status", "pending")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function approveListing(listingId) {
  const supabase = createClient();
  const { error } = await supabase.from("listings").update({ status: "active" }).eq("id", listingId);
  if (error) throw error;
  return true;
}

export async function rejectListing(listingId, reason = null) {
  const supabase = createClient();
  const { error } = await supabase
    .from("listings")
    .update({ status: "rejected", rejection_reason: reason })
    .eq("id", listingId);
  if (error) throw error;
  return true;
}

// ---- User management ----

const ROLE_TABLE_MAP = {
  owner: "owner_profiles",
  agent: "agent_profiles",
  agency: "agency_profiles",
  developer: "developer_profiles",
  property_manager: "property_manager_profiles",
};

// Fetch all registered users (profiles), optionally filtered by a search term
// matching name or email, with their role badges attached.
export async function fetchAllUsers(searchTerm = "") {
  const supabase = createClient();

  let query = supabase
    .from("profiles")
    .select("id, full_name, email, phone, is_platform_admin, created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  if (searchTerm) {
    query = query.or(`full_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);
  }

  const { data: profiles, error } = await query;
  if (error) throw error;
  if (!profiles || profiles.length === 0) return [];

  const ids = profiles.map((p) => p.id);

  const [ownerRows, agentRows, agencyRows, developerRows, pmRows] = await Promise.all([
    supabase.from("owner_profiles").select("id").in("id", ids),
    supabase.from("agent_profiles").select("id, status").in("id", ids),
    supabase.from("agency_profiles").select("id, status").in("id", ids),
    supabase.from("developer_profiles").select("id, status").in("id", ids),
    supabase.from("property_manager_profiles").select("id, status").in("id", ids),
  ]);

  const roleMapFor = (rows) => {
    const map = {};
    (rows.data || []).forEach((r) => { map[r.id] = r.status || "active"; });
    return map;
  };

  const owners = new Set((ownerRows.data || []).map((r) => r.id));
  const agents = roleMapFor(agentRows);
  const agencies = roleMapFor(agencyRows);
  const developers = roleMapFor(developerRows);
  const pms = roleMapFor(pmRows);

  return profiles.map((p) => {
    const roles = [];
    if (p.is_platform_admin) roles.push({ label: "Admin", status: "approved" });
    if (owners.has(p.id)) roles.push({ label: "Owner", status: "approved" });
    if (agents[p.id]) roles.push({ label: "Agent", status: agents[p.id] });
    if (agencies[p.id]) roles.push({ label: "Agency", status: agencies[p.id] });
    if (developers[p.id]) roles.push({ label: "Developer", status: developers[p.id] });
    if (pms[p.id]) roles.push({ label: "Property Manager", status: pms[p.id] });
    if (roles.length === 0) roles.push({ label: "Buyer", status: "approved" });

    return { ...p, roles };
  });
}

// Fetch every application for a role, newest first, joined with the
// applicant's name/email/phone from profiles.
export async function fetchApplications(role, status = null) {
  const supabase = createClient();
  const table = ROLE_TABLES[role];
  if (!table) throw new Error(`Unknown role: ${role}`);

  let query = supabase
    .from(table)
    .select("*, profiles!inner(full_name, email, phone)")
    .order("submitted_at", { ascending: false });

  if (status) query = query.eq("status", status);

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

// Fetch pending counts for all approval-required roles at once (for badges/tabs)
export async function fetchPendingCounts() {
  const supabase = createClient();
  const counts = {};
  await Promise.all(
    APPROVAL_ROLES.map(async (role) => {
      const { count, error } = await supabase
        .from(ROLE_TABLES[role])
        .select("id", { count: "exact", head: true })
        .eq("status", "pending");
      counts[role] = error ? 0 : count || 0;
    })
  );
  return counts;
}

// Approve an application. Bridges into the legacy `agents` table for
// ALL professional roles (agent, agency, developer, property_manager) so
// they get immediate access to the existing listings/enquiries dashboard
// at /admin — it's generic and works for any role.
export async function approveApplication(role, userId, reviewerNote = null) {
  const supabase = createClient();
  const table = ROLE_TABLES[role];

  const { data: application, error: fetchErr } = await supabase
    .from(table)
    .select("*, profiles!inner(full_name, email, phone)")
    .eq("id", userId)
    .single();
  if (fetchErr) throw fetchErr;

  const { error } = await supabase
    .from(table)
    .update({ status: "approved", reviewed_at: new Date().toISOString(), review_note: reviewerNote })
    .eq("id", userId);
  if (error) throw error;

  const companyName = application.company || application.company_name || "";
  const { error: bridgeErr } = await supabase.from("agents").upsert({
    id: userId,
    company: companyName,
    full_name: application.profiles?.full_name || "",
    phone: application.profiles?.phone || application.contact_phone || "",
    email: application.profiles?.email || "",
  });
  if (bridgeErr) throw bridgeErr;

  return true;
}

export async function rejectApplication(role, userId, reviewerNote = null) {
  const supabase = createClient();
  const table = ROLE_TABLES[role];

  const { error } = await supabase
    .from(table)
    .update({ status: "rejected", reviewed_at: new Date().toISOString(), review_note: reviewerNote })
    .eq("id", userId);
  if (error) throw error;
  return true;
}

// Pull back a previously-approved application — removes their row from
// the legacy `agents` table so they immediately lose access to /admin.
export async function revokeApplication(role, userId, reviewerNote = null) {
  const supabase = createClient();
  const table = ROLE_TABLES[role];

  const { error } = await supabase
    .from(table)
    .update({ status: "rejected", reviewed_at: new Date().toISOString(), review_note: reviewerNote || "Revoked by admin" })
    .eq("id", userId);
  if (error) throw error;

  const { error: bridgeErr } = await supabase.from("agents").delete().eq("id", userId);
  if (bridgeErr) throw bridgeErr;

  return true;
}

// Fetch contact form submissions, newest first (platform admin only, per RLS)
export async function fetchContactMessages() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("contact_messages")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) {
    console.error("fetchContactMessages error:", error.message);
    return [];
  }
  return data ?? [];
}