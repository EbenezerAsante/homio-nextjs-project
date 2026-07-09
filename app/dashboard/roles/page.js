"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase-client";
import { fetchUserRoles } from "@/lib/profile-queries";
import { T } from "@/lib/constants";
import { Search, Home, Briefcase, Building2, HardHat, KeyRound, Clock, CheckCircle2, MessageCircle, CalendarDays } from "lucide-react";

const TILES = [
  {
    role: "buyer",
    icon: Search,
    title: "Find a Property",
    text: "Search, save favourites, and contact agents directly.",
    instant: true,
  },
  {
    role: "owner",
    icon: Home,
    title: "Sell or Rent My Property",
    text: "List your own property. No agent licence required.",
    instant: true,
  },
  {
    role: "agent",
    icon: Briefcase,
    title: "Become an Agent",
    text: "Apply as a professional agent. Requires admin approval.",
    instant: false,
  },
  {
    role: "agency",
    icon: Building2,
    title: "Register My Agency",
    text: "Add your agency, manage agents and listings as a team.",
    instant: false,
  },
  {
    role: "developer",
    icon: HardHat,
    title: "Register as a Developer",
    text: "List and manage multi-unit development projects.",
    instant: false,
  },
  {
    role: "property_manager",
    icon: KeyRound,
    title: "Become a Property Manager",
    text: "Manage tenants and maintenance for property owners.",
    instant: false,
  },
];

function StatusPill({ status }) {
  if (status === "approved") {
    return (
      <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 700, color: T.green, background: T.greenL, padding: "3px 8px", borderRadius: 999 }}>
        <CheckCircle2 size={12} /> Active
      </span>
    );
  }
  if (status === "pending") {
    return (
      <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 700, color: T.gold, background: "#FDF3E0", padding: "3px 8px", borderRadius: 999 }}>
        <Clock size={12} /> Pending Verification
      </span>
    );
  }
  if (status === "rejected") {
    return (
      <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 700, color: T.red, background: T.redL, padding: "3px 8px", borderRadius: 999 }}>
        Not Approved
      </span>
    );
  }
  return null;
}

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [roles, setRoles] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getUser().then(async ({ data }) => {
      if (!mounted) return;
      if (!data.user) {
        router.push("/login");
        return;
      }
      setUser(data.user);
      const { profile, roles } = await fetchUserRoles(data.user.id);
      if (!mounted) return;
      setProfile(profile);
      setRoles(roles);
      setLoading(false);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const handleTileClick = (tile) => {
    if (tile.role === "buyer") {
      router.push("/listings");
      return;
    }
    if (tile.role === "owner") {
      if (roles.owner) {
        router.push("/dashboard/owner");
      } else {
        router.push("/dashboard/apply/owner");
      }
      return;
    }
    // professional roles
    const existing = roles[tile.role];
    if (existing?.status === "approved") {
      router.push("/admin");
      return;
    }
    router.push(`/dashboard/apply/${tile.role}`);
  };

  if (loading) {
    return (
      <div style={{ minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center", color: T.gray2 }}>
        Loading your dashboard…
      </div>
    );
  }

  return (
    <div style={{ background: T.bg, minHeight: "90vh", padding: "48px 24px" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <p style={{ color: T.gold, fontWeight: 700, fontSize: 11, letterSpacing: 2, textTransform: "uppercase", margin: "0 0 6px" }}>
          <Link href="/dashboard" style={{ color: T.gold }}>← Dashboard</Link>
        </p>
        <h1 style={{ color: T.navy, fontWeight: 900, fontSize: 30, margin: "0 0 8px" }}>
          My Roles & Professional Services
        </h1>
        <p style={{ color: T.gray2, fontSize: 14, margin: "0 0 36px" }}>
          You can take on more than one role over time — nothing here is locked in.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 18 }}>
          {TILES.map((tile) => {
            const Icon = tile.icon;
            const roleData = tile.role === "buyer" ? null : roles[tile.role];
            const status = tile.role === "owner" ? (roleData ? "approved" : null) : roleData?.status;

            return (
              <button
                key={tile.role}
                onClick={() => handleTileClick(tile)}
                style={{
                  textAlign: "left",
                  background: "#fff",
                  border: `1px solid ${T.border}`,
                  borderRadius: 12,
                  padding: 20,
                  cursor: "pointer",
                  boxShadow: T.shadow,
                  transition: "box-shadow .18s, transform .18s",
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = T.shadowHover;
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = T.shadow;
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: "#EFF4FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon size={20} color={T.navy} strokeWidth={2.2} />
                  </div>
                  <StatusPill status={status} />
                </div>
                <div style={{ fontWeight: 800, fontSize: 16, color: T.navy }}>{tile.title}</div>
                <div style={{ fontSize: 13, color: T.gray2, lineHeight: 1.4 }}>{tile.text}</div>
              </button>
            );
          })}
        </div>

        <p style={{ marginTop: 32, fontSize: 13, color: T.gray2 }}>
          Just here to browse?{" "}
          <Link href="/listings" style={{ color: T.navy, fontWeight: 700 }}>
            Skip to listings →
          </Link>
        </p>
      </div>
    </div>
  );
}