import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import { fetchOwnerTypeMap, withOwnerTypes } from "@/lib/badge-queries";
import { T } from "@/lib/constants";
import PropertyCard from "@/components/PropertyCard";
import ShareProfileButton from "@/components/ShareProfileButton";
import ReportAgentButton from "@/components/ReportAgentButton";
import { ShieldCheck, Phone, Mail, Home as HomeIcon, MessageCircle } from "lucide-react";

const LISTING_COLUMNS =
  "id, title, price, listing_type, tag, furnished, area, city, region, bedrooms, bathrooms, sqft, agent_id, latitude, longitude, location_visibility, created_at, listing_images(url, sort_order)";

const AVATAR_COLORS = ["#1B3A6B", "#C8961E", "#16A34A", "#7C3AED", "#DC2626", "#0891B2", "#9333EA", "#EA580C"];
function avatarColor(name) {
  const str = name || "?";
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export async function generateMetadata({ params }) {
  const supabase = createClient();
  const { data } = await supabase.from("agents").select("full_name, company").eq("id", params.id).maybeSingle();
  if (!data) return { title: "Not Found | Homio Ghana" };
  return { title: `${data.full_name}${data.company ? ` — ${data.company}` : ""} | Homio Ghana` };
}

export default async function AgentProfilePage({ params }) {
  const supabase = createClient();

  const { data: lister } = await supabase
    .from("agents")
    .select("id, full_name, company, phone, email")
    .eq("id", params.id)
    .maybeSingle();

  if (!lister) return notFound();

  const [ownerTypeMap, { data: listings }] = await Promise.all([
    fetchOwnerTypeMap(supabase),
    supabase
      .from("listings")
      .select(LISTING_COLUMNS)
      .eq("agent_id", params.id)
      .eq("status", "active")
      .order("created_at", { ascending: false }),
  ]);

  const ownerType = ownerTypeMap.get(lister.id) || null;
  const listingsWithBadges = withOwnerTypes(listings || [], ownerTypeMap);

  return (
    <div style={{ background: T.bg, minHeight: "80vh" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px" }}>
        <div style={{ background: "#fff", border: `1px solid ${T.border}`, borderRadius: 16, padding: 28, boxShadow: T.shadow, marginBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <div
              style={{
                width: 66, height: 66, borderRadius: "50%", flexShrink: 0,
                background: avatarColor(lister.full_name), color: "#fff",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: 800, fontSize: 24,
              }}
            >
              {(lister.full_name || "?").charAt(0).toUpperCase()}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <h1 style={{ color: T.navy, fontSize: 22, fontWeight: 900, margin: "0 0 4px" }}>{lister.full_name || "Unnamed"}</h1>
              {lister.company && <p style={{ color: T.gray2, fontSize: 14, margin: "0 0 8px" }}>{lister.company}</p>}
              <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                {ownerType?.verified && (
                  <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12.5, fontWeight: 700, color: T.green }}>
                    <ShieldCheck size={14} /> {ownerType.label}
                  </span>
                )}
                <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12.5, fontWeight: 700, color: T.gray2 }}>
                  <HomeIcon size={14} /> {listingsWithBadges.length} active listing{listingsWithBadges.length === 1 ? "" : "s"}
                </span>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, flexShrink: 0 }}>
              {lister.phone && (
                <a
                  href={`tel:${lister.phone}`}
                  style={{ display: "flex", alignItems: "center", gap: 8, background: T.gold, color: "#fff", borderRadius: 8, padding: "10px 16px", fontSize: 13.5, fontWeight: 700, textDecoration: "none" }}
                >
                  <Phone size={15} /> {lister.phone}
                </a>
              )}
              {lister.phone && (
                <a
                  href={`https://wa.me/${(() => {
                    const digits = lister.phone.replace(/\D/g, "");
                    return digits.startsWith("0") ? `233${digits.slice(1)}` : digits;
                  })()}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: "flex", alignItems: "center", gap: 8, background: "#25D366", color: "#fff", borderRadius: 8, padding: "10px 16px", fontSize: 13.5, fontWeight: 700, textDecoration: "none" }}
                >
                  <MessageCircle size={15} /> WhatsApp
                </a>
              )}
              {lister.email && (
                <a
                  href={`mailto:${lister.email}`}
                  style={{ display: "flex", alignItems: "center", gap: 8, border: `1.5px solid ${T.border}`, color: T.navy, borderRadius: 8, padding: "10px 16px", fontSize: 13.5, fontWeight: 700, textDecoration: "none" }}
                >
                  <Mail size={15} /> Email
                </a>
              )}
              <div style={{ display: "flex", gap: 8 }}>
                <ShareProfileButton name={lister.full_name} />
                <ReportAgentButton agentId={lister.id} agentName={lister.full_name} />
              </div>
            </div>
          </div>
        </div>

        <h2 style={{ color: T.navy, fontSize: 18, fontWeight: 800, margin: "0 0 16px" }}>
          Active Listings
        </h2>
        {listingsWithBadges.length === 0 ? (
          <div style={{ textAlign: "center", color: T.gray2, padding: 40, background: "#fff", borderRadius: 12, border: `1px dashed ${T.border}` }}>
            No active listings from {lister.full_name || "this lister"} right now.
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 20 }}>
            {listingsWithBadges.map((l) => (
              <PropertyCard key={l.id} p={l} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}