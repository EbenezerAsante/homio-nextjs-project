import { notFound } from "next/navigation";
import { createClient } from "../../../lib/supabase-server";
import { T, fmt, CAT_LABEL, getCoords } from "../../../lib/constants";
import EnquiryForm from "../../../components/EnquiryForm";
import AppointmentBooking from "../../../components/AppointmentBooking";
import PropertyMap from "../../../components/PropertyMap";
import PropertyGallery from "../../../components/PropertyGallery";
import MortgageCalculator from "../../../components/MortgageCalculator";

export const revalidate = 30;

export default async function PropertyDetail({ params }) {
  const supabase = createClient();

  const { data: p } = await supabase
    .from("listings")
    .select("*, listing_images(url, sort_order), agents(full_name, company, phone, email)")
    .eq("id", params.id)
    .single();

  if (!p) return notFound();

  // increment view count (best-effort, ignore errors)
  await supabase.from("listings").update({ view_count: (p.view_count || 0) + 1 }).eq("id", p.id);

  const images = p.listing_images?.length
    ? [...p.listing_images].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)).map((i) => i.url)
    : [];

  return (
    <div style={{ background: T.bg, minHeight: "90vh" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "28px 24px" }}>
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
              <p style={{ color: T.gray2, margin: "0 0 14px", fontSize: 14 }}>📍 {p.city}, {p.region}</p>
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

            <div style={{ background: "#fff", borderRadius: 10, padding: 24, border: `1px solid ${T.border}` }}>
              <h3 style={{ margin: "0 0 12px", color: T.navy, fontSize: 16 }}>Location</h3>
              <PropertyMap
                latitude={p.latitude || getCoords(p.city, p.region)[0]}
                longitude={p.longitude || getCoords(p.city, p.region)[1]}
                title={p.title}
                city={p.city}
                region={p.region}
              />
              <p style={{ fontSize: 12, color: T.gray3, marginTop: 10 }}>
                📍 {p.city}, {p.region}
                {!p.latitude && " (approximate location)"}
              </p>
            </div>
          </div>

          <div className="homio-detail-sidebar" style={{ width: 320, flexShrink: 0 }}>
            <div style={{ background: "#fff", borderRadius: 10, padding: 24, border: `1px solid ${T.border}`, boxShadow: T.shadow }}>
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

            <div style={{ background: "#fff", borderRadius: 10, padding: 24, border: `1px solid ${T.border}`, boxShadow: T.shadow, marginTop: 16 }}>
              <AppointmentBooking listingId={p.id} agentId={p.agent_id} />
            </div>
          </div>
        </div>
      </div>
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