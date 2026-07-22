import { createClient } from "@/lib/supabase-server";
import { fetchOwnerTypeMap } from "@/lib/badge-queries";
import { T } from "@/lib/constants";
import AgentDirectoryClient from "@/components/AgentDirectoryClient";

export const metadata = { title: "Find an Agent | Homio Ghana" };
export const revalidate = 120;

export default async function AgentsDirectoryPage() {
  const supabase = createClient();

  const [{ data: listers }, ownerTypeMap, { data: activeListings }] = await Promise.all([
    supabase.from("agents").select("id, full_name, company, phone, email"),
    fetchOwnerTypeMap(supabase),
    supabase.from("listings").select("agent_id, region").eq("status", "active"),
  ]);

  const countByAgent = {};
  const regionsByAgent = {};
  (activeListings || []).forEach((l) => {
    countByAgent[l.agent_id] = (countByAgent[l.agent_id] || 0) + 1;
    if (l.region) {
      if (!regionsByAgent[l.agent_id]) regionsByAgent[l.agent_id] = new Set();
      regionsByAgent[l.agent_id].add(l.region);
    }
  });

  const enriched = (listers || [])
    .map((l) => ({
      ...l,
      ownerType: ownerTypeMap.get(l.id) || null,
      listingCount: countByAgent[l.id] || 0,
      regions: regionsByAgent[l.id] ? [...regionsByAgent[l.id]] : [],
    }))
    .sort((a, b) => b.listingCount - a.listingCount);

  const allRegions = [...new Set(enriched.flatMap((l) => l.regions))].sort();

  return (
    <div style={{ background: T.bg, minHeight: "80vh" }}>
      <div style={{ background: T.navy, padding: "56px 24px 40px", textAlign: "center" }}>
        <p style={{ color: T.gold, fontWeight: 700, fontSize: 11, letterSpacing: 2, textTransform: "uppercase", margin: "0 0 10px" }}>
          Directory
        </p>
        <h1 style={{ color: "#fff", fontWeight: 900, fontSize: 30, margin: "0 auto 10px", maxWidth: 560, fontFamily: "var(--font-heading), Georgia, serif" }}>
          Find an Agent or Agency
        </h1>
        <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 14, maxWidth: 480, margin: "0 auto" }}>
          Know who you're looking for? Search Homio's verified agents, agencies, developers, and
          property managers by name or company.
        </p>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px 64px" }}>
        <AgentDirectoryClient listers={enriched} allRegions={allRegions} />
      </div>
    </div>
  );
}