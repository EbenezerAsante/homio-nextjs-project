import Link from "next/link";
import { T } from "@/lib/constants";
import { Search, MessageCircle, Calendar, Key, UserPlus, ClipboardCheck, ShieldCheck, Home } from "lucide-react";

export const metadata = { title: "How It Works | Homio Ghana" };

const BUYER_STEPS = [
  { icon: Search, title: "Search", text: "Browse verified listings by region, city, property type, or budget." },
  { icon: MessageCircle, title: "Message", text: "Enquire about a property and message the agent or owner directly on Homio." },
  { icon: Calendar, title: "Book a Viewing", text: "Request a viewing time. The agent confirms or declines — no back-and-forth phone tag." },
  { icon: Key, title: "Move In", text: "Once you're happy, finalize the deal directly with the agent or owner." },
];

const SELLER_STEPS = [
  { icon: UserPlus, title: "Create an Account", text: "Sign up with your name, email, and phone — takes under a minute." },
  { icon: Home, title: "Choose Your Role", text: "List your own property instantly as an owner, or apply as an agent, agency, developer, or property manager." },
  { icon: ClipboardCheck, title: "Get Verified", text: "Professional roles are reviewed by our team before going live — this is what keeps listings trustworthy." },
  { icon: ShieldCheck, title: "List & Manage", text: "Add photos, video, and details, then manage enquiries, messages, and viewing requests from one dashboard." },
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
            <div style={{ width: 40, height: 40, borderRadius: 10, background: "#EFF4FF", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
              <Icon size={19} color={T.navy} strokeWidth={2.2} />
            </div>
            <h3 style={{ color: T.navy, fontSize: 15.5, fontWeight: 800, margin: "0 0 6px" }}>{s.title}</h3>
            <p style={{ color: T.gray2, fontSize: 13.5, lineHeight: 1.6, margin: 0 }}>{s.text}</p>
          </div>
        );
      })}
    </div>
  );
}

export default function HowItWorksPage() {
  return (
    <div style={{ background: T.bg, minHeight: "80vh", padding: "64px 24px" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <p style={{ color: T.gold, fontWeight: 700, fontSize: 11, letterSpacing: 2, textTransform: "uppercase", margin: "0 0 10px" }}>
            How It Works
          </p>
          <h1 style={{ color: T.navy, fontWeight: 900, fontSize: 30, margin: "0 auto", maxWidth: 560 }}>
            Whether you're looking for a home or listing one, Homio keeps it simple.
          </h1>
        </div>

        <h2 style={{ color: T.navy, fontSize: 18, fontWeight: 800, margin: "0 0 18px" }}>Finding a property</h2>
        <StepRow steps={BUYER_STEPS} />

        <h2 style={{ color: T.navy, fontSize: 18, fontWeight: 800, margin: "48px 0 18px" }}>Listing a property</h2>
        <StepRow steps={SELLER_STEPS} />

        <div style={{ textAlign: "center", marginTop: 48 }}>
          <Link
            href="/listings"
            style={{ display: "inline-block", background: T.gold, color: "#fff", borderRadius: 999, padding: "12px 28px", fontWeight: 700, fontSize: 14 }}
          >
            Start Browsing
          </Link>
        </div>
      </div>
    </div>
  );
}