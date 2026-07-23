import Link from "next/link";
import { createClient } from "../lib/supabase-server";
import PropertyCard from "../components/PropertyCard";
import SearchWidget from "../components/SearchWidget";
import { T } from "../lib/constants";
import AnimatedCounter from "../components/AnimatedCounter";
import { fetchOwnerTypeMap, withOwnerTypes } from "../lib/badge-queries";

export const revalidate = 60; // re-fetch listings + stats every 60s

const HERO_IMAGE_URL =
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1800&q=80";

export default async function HomePage() {
  const supabase = createClient();

  const [{ data: featured }, { data: forSale }, { data: toLet }, ownerTypeMap, { data: allListers }, { data: allActiveListings }] = await Promise.all([
    supabase
      .from("listings")
      .select("*, listing_images(url, sort_order)")
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(3),
    supabase
      .from("listings")
      .select("*, listing_images(url, sort_order)")
      .eq("status", "active")
      .eq("listing_type", "sale")
      .order("created_at", { ascending: false })
      .limit(3),
    supabase
      .from("listings")
      .select("*, listing_images(url, sort_order)")
      .eq("status", "active")
      .eq("listing_type", "rent")
      .order("created_at", { ascending: false })
      .limit(3),
    fetchOwnerTypeMap(supabase),
    supabase.from("agents").select("id, full_name, company"),
    supabase.from("listings").select("agent_id").eq("status", "active"),
  ]);

  const listingCountByAgent = {};
  (allActiveListings || []).forEach((l) => {
    listingCountByAgent[l.agent_id] = (listingCountByAgent[l.agent_id] || 0) + 1;
  });
  const trustedAgents = (allListers || [])
    .map((a) => ({ ...a, listingCount: listingCountByAgent[a.id] || 0, ownerType: ownerTypeMap.get(a.id) || null }))
    .filter((a) => a.listingCount > 0)
    .sort((a, b) => b.listingCount - a.listingCount)
    .slice(0, 8);

  return (
    <div style={{ background: "#fff" }}>
      {/* Hero */}
      <div
        style={{
          position: "relative",
          padding: "72px 24px 100px",
          textAlign: "center",
          overflow: "hidden",
          backgroundImage: `url(${HERO_IMAGE_URL})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundColor: T.navyD,
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `linear-gradient(160deg, rgba(11,26,58,.92) 0%, rgba(27,58,107,.88) 55%, rgba(42,82,152,.75) 100%)`,
          }}
        />
        <div style={{ position: "relative", maxWidth: 720, margin: "0 auto" }}>
          <span
            style={{
              display: "inline-block",
              background: "rgba(200,150,30,.2)",
              color: T.gold,
              fontWeight: 700,
              fontSize: 12,
              letterSpacing: 2,
              textTransform: "uppercase",
              padding: "5px 16px",
              borderRadius: 999,
              marginBottom: 20,
            }}
          >
            Ghana's #1 Property Portal
          </span>
          <h1
            style={{
              color: "#fff",
              fontSize: "clamp(30px,5vw,54px)",
              fontWeight: 900,
              lineHeight: 1.1,
              margin: "0 0 14px",
              letterSpacing: -0.5,
            }}
          >
            Find Your Next Home
            <br />
            <span style={{ color: T.gold }}>Anywhere in Ghana</span>
          </h1>
          <p
            style={{
              color: "rgba(255,255,255,.85)",
              fontSize: 17,
              lineHeight: 1.7,
              margin: "0 0 36px",
              maxWidth: 520,
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            Browse verified properties for sale and rent — from Accra to Kumasi and beyond.
          </p>
          <SearchWidget />
        </div>
      </div>

      {/* Feature cards */}
      <div style={{ padding: "56px 24px", background: "#fff" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ marginBottom: 32 }}>
            <p style={{ color: T.gold, fontWeight: 700, fontSize: 11, letterSpacing: 2, textTransform: "uppercase", margin: "0 0 6px" }}>
              Why Homio
            </p>
            <h2 style={{ color: T.navy, fontWeight: 900, fontSize: 28, margin: 0 }}>
              Built for how Ghanaians actually search for property
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 20 }}>
            <FeatureCard
              bg="#EFF4FF"
              icon={<ShieldIcon />}
              title="Verified Agents"
              text="Every listing comes from a registered agent or developer profile — no anonymous posts."
            />
            <FeatureCard
              bg="#FBF3E3"
              icon={<GlobeIcon />}
              title="Nationwide Coverage"
              text="Search properties across every region in Ghana, from Accra to the Ashanti countryside."
            />
            <FeatureCard
              bg="#EAF7EF"
              icon={<TagIcon />}
              title="No Hidden Fees"
              text="Browse listings and contact agents directly. Homio never charges buyers or renters to search."
            />
            <FeatureCard
              bg="#EAF7EF"
              icon={<ClockIcon />}
              title="Always Up To Date"
              text="New properties added daily, so you're seeing what's actually available right now."
            />
            <FeatureCard
              bg="#EFF4FF"
              icon={<CameraIcon />}
              title="Real Photos"
              text="Every listing includes real photos uploaded directly by the property's agent."
            />
            <FeatureCard
              bg="#FBF3E3"
              icon={<FlagIcon />}
              title="Built for Ghana"
              text="Prices in GH₵, regions that match Ghana's map, designed around the local property market."
            />
          </div>
        </div>
      </div>

      {/* 3-Month Target — a goal, not a current-state claim; matches About page */}
      <div style={{ background: T.bg, padding: "0 24px 56px", textAlign: "center" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#fff", border: `1px solid ${T.border}`, color: T.gray2, fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", padding: "6px 14px", borderRadius: 999, marginBottom: 12 }}>
            Our 3-Month Target
          </span>
          <p style={{ color: T.gray2, fontSize: 13.5, margin: "0 0 24px" }}>
            Goals we're working toward over the next three months — not where we are today.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 16 }}>
            <div style={{ background: T.navyD, borderRadius: 14, padding: 26, textAlign: "left" }}>
              <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", margin: "0 0 8px" }}>Cities Covered</p>
              <p style={{ color: "#fff", fontSize: 34, fontWeight: 900, margin: 0 }}><AnimatedCounter target={2} suffix="+" /></p>
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, margin: "6px 0 0" }}>Accra &amp; Kumasi</p>
            </div>
            <div style={{ background: "#EAF7EF", borderRadius: 14, padding: 26, textAlign: "left" }}>
              <p style={{ color: T.gray2, fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", margin: "0 0 8px" }}>Active Listings</p>
              <p style={{ color: T.navy, fontSize: 34, fontWeight: 900, margin: 0 }}><AnimatedCounter target={150} suffix="+" /></p>
              <p style={{ color: T.gray3, fontSize: 12, margin: "6px 0 0" }}>Month-3 target</p>
            </div>
            <div style={{ background: "#FBF3E3", borderRadius: 14, padding: 26, textAlign: "left" }}>
              <p style={{ color: T.gray2, fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", margin: "0 0 8px" }}>Verified Listers</p>
              <p style={{ color: T.navy, fontSize: 34, fontWeight: 900, margin: 0 }}><AnimatedCounter target={50} suffix="+" /></p>
              <p style={{ color: T.gray3, fontSize: 12, margin: "6px 0 0" }}>Month-3 target</p>
            </div>
            <div style={{ background: "#EFF4FF", borderRadius: 14, padding: 26, textAlign: "left" }}>
              <p style={{ color: T.gray2, fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", margin: "0 0 8px" }}>Hidden Viewing Fees</p>
              <p style={{ color: T.navy, fontSize: 34, fontWeight: 900, margin: 0 }}><AnimatedCounter target={0} /></p>
              <p style={{ color: T.gray3, fontSize: 12, margin: "6px 0 0" }}>Tolerated on Homio — always</p>
            </div>
          </div>
        </div>
      </div>

      {/* Featured */}
      <Section title="Featured Properties" sub="Handpicked by our team" href="/listings">
        <Grid items={withOwnerTypes(featured || [], ownerTypeMap)} />
      </Section>

      {/* Meet Trusted Agents */}
      {trustedAgents.length > 0 && (
        <div style={{ padding: "0 24px 56px" }}>
          <div style={{ maxWidth: 1280, margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 20 }}>
              <div>
                <p style={{ color: T.gold, fontWeight: 700, fontSize: 11, letterSpacing: 2, textTransform: "uppercase", margin: "0 0 6px" }}>
                  Verified Professionals
                </p>
                <h2 style={{ color: T.navy, fontWeight: 900, fontSize: 24, margin: 0 }}>Meet Trusted Agents</h2>
              </div>
              <Link href="/agents" style={{ color: T.navy, fontWeight: 700, fontSize: 13.5, whiteSpace: "nowrap" }}>
                View All Agents →
              </Link>
            </div>
            <div style={{ display: "flex", gap: 16, overflowX: "auto", paddingBottom: 8, WebkitOverflowScrolling: "touch" }}>
              {trustedAgents.map((a) => (
                <Link
                  key={a.id}
                  href={`/agents/${a.id}`}
                  style={{
                    flexShrink: 0, width: 200, background: "#fff", border: `1px solid ${T.border}`,
                    borderRadius: 12, padding: 20, textDecoration: "none", boxShadow: T.shadow,
                  }}
                >
                  <div
                    style={{
                      width: 46, height: 46, borderRadius: "50%", marginBottom: 12,
                      background: T.navy, color: "#fff", display: "flex", alignItems: "center",
                      justifyContent: "center", fontWeight: 800, fontSize: 17,
                    }}
                  >
                    {(a.full_name || "?").charAt(0).toUpperCase()}
                  </div>
                  <div style={{ fontWeight: 800, fontSize: 14, color: T.navy, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {a.full_name || "Unnamed"}
                  </div>
                  {a.company && (
                    <div style={{ fontSize: 12, color: T.gray2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: 8 }}>
                      {a.company}
                    </div>
                  )}
                  {a.ownerType?.verified && (
                    <div style={{ fontSize: 11, fontWeight: 700, color: T.green, marginBottom: 4 }}>✓ {a.ownerType.label}</div>
                  )}
                  <div style={{ fontSize: 11.5, color: T.gray3 }}>{a.listingCount} listing{a.listingCount === 1 ? "" : "s"}</div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* For Sale */}
      <Section title="Recently Listed — For Sale" sub="Latest homes on the market" href="/listings?type=sale">
        <Grid items={withOwnerTypes(forSale || [], ownerTypeMap)} />
      </Section>

      {/* To Let */}
      <Section title="Recently Listed — To Let" sub="Find your next rental" bg={T.bg} href="/listings?type=rent">
        <Grid items={withOwnerTypes(toLet || [], ownerTypeMap)} />
      </Section>

      {/* How it works */}
      <div style={{ background: T.navyD, padding: "64px 24px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <p style={{ color: T.gold, fontWeight: 700, fontSize: 11, letterSpacing: 2, textTransform: "uppercase", textAlign: "center", margin: "0 0 8px" }}>
            How It Works
          </p>
          <h2 style={{ color: "#fff", fontWeight: 900, fontSize: 28, textAlign: "center", margin: "0 0 40px" }}>
            From search to move-in in 4 steps
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 20 }}>
            <StepCard number="01" title="Search Properties" text="Filter by region, category, price, and bedrooms to find homes that match what you need." />
            <StepCard number="02" title="View Listings" text="Browse real photos, maps, and details for every property, all in one place." />
            <StepCard number="03" title="Contact Agent" text="Reach out directly through the enquiry form — no middleman, no extra fees." />
            <StepCard number="04" title="Move In" text="Arrange a viewing, agree terms with the agent, and move into your next home." />
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div style={{ background: "#fff", padding: "64px 24px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <p style={{ color: T.gold, fontWeight: 700, fontSize: 11, letterSpacing: 2, textTransform: "uppercase", textAlign: "center", margin: "0 0 8px" }}>
            What People Are Saying
          </p>
          <h2 style={{ color: T.navy, fontWeight: 900, fontSize: 28, textAlign: "center", margin: "0 0 40px" }}>
            Real stories from people who found their next home
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 20 }}>
            <TestimonialCard
              quote="Sample testimonial — replace with a real quote before launch. e.g. 'I found a 2-bedroom apartment in East Legon within two days of searching on Homio. The whole process, from browsing to contacting the agent, was simple.'"
              name="Sample Name"
              context="Renter — Accra"
            />
            <TestimonialCard
              quote="Sample testimonial — replace with a real quote before launch. e.g. 'As an agent, listing my properties on Homio was quick and I started getting genuine enquiries within the first week.'"
              name="Sample Name"
              context="Agent — Kumasi"
            />
            <TestimonialCard
              quote="Sample testimonial — replace with a real quote before launch. e.g. 'I was nervous about being scammed looking for land, but being able to see clear photos and contact the agent directly gave me confidence.'"
              name="Sample Name"
              context="Buyer — Ashanti Region"
            />
          </div>
          <p style={{ textAlign: "center", color: T.gray3, fontSize: 12, marginTop: 24 }}>
            ⚠️ Placeholder content — replace with real customer quotes before this section goes live.
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
}

function Grid({ items }) {
  if (!items || items.length === 0) {
    return (
      <p style={{ color: T.gray2, textAlign: "center", padding: "40px 0" }}>
        No listings yet — be the first to{" "}
        <Link href="/login" style={{ color: T.navy, fontWeight: 700 }}>
          add a property
        </Link>
        .
      </p>
    );
  }
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill,minmax(280px,300px))",
        justifyContent: "start",
        gap: 20,
      }}
    >
      {items.map((p) => (
        <PropertyCard key={p.id} p={p} />
      ))}
    </div>
  );
}

function Section({ title, sub, href, bg = "#fff", children }) {
  return (
    <div style={{ background: bg, padding: "56px 24px" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            marginBottom: 28,
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div>
            <p style={{ color: T.gold, fontWeight: 700, fontSize: 11, letterSpacing: 2, textTransform: "uppercase", margin: "0 0 4px" }}>
              {sub}
            </p>
            <h2 style={{ color: T.navy, fontWeight: 900, fontSize: 24, margin: 0 }}>{title}</h2>
          </div>
          <Link
            href={href}
            style={{
              border: `1.5px solid ${T.navy}`,
              color: T.navy,
              borderRadius: 8,
              padding: "8px 18px",
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            View all →
          </Link>
        </div>
        {children}
      </div>
    </div>
  );
}

function FeatureCard({ bg, icon, title, text }) {
  return (
    <div style={{ background: bg, borderRadius: 14, padding: 24 }}>
      <div style={{ color: T.navy, marginBottom: 14 }}>{icon}</div>
      <h3 style={{ color: T.navy, fontWeight: 800, fontSize: 16, margin: "0 0 8px" }}>{title}</h3>
      <p style={{ color: T.gray1, fontSize: 14, lineHeight: 1.6, margin: 0 }}>{text}</p>
    </div>
  );
}

function StepCard({ number, title, text }) {
  return (
    <div style={{ background: "rgba(255,255,255,.06)", borderRadius: 14, padding: 24 }}>
      <p style={{ color: T.gold, fontWeight: 900, fontSize: 28, margin: "0 0 10px", opacity: 0.6 }}>{number}</p>
      <h3 style={{ color: "#fff", fontWeight: 800, fontSize: 16, margin: "0 0 8px" }}>{title}</h3>
      <p style={{ color: "rgba(255,255,255,.65)", fontSize: 14, lineHeight: 1.6, margin: 0 }}>{text}</p>
    </div>
  );
}

function TestimonialCard({ quote, name, context }) {
  return (
    <div style={{ background: T.bg, borderRadius: 14, padding: 28, display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ color: T.gold, fontSize: 28, lineHeight: 1, fontWeight: 900 }}>"</div>
      <p style={{ color: T.gray1, fontSize: 14.5, lineHeight: 1.7, margin: 0, flex: 1 }}>{quote}</p>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: "50%",
            background: T.navy,
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 700,
            fontSize: 14,
            flexShrink: 0,
          }}
        >
          {name?.[0] || "?"}
        </div>
        <div>
          <p style={{ color: T.navy, fontWeight: 700, fontSize: 13.5, margin: 0 }}>{name}</p>
          <p style={{ color: T.gray2, fontSize: 12.5, margin: 0 }}>{context}</p>
        </div>
      </div>
    </div>
  );
}

function Footer() {
  const linkStyle = {
    color: "rgba(255,255,255,.65)",
    fontSize: 14,
    textDecoration: "none",
    display: "block",
    marginBottom: 10,
  };

  const socialCircle = {
    width: 34,
    height: 34,
    borderRadius: "50%",
    background: "rgba(255,255,255,.08)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    textDecoration: "none",
    fontSize: 14,
  };

  return (
    <footer style={{ background: T.navyD, color: "rgba(255,255,255,.65)", padding: "48px 24px 24px" }}>
      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          gap: 40,
          paddingBottom: 32,
          borderBottom: "1px solid rgba(255,255,255,.12)",
        }}
      >
        {/* Brand */}
        <div style={{ maxWidth: 280 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: T.gold,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 900,
                color: T.navyD,
              }}
            >
              H
            </div>
            <span style={{ color: "#fff", fontWeight: 800, fontSize: 18 }}>Homio.</span>
          </div>
          <p style={{ fontSize: 13, lineHeight: 1.7, margin: 0 }}>
            Ghana's trusted home for property listings — connecting buyers, renters, and agents across the country.
          </p>
          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <a href="#" style={socialCircle} aria-label="Facebook">f</a>
            <a href="#" style={socialCircle} aria-label="Instagram">ig</a>
            <a href="#" style={socialCircle} aria-label="WhatsApp">wa</a>
          </div>
        </div>

        {/* Platform */}
        <div>
          <p style={{ color: "#fff", fontWeight: 700, fontSize: 13, letterSpacing: 1, textTransform: "uppercase", marginBottom: 14 }}>
            Platform
          </p>
          <Link href="/listings?type=sale" style={linkStyle}>For Sale</Link>
          <Link href="/listings?type=rent" style={linkStyle}>To Let</Link>
          <Link href="/listings" style={linkStyle}>All Listings</Link>
          <Link href="/login" style={linkStyle}>List a Property</Link>
        </div>

        {/* Company */}
        <div>
          <p style={{ color: "#fff", fontWeight: 700, fontSize: 13, letterSpacing: 1, textTransform: "uppercase", marginBottom: 14 }}>
            Company
          </p>
          <Link href="/login" style={linkStyle}>Sign In</Link>
          <Link href="/about" style={linkStyle}>About Homio</Link>
          <Link href="/how-it-works" style={linkStyle}>How It Works</Link>
          <Link href="/contact" style={linkStyle}>Contact</Link>
        </div>

        {/* Contact */}
        <div>
          <p style={{ color: "#fff", fontWeight: 700, fontSize: 13, letterSpacing: 1, textTransform: "uppercase", marginBottom: 14 }}>
            Get in Touch
          </p>
          <p style={{ fontSize: 13, lineHeight: 1.7, margin: "0 0 14px" }}>
            Questions or feedback? Send us a message and we'll get back to you.
          </p>
          <Link
            href="/contact"
            style={{
              display: "inline-block",
              background: T.gold,
              color: "#fff",
              borderRadius: 999,
              padding: "9px 20px",
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            Contact Us
          </Link>
        </div>
      </div>

      <div style={{ maxWidth: 1280, margin: "0 auto", textAlign: "center", fontSize: 12, paddingTop: 20 }}>
        © {new Date().getFullYear()} Homio Ghana. All rights reserved. 🇬🇭
      </div>
    </footer>
  );
}

/* --- Inline icons (no external icon library dependency) --- */
function iconProps() {
  return { width: 26, height: 26, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" };
}
function ShieldIcon() {
  return (
    <svg {...iconProps()}>
      <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}
function GlobeIcon() {
  return (
    <svg {...iconProps()}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.5 4 5.7 4 9s-1.5 6.5-4 9c-2.5-2.5-4-5.7-4-9s1.5-6.5 4-9z" />
    </svg>
  );
}
function TagIcon() {
  return (
    <svg {...iconProps()}>
      <path d="M20.5 12.5l-8 8a2 2 0 01-2.8 0l-6.2-6.2a2 2 0 010-2.8l8-8H18a2.5 2.5 0 012.5 2.5v6.5z" />
      <circle cx="15.5" cy="8.5" r="1.2" />
    </svg>
  );
}
function ClockIcon() {
  return (
    <svg {...iconProps()}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" />
    </svg>
  );
}
function CameraIcon() {
  return (
    <svg {...iconProps()}>
      <path d="M4 8h3l1.5-2h7L17 8h3a1 1 0 011 1v9a1 1 0 01-1 1H4a1 1 0 01-1-1V9a1 1 0 011-1z" />
      <circle cx="12" cy="13" r="3.5" />
    </svg>
  );
}
function FlagIcon() {
  return (
    <svg {...iconProps()}>
      <path d="M5 3v18" />
      <path d="M5 4h11l-2.5 4L16 12H5" />
    </svg>
  );
}