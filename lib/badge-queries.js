// Returns true if this user has an APPROVED professional role (agent,
// agency, developer, or property manager) — meaning they've already been
// vetted once through the platform admin approval queue. Individual
// owners are NOT trusted by this check, since owner activation is instant
// and skips admin review entirely.
export async function isTrustedLister(supabase, userId) {
  const [agent, agency, developer, pm] = await Promise.all([
    supabase.from("agent_profiles").select("id").eq("id", userId).eq("status", "approved").maybeSingle(),
    supabase.from("agency_profiles").select("id").eq("id", userId).eq("status", "approved").maybeSingle(),
    supabase.from("developer_profiles").select("id").eq("id", userId).eq("status", "approved").maybeSingle(),
    supabase.from("property_manager_profiles").select("id").eq("id", userId).eq("status", "approved").maybeSingle(),
  ]);
  return !!(agent.data || agency.data || developer.data || pm.data);
}

// Returns a Map of agent_id -> { label, verified } for every approved
// professional role and every individual owner. Fetched in 5 queries
// total (not per-listing), so it's safe to call once per page load.
// Pass in either the server or browser Supabase client.
export async function fetchOwnerTypeMap(supabase) {
  const [agents, agencies, developers, pms, owners] = await Promise.all([
    supabase.from("agent_profiles").select("id").eq("status", "approved"),
    supabase.from("agency_profiles").select("id").eq("status", "approved"),
    supabase.from("developer_profiles").select("id").eq("status", "approved"),
    supabase.from("property_manager_profiles").select("id").eq("status", "approved"),
    supabase.from("owner_profiles").select("id"),
  ]);

  const map = new Map();
  (owners.data || []).forEach((r) => map.set(r.id, { label: "Individual Owner", verified: false }));
  (pms.data || []).forEach((r) => map.set(r.id, { label: "Verified Property Manager", verified: true }));
  (developers.data || []).forEach((r) => map.set(r.id, { label: "Verified Developer", verified: true }));
  (agencies.data || []).forEach((r) => map.set(r.id, { label: "Verified Agency", verified: true }));
  // Agents last so a person who is both an owner AND an approved agent
  // shows the professional badge, which is the more specific status.
  (agents.data || []).forEach((r) => map.set(r.id, { label: "Verified Agent", verified: true }));

  return map;
}

// Convenience: attach ownerType onto each listing in an array
export function withOwnerTypes(listings, ownerTypeMap) {
  return listings.map((l) => ({ ...l, ownerType: ownerTypeMap.get(l.agent_id) || null }));
}