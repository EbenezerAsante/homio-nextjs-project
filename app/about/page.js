import { T } from "@/lib/constants";
import { ShieldCheck, Home, MessageCircle, Calendar, Users, MapPin } from "lucide-react";

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

export default function AboutPage() {
  return (
    <div style={{ background: T.bg, minHeight: "80vh" }}>
      <div style={{ background: T.navy, padding: "72px 24px 56px", textAlign: "center" }}>
        <p style={{ color: T.gold, fontWeight: 700, fontSize: 11, letterSpacing: 2, textTransform: "uppercase", margin: "0 0 12px" }}>
          About Homio
        </p>
        <h1 style={{ color: "#fff", fontWeight: 900, fontSize: 34, margin: "0 auto 16px", maxWidth: 640 }}>
          Ghana's property marketplace, built the way property actually gets bought and rented here.
        </h1>
        <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 15, maxWidth: 560, margin: "0 auto", lineHeight: 1.7 }}>
          Homio connects buyers and renters with verified agents, agencies, developers, property managers,
          and individual property owners — all in one place, with real communication tools built in.
        </p>
      </div>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "56px 24px" }}>
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
    </div>
  );
}