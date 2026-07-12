import { notFound } from "next/navigation";
import { createClient } from "../../../lib/supabase-server";
import { T, fmt, CAT_LABEL, getCoords } from "../../../lib/constants";
import { getDisplayCoords } from "../../../lib/location-utils";
import EnquiryForm from "../../../components/EnquiryForm";
import AppointmentBooking from "../../../components/AppointmentBooking";
import CollapsibleLocationSection from "../../../components/CollapsibleLocationSection";
import PropertyGallery from "../../../components/PropertyGallery";
import MortgageCalculator from "../../../components/MortgageCalculator";
import StickyContactBar from "../../../components/StickyContactBar";

export const revalidate = 30;

export default async function PropertyDetail({ params }) {
  const supabase = createClient();

  const { data: p } = await supabase
    .from("listings")
    .select("*, listing_images(url, sort_order), agents(full_name, company, phone, email)")
    .eq("id", params.id)
    .single();

  if (!p) return notFound();

  // Figure out who's looking at this listing, once, up front — reused for
  // the pending/rejected/suspended visibility gate AND the location privacy bypass.
  const { data: { user: currentUser } } = await supabase.auth.getUser();
  const currentUserId = currentUser?.id;
  const isOwner = currentUserId === p.agent_id;

  let isAdmin = false;
  if (currentUserId && !isOwner) {
    const { data: profileRow } = await supabase
      .from("profiles")
      .select("is_platform_admin")
      .eq("id", currentUserId)
      .maybeSingle();
    isAdmin = !!profileRow?.is_platform_admin;
  }

  // Non-active listings (pending review / rejected / suspended) are hidden
  // from the public, but the agent who owns the listing, or a platform
  // admin, can preview them. Suspended listings get a friendlier
  // "unavailable" message instead of a blank 404.
  if (p.status !== "active" && !isOwner && !isAdmin) {
    if (p.status === "suspended") {
      return (
        <div style={{ background: T.bg, minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div style={{ background: "#fff", borderRadius: 12, padding: "48px 32px", maxWidth: 440, textAlign: "center", border: `1px solid ${T.border}` }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🏠</div>
            <h1 style={{ color: T.navy, fontSize: 20, fontWeight: 800, margin: "0 0 10px" }}>
              This listing is currently unavailable
            </h1>
            <p style={{ color: T.gray2, fontSize: 14, lineHeight: 1.6, margin: 0 }}>
              It may have been temporarily hidden or removed by the owner or Homio.
            </p>
          </div>
        </div>
      );
    }
    return notFound();
  }

  // increment view count (best-effort, ignore errors)
  await supabase.from("listings").update({ view_count: (p.view_count || 0) + 1 }).eq("id", p.id);

  const images = p.listing_images?.length
    ? [...p.listing_images].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)).map((i) => i.url)
    : [];

  // Does the current viewer have a confirmed viewing for this listing?
  // Only matters when location_visibility is "hidden_until_viewing".
  let hasConfirmedViewing = false;
  if (currentUserId) {
    const { data: confirmedAppt } = await supabase
      .from("appointments")
      .select("id")
      .eq("listing_id", p.id)
      .eq("buyer_id", currentUserId)
      .eq("status", "confirmed")
      .maybeSingle();
    hasConfirmedViewing = !!confirmedAppt;
  }

  const fallbackCoords = getCoords(p.city, p.region);
  const displayCoords = getDisplayCoords(
    { ...p, latitude: p.latitude ?? fallbackCoords[0], longitude: p.longitude ?? fallbackCoords[1] },
    hasConfirmedViewing,
    isOwner || isAdmin // owner/admin always see the exact pin, regardless of privacy setting
  );

  return (
    <div className="homio-property-page" style={{ background: T.bg, minHeight: "90vh" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "28px 24px" }}>
        {isAdmin && p.status !== "active" && (
          <div style={{ background: "#FEF3C7", border: "1px solid #FCD34D", borderRadius: 8, padding: "10px 16px", marginBottom: 16, fontSize: 13, color: "#92400E", fontWeight: 600 }}>
            🛠 Admin preview — this listing is "{p.status}" and not yet visible to the public. The map below shows the exact location for review purposes.
          </div>
        )}
        <div className="homio-detail-layout" style={{ display: "flex", gap: 28, alignItems: "flex-start", flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 620px", minWidth: 0 }}>
            <div style={{ marginBottom: 20 }}>
              <PropertyGallery images={images} title={p.title} />
            </div>

            {p.video_url && (
              <div style={{ background: "#fff", borderRadius: 10, padding: 24, marginBottom: 16, border: `1px solid ${T.border}` }}>
                <h3 style={{ margin: "0 0 16px", color: T.navy, fontSize: 16 }}>Video Tour</h3>
                {/youtube\.com|youtu\.be|vimeo\.com/.test(p.video_url) ? (
                  <div style={{ position: "relative", paddingTop: "56.25%", borderRadius: 8, overflow: "hidden" }}>
                    <iframe
                      src={p.video_url.replace("watch?v=", "embed/")}
                      style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <video src={p.video_url} controls style={{ width: "100%", borderRadius: 8 }} />
                )}
              </div>
            )}

            <div style={{ background: "#fff", borderRadius: 10, padding: 24, marginBottom: 16, border: `1px solid ${T.border}` }}>
              <h1 style={{ color: T.navy, fontWeight: 900, fontSize: 24, margin: "0 0 6px" }}>{p.title}</h1>
              <p style={{ color: T.gray2, margin: "0 0 14px", fontSize: 14 }}>📍 {p.area ? `${p.area}, ` : ""}{p.city}, {p.region}</p>
              <div style={{ fontSize: 32, fontWeight: 900, color: T.gold }}>
                {fmt(p.price, p.listing_type)}
                {p.listing_type === "rent" && <span style={{ fontSize: 16, color: T.gray2, fontWeight: 400 }}> per month</span>}
              </div>
            </div>

            <div style={{ background: "#fff", borderRadius: 10, padding: 24, marginBottom: 16, border: `1px solid ${T.border}` }}>
              <h3 style={{ margin: "0 0 16px", color: T.navy, fontSize: 16 }}>Key Details</h3>
              <div className="homio-key-details" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {p.bedrooms > 0 && <Stat label="🛏 Bedrooms" value={p.bedrooms} />}
                {p.bathrooms > 0 && <Stat label="🚿 Bathrooms" value={p.bathrooms} />}
                {p.sqft > 0 && <Stat label="📐 Floor Area" value={`${p.sqft.toLocaleString()} sqft`} />}
                {p.plot_size && <Stat label="🗺 Plot Size" value={p.plot_size} />}
                <Stat label="🏷 Type" value={CAT_LABEL[p.category] || p.category} />
              </div>
            </div>

            {p.listing_type === "sale" && <MortgageCalculator price={p.price} />}

            {p.description && (
              <div style={{ background: "#fff", borderRadius: 10, padding: 24, marginBottom: 16, border: `1px solid ${T.border}` }}>
                <h3 style={{ margin: "0 0 12px", color: T.navy, fontSize: 16 }}>About This Property</h3>
                <p style={{ color: T.gray1, lineHeight: 1.8, margin: 0, fontSize: 14 }}>{p.description}</p>
              </div>
            )}

            {p.amenities?.length > 0 && (
              <div style={{ background: "#fff", borderRadius: 10, padding: 24, marginBottom: 16, border: `1px solid ${T.border}` }}>
                <h3 style={{ margin: "0 0 14px", color: T.navy, fontSize: 16 }}>Amenities</h3>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {p.amenities.map((a) => (
                    <span key={a} style={{ background: T.bg, border: `1px solid ${T.border}`, borderRadius: 6, padding: "5px 12px", fontSize: 13 }}>
                      ✓ {a}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <CollapsibleLocationSection p={p} displayCoords={displayCoords} />
          </div>

          <div className="homio-detail-sidebar" style={{ width: 320, flexShrink: 0 }}>
            <div id="enquiry-section" style={{ background: "#fff", borderRadius: 10, padding: 24, border: `1px solid ${T.border}`, boxShadow: T.shadow }}>
              <div style={{ fontWeight: 800, color: T.navy, marginBottom: 4, fontSize: 15 }}>
                {p.agents?.company || "Homio Agent"}
              </div>
              <div style={{ fontSize: 12, color: T.gray3, marginBottom: 16 }}>{p.agents?.full_name}</div>
              <a
                href={`tel:${p.agents?.phone}`}
                style={{ display: "block", textAlign: "center", background: T.gold, color: "#fff", borderRadius: 8, padding: "10px", fontWeight: 700, marginBottom: 10 }}
              >
                📞 {p.agents?.phone || "Contact Agent"}
              </a>
              <EnquiryForm listingId={p.id} agentId={p.agent_id} />
            </div>

            <div id="viewing-section" style={{ background: "#fff", borderRadius: 10, padding: 24, border: `1px solid ${T.border}`, boxShadow: T.shadow, marginTop: 16 }}>
              <AppointmentBooking listingId={p.id} agentId={p.agent_id} />
            </div>
          </div>
        </div>
      </div>

      <StickyContactBar phone={p.agents?.phone} isOwnListing={isOwner} />
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div style={{ background: T.bg, borderRadius: 8, padding: "10px 14px" }}>
      <div style={{ fontSize: 11, color: T.gray3, fontWeight: 600, marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 700, color: T.gray1 }}>{value}</div>
    </div>
  );
}