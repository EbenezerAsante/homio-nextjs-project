import { createClient } from "@/lib/supabase-client";
import { fetchUnreadCount } from "@/lib/messaging-queries";

// Stats row: Saved Properties, Upcoming Viewings, Unread Messages
export async function fetchDashboardStats(userId) {
  const supabase = createClient();

  const [savedRes, viewingsRes, unread] = await Promise.all([
    supabase.from("favorites").select("id", { count: "exact", head: true }).eq("user_id", userId),
    supabase
      .from("appointments")
      .select("id", { count: "exact", head: true })
      .eq("buyer_id", userId)
      .in("status", ["pending", "confirmed"])
      .gte("requested_time", new Date().toISOString()),
    fetchUnreadCount(userId),
  ]);

  return {
    saved: savedRes.count || 0,
    upcomingViewings: viewingsRes.count || 0,
    unreadMessages: unread || 0,
  };
}

// Recent activity feed: merges favorites, enquiries, and appointments
// into one chronological list, most recent first.
export async function fetchRecentActivity(userId, limit = 6) {
  const supabase = createClient();

  const [favRes, enqRes, apptRes] = await Promise.all([
    supabase
      .from("favorites")
      .select("id, created_at, listings(title)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit),
    supabase
      .from("enquiries")
      .select("id, created_at, listings(title)")
      .eq("buyer_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit),
    supabase
      .from("appointments")
      .select("id, created_at, listings(title)")
      .eq("buyer_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit),
  ]);

  const items = [
    ...(favRes.data || []).map((r) => ({ type: "saved", at: r.created_at, label: `Saved ${r.listings?.title || "a property"}` })),
    ...(enqRes.data || []).map((r) => ({ type: "enquiry", at: r.created_at, label: `Enquired about ${r.listings?.title || "a property"}` })),
    ...(apptRes.data || []).map((r) => ({ type: "appointment", at: r.created_at, label: `Booked a viewing for ${r.listings?.title || "a property"}` })),
  ];

  items.sort((a, b) => new Date(b.at) - new Date(a.at));
  return items.slice(0, limit);
}