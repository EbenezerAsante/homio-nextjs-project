"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase-client";
import { T } from "@/lib/constants";
import {
  Search, MessageCircle, Calendar, Key, UserPlus, ClipboardCheck, ShieldCheck, Home,
  MapPin, Zap, ShieldOff, ArrowRight, ChevronDown,
} from "lucide-react";

const BUYER_STEPS = [
  { icon: Search, title: "Search", text: "Browse verified listings by region, city, property type, or budget — for sale or for rent." },
  { icon: MessageCircle, title: "Message", text: "Enquire about a property and message the agent or owner directly, without leaving Homio." },
  { icon: Calendar, title: "Book a Viewing", text: "Request a viewing time. The agent confirms or declines — no back-and-forth phone tag." },
  { icon: Key, title: "Move In or Close", text: "Once you're happy, finalize the deal directly with the agent, agency, or owner." },
];

const SELLER_STEPS = [
  { icon: UserPlus, title: "Create an Account", text: "Sign up with your name, email, and phone — takes under a minute." },
  { icon: ClipboardCheck, title: "Choose Your Role", text: "List your own property instantly as an owner, or apply as an agent, agency, developer, or property manager." },
  { icon: ShieldCheck, title: "Get Verified", text: "Professional roles go through a real review by our team before going live — this is what keeps listings trustworthy." },
  { icon: Home, title: "List & Manage", text: "Add photos and details, then manage enquiries, messages, and viewing requests from one dashboard." },
];

const FEATURES = [
  { icon: MapPin, title: "Map View", text: "Switch any search to map view to see listings by location, not just as a list." },
  { icon: ShieldCheck, title: "Verified Listers", text: "Every agent, agency, developer, and property manager goes through a real review before they can list." },
  { icon: ShieldOff, title: "Zero Viewing Fees", text: "Homio has a zero-tolerance policy on viewing fees. Report any request for one directly to our team." },
  { icon: Zap, title: "Current Listing Status", text: "Listings show active, under offer, or taken — so you're not calling about a place that's long gone." },
  { icon: MessageCircle, title: "In-App Messaging", text: "Message agents and owners directly through Homio — one thread per conversation, nothing lost in WhatsApp." },
  { icon: Home, title: "Built for Ghana", text: "Prices in Ghana Cedis, regions that match Ghana's map, built around how property actually gets bought and rented here." },
];

const FAQS = [
  { q: "Is Homio free to use?", a: "Yes — browsing listings, messaging agents, and booking viewings are all free for buyers and renters. There's no subscription to search Homio." },
  { q: "How does lister verification work?", a: "Anyone listing as an agent, agency, developer, or property manager goes through a review by our team before their listings go live. Individual owners can list their own property directly." },
  { q: "What if someone asks me for a viewing fee?", a: "Report it to us right away through the listing's report option. Homio has a zero-tolerance policy on viewing fees." },
  { q: "What kinds of properties can I find on Homio?", a: "Both sale and rental — houses, apartments, land, and commercial space — listed by individual owners, agents, agencies, developers, and property managers." },
];

function StepRow({ steps }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 20 }}>
      {steps.map((s, i) => {
        const Icon = s.icon;
        return (
          <div key={s.title} style={{ background: "#fff", border: `1px solid ${T.border}`, borderRadius: 12, padding: 22, boxShadow: T.shadow, position: "relative" }}>
            <div style={{ position: "absolute", top: 16, right: 18, fontSize: 26, fontWeight: 900, color: T.bg }}>
              {String(i + 1).padStart(2, "0")}
            </div>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: "#EFF4FF", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
              <Icon size={18} color={T.navy} strokeWidth={2.2} />
            </div>
            <h3 style={{ color: T.navy, fontSize: 15.5, fontWeight: 800, margin: "0 0 6px" }}>{s.title}</h3>
            <p style={{ color: T.gray2, fontSize: 13.5, lineHeight: 1.6, margin: 0 }}>{s.text}</p>
          </div>
        );
      })}
    </div>
  );
}

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ background: "#fff", border: `1px solid ${T.border}`, borderRadius: 10, marginBottom: 10, overflow: "hidden" }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, padding: "16px 18px", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}
      >
        <span style={{ color: T.navy, fontWeight: 700, fontSize: 14.5 }}>{q}</span>
        <ChevronDown size={18} color={T.gray2} style={{ flexShrink: 0, transform: open ? "rotate(180deg)" : "none", transition: "transform .15s" }} />
      </button>
      {open && <p style={{ color: T.gray2, fontSize: 13.5, lineHeight: 1.65, margin: 0, padding: "0 18px 16px" }}>{a}</p>}
    </div>
  );
}

export default function HowItWorksPage() {
  const [tab, setTab] = useState("buyer"); // buyer | seller
  const [photos, setPhotos] = useState([]);

  useEffect(() => {
    const UNFINISHED_HINTS = ["uncomplete", "incomplete", "under construction", "unfinished", "ongoing", "shell"];
    const supabase = createClient();
    supabase
      .from("listings")
      .select("id, title, listing_images(url, sort_order)")
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(20)
      .then(({ data }) => {
        const finished = (data || []).filter((l) => {
          const title = (l.title || "").toLowerCase();
          return !UNFINISHED_HINTS.some((hint) => title.includes(hint));
        });
        const pool = finished.length > 0 ? finished : data || [];
        const urls = pool
          .map((l) => l.listing_images?.slice().sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))?.[0]?.url)
          .filter(Boolean);
        setPhotos(urls);
      });
  }, []);

  const heroPhoto = photos[0];
  const stripPhotos = photos.slice(1, 4);

  return (
    <div style={{ background: T.bg, minHeight: "80vh" }}>
      {/* Hero */}
      <div
        style={{
          padding: "64px 24px 40px",
          textAlign: "center",
          background: heroPhoto
            ? `linear-gradient(135deg, rgba(15,36,69,0.90) 0%, rgba(27,58,107,0.80) 55%, rgba(200,150,30,0.35) 100%), url(${heroPhoto}) center/cover no-repeat`
            : T.navy,
        }}
      >
        <p style={{ color: T.gold, fontWeight: 700, fontSize: 11, letterSpacing: 2, textTransform: "uppercase", margin: "0 0 10px" }}>
          The Platform
        </p>
        <h1 style={{ color: "#fff", fontWeight: 900, fontSize: 32, margin: "0 auto 12px", maxWidth: 600, fontFamily: "var(--font-heading), Georgia, serif" }}>
          How Homio Works
        </h1>
        <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 14.5, maxWidth: 520, margin: "0 auto" }}>
          Homio serves both people looking for a property and verified listers — agents, agencies,
          developers, property managers, and individual owners.
        </p>
      </div>

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "40px 24px 0" }}>
        {/* Tab toggle */}
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 32 }}>
          <button
            onClick={() => setTab("buyer")}
            style={{
              border: `1.5px solid ${tab === "buyer" ? T.navy : T.border}`,
              background: tab === "buyer" ? T.navy : "#fff",
              color: tab === "buyer" ? "#fff" : T.gray1,
              borderRadius: 999, padding: "10px 22px", fontWeight: 700, fontSize: 13.5, cursor: "pointer",
            }}
          >
            I'm Looking for a Property
          </button>
          <button
            onClick={() => setTab("seller")}
            style={{
              border: `1.5px solid ${tab === "seller" ? T.navy : T.border}`,
              background: tab === "seller" ? T.navy : "#fff",
              color: tab === "seller" ? "#fff" : T.gray1,
              borderRadius: 999, padding: "10px 22px", fontWeight: 700, fontSize: 13.5, cursor: "pointer",
            }}
          >
            I'm Listing a Property
          </button>
        </div>

        <StepRow steps={tab === "buyer" ? BUYER_STEPS : SELLER_STEPS} />

        {/* What you get */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 24, marginTop: 24, alignItems: "stretch" }}>
          <div style={{ background: "#fff", border: `1px solid ${T.border}`, borderRadius: 14, padding: 28, gridColumn: "span 2" }}>
            <h3 style={{ color: T.navy, fontSize: 17, fontWeight: 800, margin: "0 0 14px" }}>
              {tab === "buyer" ? "What you get, searching Homio" : "What you get, listing on Homio"}
            </h3>
            <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
              {(tab === "buyer"
                ? [
                    "Free to use — always, no subscriptions",
                    "Only verified professionals can list",
                    "Zero viewing fees — zero-tolerance policy",
                    "Secure in-app messaging with agents and owners",
                    "Book viewings directly through a listing",
                  ]
                : [
                    "List your own property free as an individual owner",
                    "Professional review keeps buyers confident in your listings",
                    "Manage every enquiry and viewing request from one dashboard",
                    "Messages stay on-platform — no lost WhatsApp threads",
                    "Update your listing status any time — active, under offer, or taken",
                  ]
              ).map((item) => (
                <li key={item} style={{ display: "flex", alignItems: "flex-start", gap: 8, color: T.gray1, fontSize: 13.5 }}>
                  <span style={{ color: T.green, fontWeight: 800, flexShrink: 0 }}>✓</span> {item}
                </li>
              ))}
            </ul>
          </div>
          <div style={{ background: T.navy, borderRadius: 14, padding: 28, display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", margin: "0 0 8px" }}>
              {tab === "buyer" ? "Cost to Search" : "Cost to List"}
            </p>
            <p style={{ color: "#fff", fontSize: 34, fontWeight: 900, margin: "0 0 6px" }}>GH₵ 0</p>
            <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 12.5, margin: 0 }}>
              {tab === "buyer" ? "Forever free to search and enquire" : "Free for individual owners to list"}
            </p>
          </div>
        </div>
      </div>

      {/* Real listings photo strip */}
      {stripPhotos.length > 0 && (
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "56px 24px 0" }}>
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${stripPhotos.length},1fr)`, gap: 14 }}>
            {stripPhotos.map((url, i) => (
              <div key={i} style={{ position: "relative", borderRadius: 14, overflow: "hidden", height: 180 }}>
                <img src={url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 55%, rgba(15,36,69,0.6) 100%)" }} />
              </div>
            ))}
          </div>
          <p style={{ textAlign: "center", color: T.gray3, fontSize: 12, marginTop: 12 }}>
            Real listings, currently live on Homio
          </p>
        </div>
      )}

      {/* Platform Features */}
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "64px 24px 0", textAlign: "center" }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#fff", border: `1px solid ${T.border}`, color: T.gray2, fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", padding: "6px 14px", borderRadius: 999, marginBottom: 16 }}>
          Platform Features
        </span>
        <h2 style={{ color: T.navy, fontSize: 26, fontWeight: 900, margin: "0 0 32px", fontFamily: "var(--font-heading), Georgia, serif" }}>
          Built for Ghana's reality
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 20, textAlign: "left" }}>
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title} style={{ background: "#fff", border: `1px solid ${T.border}`, borderRadius: 12, padding: 22 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: "#EFF4FF", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
                  <Icon size={19} color={T.navy} strokeWidth={2.2} />
                </div>
                <h3 style={{ color: T.navy, fontSize: 15, fontWeight: 800, margin: "0 0 6px" }}>{f.title}</h3>
                <p style={{ color: T.gray2, fontSize: 13, lineHeight: 1.6, margin: 0 }}>{f.text}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* FAQ */}
      <div style={{ maxWidth: 700, margin: "0 auto", padding: "64px 24px 0" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#fff", border: `1px solid ${T.border}`, color: T.gray2, fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", padding: "6px 14px", borderRadius: 999, marginBottom: 16 }}>
            FAQ
          </span>
          <h2 style={{ color: T.navy, fontSize: 24, fontWeight: 900, margin: 0, fontFamily: "var(--font-heading), Georgia, serif" }}>
            Common questions
          </h2>
        </div>
        {FAQS.map((f) => (
          <FaqItem key={f.q} q={f.q} a={f.a} />
        ))}
        <p style={{ textAlign: "center", color: T.gray2, fontSize: 13, marginTop: 20 }}>
          Still have questions?{" "}
          <Link href="/contact" style={{ color: T.navy, fontWeight: 700 }}>Contact Us</Link>
        </p>
      </div>

      {/* Closing CTA */}
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "64px 24px 80px", textAlign: "center" }}>
        <Link
          href="/listings"
          style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: T.gold, color: "#fff", fontWeight: 700, fontSize: 14.5,
            padding: "13px 28px", borderRadius: 999, textDecoration: "none",
          }}
        >
          Start Browsing <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}