import Link from "next/link";
import { T } from "@/lib/constants";
import { Home, Briefcase, Building2, HardHat, KeyRound, CheckCircle2 } from "lucide-react";

export const metadata = { title: "For Contributors | Homio Ghana" };

const WHO = [
  { icon: Home, title: "Individual Owners", text: "List your own property directly — no agent licence required, no middleman." },
  { icon: Briefcase, title: "Agents", text: "Reach serious buyers and renters, and manage every enquiry from one dashboard." },
  { icon: Building2, title: "Agencies", text: "Bring your listings onto a platform built for how Ghanaian buyers actually search." },
  { icon: HardHat, title: "Developers", text: "Showcase multi-unit projects to a wider audience across the country." },
  { icon: KeyRound, title: "Property Managers", text: "Manage tenant enquiries and viewings for the properties you oversee." },
];

const BENEFITS = [
  "Free to list — no upfront cost to get your property in front of buyers",
  "Built-in messaging so you never lose track of a buyer conversation",
  "Viewing requests with confirm/decline, right from your dashboard",
  "A verification badge that builds buyer trust in your listings",
  "Photos, video tours, and full property details in one clean listing page",
];

export default function ForContributorsPage() {
  return (
    <div style={{ background: T.bg, minHeight: "80vh" }}>
      <div style={{ background: T.navy, padding: "64px 24px 48px", textAlign: "center" }}>
        <p style={{ color: T.gold, fontWeight: 700, fontSize: 11, letterSpacing: 2, textTransform: "uppercase", margin: "0 0 12px" }}>
          For Contributors
        </p>
        <h1 style={{ color: "#fff", fontWeight: 900, fontSize: 30, margin: "0 auto 14px", maxWidth: 600 }}>
          List your property on Homio — whoever you are
        </h1>
        <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 14.5, maxWidth: 520, margin: "0 auto", lineHeight: 1.7 }}>
          Homio is built for anyone with property to list — individual owners, agents, agencies, developers,
          and property managers all have a place here.
        </p>
      </div>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "48px 24px" }}>
        <h2 style={{ color: T.navy, fontSize: 18, fontWeight: 800, margin: "0 0 18px" }}>Who can list on Homio</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 18, marginBottom: 48 }}>
          {WHO.map((w) => {
            const Icon = w.icon;
            return (
              <div key={w.title} style={{ background: "#fff", border: `1px solid ${T.border}`, borderRadius: 12, padding: 20, boxShadow: T.shadow }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: "#EFF4FF", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
                  <Icon size={18} color={T.navy} strokeWidth={2.2} />
                </div>
                <h3 style={{ color: T.navy, fontSize: 14.5, fontWeight: 800, margin: "0 0 6px" }}>{w.title}</h3>
                <p style={{ color: T.gray2, fontSize: 13, lineHeight: 1.5, margin: 0 }}>{w.text}</p>
              </div>
            );
          })}
        </div>

        <div style={{ background: "#fff", border: `1px solid ${T.border}`, borderRadius: 14, padding: 32, boxShadow: T.shadow }}>
          <h2 style={{ color: T.navy, fontSize: 18, fontWeight: 800, margin: "0 0 18px" }}>Why list with Homio</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 28 }}>
            {BENEFITS.map((b) => (
              <div key={b} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 14, color: T.gray1 }}>
                <CheckCircle2 size={17} color={T.green} style={{ flexShrink: 0, marginTop: 2 }} />
                {b}
              </div>
            ))}
          </div>

          <Link
            href="/dashboard/roles"
            style={{ display: "inline-block", background: T.gold, color: "#fff", borderRadius: 999, padding: "12px 28px", fontWeight: 700, fontSize: 14 }}
          >
            Start Listing Today
          </Link>
        </div>
      </div>
    </div>
  );
}