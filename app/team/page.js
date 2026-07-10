import { T } from "@/lib/constants";
import { Code2, Settings, HeadphonesIcon } from "lucide-react";

export const metadata = { title: "Our Team | Homio Ghana" };

const ROLES = [
  {
    icon: Code2,
    title: "Founder & Developer",
    text: "Builds and maintains the Homio platform end-to-end — from the property search experience to the tools agents and owners use every day.",
  },
  {
    icon: Settings,
    title: "Operations",
    text: "Reviews agent, agency, developer, and property manager applications to keep listings on Homio trustworthy and verified.",
  },
  {
    icon: HeadphonesIcon,
    title: "Community & Support",
    text: "Helps buyers, renters, and property owners get the most out of Homio, and gathers feedback to shape what gets built next.",
  },
];

export default function TeamPage() {
  return (
    <div style={{ background: T.bg, minHeight: "70vh", padding: "64px 24px" }}>
      <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
        <p style={{ color: T.gold, fontWeight: 700, fontSize: 11, letterSpacing: 2, textTransform: "uppercase", margin: "0 0 12px" }}>
          Our Team
        </p>
        <h1 style={{ color: T.navy, fontWeight: 900, fontSize: 30, margin: "0 0 14px" }}>
          The people building Homio
        </h1>
        <p style={{ color: T.gray2, fontSize: 14.5, lineHeight: 1.7, margin: "0 auto 48px", maxWidth: 560 }}>
          Homio is a growing team focused on making property search and listing in Ghana simpler, safer, and more transparent.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 20, textAlign: "left" }}>
          {ROLES.map((r) => {
            const Icon = r.icon;
            return (
              <div key={r.title} style={{ background: "#fff", border: `1px solid ${T.border}`, borderRadius: 12, padding: 24, boxShadow: T.shadow }}>
                <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#EFF4FF", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
                  <Icon size={20} color={T.navy} strokeWidth={2.2} />
                </div>
                <h3 style={{ color: T.navy, fontSize: 15.5, fontWeight: 800, margin: "0 0 8px" }}>{r.title}</h3>
                <p style={{ color: T.gray2, fontSize: 13.5, lineHeight: 1.6, margin: 0 }}>{r.text}</p>
              </div>
            );
          })}
        </div>

        <p style={{ color: T.gray2, fontSize: 13, marginTop: 40 }}>
          More about the team soon — Homio is still early, and growing.
        </p>
      </div>
    </div>
  );
}