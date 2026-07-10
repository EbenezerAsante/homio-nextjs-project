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
    { count: activeAgents },
    { count: totalEnquiries },
    pendingCounts,
  ] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("listings").select("id", { count: "exact", head: true }),
    supabase.from("listings").select("id", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("agents").select("id", { count: "exact", head: true }),
    supabase.from("enquiries").select("id", { count: "exact", head: true }),
    fetchPendingCounts(),
  ]);

  const totalPending = Object.values(pendingCounts).reduce((sum, n) => sum + n, 0);

  return {
    totalUsers: totalUsers || 0,
    totalListings: totalListings || 0,
    activeListings: activeListings || 0,
    activeAgents: activeAgents || 0,
    totalEnquiries: totalEnquiries || 0,
    totalPending,
    pendingByRole: pendingCounts,
  };
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