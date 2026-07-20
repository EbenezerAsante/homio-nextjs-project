import { T } from "@/lib/constants";
import { ShieldCheck, Home, MessageCircle, Calendar, Users, MapPin, Sparkles, Target, Eye, Zap, Heart, ArrowRight } from "lucide-react";
import Link from "next/link";
import AnimatedCounter from "@/components/AnimatedCounter";

export const metadata = { title: "About | Homio Ghana" };

const FEATURES = [
  {
    icon: ShieldCheck,
    title: "Verified, Not Just Listed",
    text: "Every agent, agency, developer, and property manager on Homio goes through a real approval process before they can list a single property. No anonymous accounts, no guesswork.",
  },
  {
    icon: Home,
    title: "List Directly, No Agent Required",
    text: "Own a property yourself? You don't need to go through an agent to list it. Homio lets individual owners list and manage their own properties with the same tools professionals use.",
  },
  {
    icon: MessageCircle,
    title: "Everything Stays On-Platform",
    text: "Enquire about a property, message the agent, and track the conversation — all without leaving Homio or juggling WhatsApp threads you'll lose track of.",
  },
  {
    icon: Calendar,
    title: "Book Viewings, Not Guesswork",
    text: "Request a viewing time directly through the listing. Agents confirm or decline, and both sides always know where things stand.",
  },
  {
    icon: Users,
    title: "Built for Every Kind of Seller",
    text: "Individual owners, professional agents, agencies, developers, and property managers all have a place on Homio — each with tools suited to how they actually work.",
  },
  {
    icon: MapPin,
    title: "Ghana-Focused",
    text: "From Accra to Kumasi and beyond, Homio is built specifically around how property is bought, sold, and rented in Ghana — not adapted from a platform built for somewhere else.",
  },
];

const VALUES = [
  { icon: Eye, title: "Transparency", text: "Listing status is always current — active, under offer, or taken. No calling about a place that's long gone." },
  { icon: ShieldCheck, title: "Trust", text: "Every professional lister goes through a real verification review before they can post — not a rubber stamp." },
  { icon: Zap, title: "Speed", text: "List a property or reach an agent in minutes — no back-and-forth phone tag, no lost WhatsApp threads." },
  { icon: Heart, title: "Fairness", text: "Searching and browsing Homio is, and always will be, free for everyone." },
];

const BADGES = [
  { emoji: "✅", text: "Verified Listers" },
  { emoji: "💬", text: "Message Before You Commit" },
  { emoji: "🗓️", text: "Book Viewings Directly" },
  { emoji: "🆓", text: "Free to Search — Always" },
  { emoji: "🏠", text: "Sale & Rental, One Platform" },
];

export default async function AboutPage() {
  const heroPhoto = "/images/about-hero.jpg";
  const storyPhoto = "https://homio-app-tau.vercel.app/assets/hug-DgwZEk2j.jpg";

  return (
    <div style={{ background: T.bg, minHeight: "80vh" }}>
      <div
        style={{
          position: "relative",
          padding: "88px 24px 64px",
          textAlign: "center",
          overflow: "hidden",
          background: heroPhoto
            ? `linear-gradient(135deg, rgba(15,36,69,0.90) 0%, rgba(27,58,107,0.78) 55%, rgba(200,150,30,0.38) 100%), url(${heroPhoto}) center/cover no-repeat`
            : `radial-gradient(circle at 30% 20%, #24447A 0%, ${T.navy} 45%, #0F2445 100%)`,
        }}
      >
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: "radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px)",
            backgroundSize: "22px 22px",
            opacity: 0.5,
          }}
        />
        <div style={{ position: "relative" }}>
          <span
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)",
              color: "#fff", fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase",
              padding: "7px 16px", borderRadius: 999, marginBottom: 20,
            }}
          >
            <span style={{ width: 4, height: 4, borderRadius: "50%", background: T.gold }} />
            Who We Are
            <span style={{ width: 4, height: 4, borderRadius: "50%", background: T.gold }} />
          </span>

          <h1 style={{ color: "#fff", fontWeight: 900, fontSize: 38, margin: "0 auto 12px", maxWidth: 680, fontFamily: "var(--font-heading), Georgia, serif" }}>
            About Homio
          </h1>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 13, margin: "0 0 22px" }}>Home / About</p>
          <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 15.5, maxWidth: 600, margin: "0 auto", lineHeight: 1.7 }}>
            Ghana's property marketplace, built the way property actually gets bought and rented here —
            connecting buyers and renters with verified agents, agencies, developers, property managers,
            and individual owners, all in one place.
          </p>
        </div>
      </div>

      {/* Vision / Mission */}
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "56px 24px 0" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 20 }}>
          <div style={{ background: "#F4EFE6", borderRadius: 16, padding: 32 }}>
            <div style={{ width: 42, height: 42, borderRadius: 10, background: "rgba(27,58,107,0.08)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18 }}>
              <Sparkles size={20} color={T.navy} strokeWidth={2.2} />
            </div>
            <h3 style={{ color: T.navy, fontSize: 20, fontWeight: 800, margin: "0 0 10px" }}>Our Vision</h3>
            <p style={{ color: "#4B5563", fontSize: 14, lineHeight: 1.75, margin: 0 }}>
              A Ghana where finding, buying, or renting a home is as straightforward as it should be —
              where every listing is real, every seller is verifiable, and no conversation gets lost
              in a WhatsApp thread you can't find again.
            </p>
          </div>
          <div style={{ background: "#1B2415", borderRadius: 16, padding: 32 }}>
            <div style={{ width: 42, height: 42, borderRadius: 10, background: "rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18 }}>
              <Target size={20} color={T.gold} strokeWidth={2.2} />
            </div>
            <h3 style={{ color: "#fff", fontSize: 20, fontWeight: 800, margin: "0 0 10px" }}>Our Mission</h3>
            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 14, lineHeight: 1.75, margin: 0 }}>
              To give every property seeker in Ghana one trustworthy place to search — and give every
              legitimate seller, from individual owners to full agencies, the tools to reach them directly,
              without a middleman in between.
            </p>
          </div>
        </div>
      </div>

      {/* Our Story */}
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "64px 24px 0" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 40, alignItems: "center" }}>
          <div
            style={{
              borderRadius: 16, minHeight: 280,
              background: storyPhoto
                ? `linear-gradient(160deg, rgba(15,36,69,0.55) 0%, rgba(27,58,107,0.25) 60%, rgba(200,150,30,0.25) 100%), url(${storyPhoto}) center/cover no-repeat`
                : `linear-gradient(135deg, ${T.navy} 0%, #0F2445 100%)`,
              display: "flex", alignItems: storyPhoto ? "flex-end" : "center", justifyContent: storyPhoto ? "flex-start" : "center", padding: 32,
            }}
          >
            {!storyPhoto && <Home size={64} color="rgba(255,255,255,0.25)" strokeWidth={1.2} />}
          </div>
          <div>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8, background: T.bg, color: T.gray2, fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", padding: "6px 14px", borderRadius: 999, marginBottom: 16 }}>
              Our Story
            </span>
            <h2 style={{ color: T.navy, fontSize: 28, fontWeight: 900, margin: "0 0 16px", fontFamily: "var(--font-heading), Georgia, serif" }}>
              Built to fix a real problem
            </h2>
            <p style={{ color: T.gray1, fontSize: 14.5, lineHeight: 1.8, margin: "0 0 14px" }}>
              Property listings in Ghana live scattered across WhatsApp statuses, faded posters, and word
              of mouth — with no way to tell what's actually still available, or who's actually a legitimate
              seller.
            </p>
            <p style={{ color: T.gray1, fontSize: 14.5, lineHeight: 1.8, margin: 0 }}>
              Homio brings that scattered process into one place — agents, agencies, developers, property
              managers, and individual owners on a single platform, with real verification and real
              conversations that don't disappear into a WhatsApp thread you'll never find again.
            </p>
          </div>
        </div>
      </div>

      {/* Our Values */}
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "64px 24px 0", textAlign: "center" }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#fff", border: `1px solid ${T.border}`, color: T.gray2, fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", padding: "6px 14px", borderRadius: 999, marginBottom: 16 }}>
          Our Values
        </span>
        <h2 style={{ color: T.navy, fontSize: 28, fontWeight: 900, margin: "0 0 32px", fontFamily: "var(--font-heading), Georgia, serif" }}>
          What we stand for
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))", gap: 16, textAlign: "left" }}>
          {VALUES.map((v) => {
            const Icon = v.icon;
            return (
              <div key={v.title} style={{ background: "#fff", border: `1px solid ${T.border}`, borderRadius: 14, padding: 24 }}>
                <Icon size={20} color={T.navy} strokeWidth={2} style={{ marginBottom: 14 }} />
                <h3 style={{ color: T.navy, fontSize: 15.5, fontWeight: 800, margin: "0 0 8px" }}>{v.title}</h3>
                <p style={{ color: T.gray2, fontSize: 13, lineHeight: 1.65, margin: 0 }}>{v.text}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Where we're headed — explicitly a goal, not a current-state claim */}
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "64px 24px 0", textAlign: "center" }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#fff", border: `1px solid ${T.border}`, color: T.gray2, fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", padding: "6px 14px", borderRadius: 999, marginBottom: 16 }}>
          Our 3-Month Target
        </span>
        <h2 style={{ color: T.navy, fontSize: 28, fontWeight: 900, margin: "0 0 8px", fontFamily: "var(--font-heading), Georgia, serif" }}>
          Where we're headed next
        </h2>
        <p style={{ color: T.gray2, fontSize: 14, margin: "0 0 32px", maxWidth: 480, marginLeft: "auto", marginRight: "auto" }}>
          Goals we're working toward over the next three months — not where we are today.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 16 }}>
          <div style={{ background: "#1B2415", borderRadius: 14, padding: 26, textAlign: "left" }}>
            <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", margin: "0 0 8px" }}>Cities Covered</p>
            <p style={{ color: "#fff", fontSize: 34, fontWeight: 900, margin: 0 }}>
              <AnimatedCounter target={2} suffix="+" />
            </p>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, margin: "6px 0 0" }}>Accra &amp; Kumasi</p>
          </div>
          <div style={{ background: T.navy, borderRadius: 14, padding: 26, textAlign: "left" }}>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", margin: "0 0 8px" }}>Verified Listers</p>
            <p style={{ color: "#fff", fontSize: 34, fontWeight: 900, margin: 0 }}>
              <AnimatedCounter target={50} suffix="+" />
            </p>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, margin: "6px 0 0" }}>Month-3 target</p>
          </div>
          <div style={{ background: "#F4EFE6", borderRadius: 14, padding: 26, textAlign: "left" }}>
            <p style={{ color: T.gray2, fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", margin: "0 0 8px" }}>Active Listings</p>
            <p style={{ color: T.navy, fontSize: 34, fontWeight: 900, margin: 0 }}>
              <AnimatedCounter target={150} suffix="+" />
            </p>
            <p style={{ color: T.gray3, fontSize: 12, margin: "6px 0 0" }}>Month-3 target</p>
          </div>
          <div style={{ background: "#FBF0DC", borderRadius: 14, padding: 26, textAlign: "left" }}>
            <p style={{ color: T.gray2, fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", margin: "0 0 8px" }}>Hidden Viewing Fees</p>
            <p style={{ color: T.navy, fontSize: 34, fontWeight: 900, margin: 0 }}>
              <AnimatedCounter target={0} />
            </p>
            <p style={{ color: T.gray3, fontSize: 12, margin: "6px 0 0" }}>Tolerated on Homio — always</p>
          </div>
        </div>
      </div>

      {/* Existing feature grid */}
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "64px 24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 24 }}>
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title} style={{ background: "#fff", border: `1px solid ${T.border}`, borderRadius: 12, padding: 24, boxShadow: T.shadow }}>
                <div style={{ width: 42, height: 42, borderRadius: 10, background: "#EFF4FF", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
                  <Icon size={20} color={T.navy} strokeWidth={2.2} />
                </div>
                <h3 style={{ color: T.navy, fontSize: 16, fontWeight: 800, margin: "0 0 8px" }}>{f.title}</h3>
                <p style={{ color: T.gray2, fontSize: 13.5, lineHeight: 1.6, margin: 0 }}>{f.text}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Scrolling badge marquee */}
      <div style={{ background: T.navy, padding: "20px 0", overflow: "hidden" }}>
        <div style={{ display: "flex", gap: 40, animation: "homio-marquee 28s linear infinite", width: "max-content" }}>
          {[...BADGES, ...BADGES, ...BADGES].map((b, i) => (
            <span key={i} style={{ color: "rgba(255,255,255,0.85)", fontSize: 13.5, fontWeight: 600, whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 8 }}>
              <span>{b.emoji}</span> {b.text}
            </span>
          ))}
        </div>
      </div>
      <style>{`@keyframes homio-marquee { from { transform: translateX(0); } to { transform: translateX(-33.333%); } }`}</style>

      {/* Closing CTA — reflects that Homio is live today, not a waitlist */}
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "64px 24px 80px", textAlign: "center" }}>
        <h2 style={{ color: T.navy, fontSize: 28, fontWeight: 900, margin: "0 0 12px", fontFamily: "var(--font-heading), Georgia, serif" }}>
          Ready to find your next home?
        </h2>
        <p style={{ color: T.gray2, fontSize: 14.5, margin: "0 0 24px", maxWidth: 480, marginLeft: "auto", marginRight: "auto" }}>
          Browse verified listings across Ghana right now — no waitlist, no sign-up required to look.
        </p>
        <Link
          href="/listings"
          style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: T.gold, color: "#fff", fontWeight: 700, fontSize: 14.5,
            padding: "13px 28px", borderRadius: 999, textDecoration: "none",
          }}
        >
          Browse Listings <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}