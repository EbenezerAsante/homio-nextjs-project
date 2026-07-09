"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase-client";
import { fetchUserRoles } from "@/lib/profile-queries";
import { fetchDashboardStats, fetchRecentActivity } from "@/lib/dashboard-queries";
import { T } from "@/lib/constants";
import {
  Search,
  Heart,
  Calendar,
  MessageCircle,
  ChevronRight,
  CheckCircle2,
  Clock,
  Bookmark,
  MailQuestion,
  CalendarCheck,
} from "lucide-react";

const ACTIVITY_ICON = {
  saved: Bookmark,
  enquiry: MailQuestion,
  appointment: CalendarCheck,
};

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function StatCard({ icon: Icon, label, value, href }) {
  return (
    <Link
      href={href}
      style={{
        background: "#fff",
        border: `1px solid ${T.border}`,
        borderRadius: 12,
        padding: 20,
        boxShadow: T.shadow,
        display: "flex",
        alignItems: "center",
        gap: 14,
      }}
    >
      <div style={{ width: 42, height: 42, borderRadius: 10, background: "#EFF4FF", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Icon size={20} color={T.navy} strokeWidth={2.2} />
      </div>
      <div>
        <div style={{ fontSize: 22, fontWeight: 900, color: T.navy, lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 12.5, color: T.gray2, marginTop: 3 }}>{label}</div>
      </div>
    </Link>
  );
}

const ROLE_LABELS = {
  owner: "Owner",
  agent: "Agent",
  agency: "Agency",
  developer: "Developer",
  property_manager: "Property Manager",
};

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClient();
  const [profile, setProfile] = useState(null);
  const [roles, setRoles] = useState({});
  const [stats, setStats] = useState({ saved: 0, upcomingViewings: 0, unreadMessages: 0 });
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) {
        router.push("/login");
        return;
      }
      const [{ profile, roles }, statsData, activityData] = await Promise.all([
        fetchUserRoles(data.user.id),
        fetchDashboardStats(data.user.id),
        fetchRecentActivity(data.user.id),
      ]);
      if (!mounted) return;
      setProfile(profile);
      setRoles(roles);
      setStats(statsData);
      setActivity(activityData);
      setLoading(false);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const activeRoles = Object.entries(roles).filter(([role, data]) => {
    if (!data) return false;
    if (role === "owner") return true;
    return data.status === "approved";
  });
  const pendingRoles = Object.entries(roles).filter(([role, data]) => data?.status === "pending");

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
          Welcome back{profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""} 👋
        </p>
        <h1 style={{ color: T.navy, fontWeight: 900, fontSize: 28, margin: "0 0 32px" }}>
          Here's what's happening with your account today.
        </h1>

        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 16, marginBottom: 32 }}>
          <StatCard icon={Heart} label="Saved Properties" value={stats.saved} href="/saved" />
          <StatCard icon={Calendar} label="Upcoming Viewings" value={stats.upcomingViewings} href="/dashboard/appointments" />
          <StatCard icon={MessageCircle} label="Unread Messages" value={stats.unreadMessages} href="/dashboard/messages" />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 24 }}>
          {/* Recent activity */}
          <div style={{ background: "#fff", border: `1px solid ${T.border}`, borderRadius: 12, padding: 24, boxShadow: T.shadow }}>
            <h2 style={{ fontSize: 15, fontWeight: 800, color: T.navy, margin: "0 0 16px" }}>Recent Activity</h2>
            {activity.length === 0 ? (
              <div style={{ color: T.gray2, fontSize: 13.5 }}>
                Nothing yet — start by{" "}
                <Link href="/listings" style={{ color: T.navy, fontWeight: 700 }}>browsing listings</Link>.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {activity.map((item, i) => {
                  const Icon = ACTIVITY_ICON[item.type] || Bookmark;
                  return (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <Icon size={15} color={T.navy} />
                      </div>
                      <div style={{ flex: 1, fontSize: 13.5, color: T.gray1 }}>{item.label}</div>
                      <div style={{ fontSize: 11.5, color: T.gray2, whiteSpace: "nowrap" }}>{timeAgo(item.at)}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Roles summary */}
          <div style={{ background: "#fff", border: `1px solid ${T.border}`, borderRadius: 12, padding: 24, boxShadow: T.shadow }}>
            <h2 style={{ fontSize: 15, fontWeight: 800, color: T.navy, margin: "0 0 16px" }}>Your Roles</h2>

            {activeRoles.length === 0 && pendingRoles.length === 0 ? (
              <div style={{ color: T.gray2, fontSize: 13.5, marginBottom: 16 }}>
                You're set up as a buyer. Want to list a property or offer professional services?
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
                {activeRoles.map(([role]) => (
                  <div key={role} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, color: T.gray1 }}>
                    <CheckCircle2 size={15} color={T.green} /> {ROLE_LABELS[role]} Active
                  </div>
                ))}
                {pendingRoles.map(([role]) => (
                  <div key={role} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, color: T.gray1 }}>
                    <Clock size={15} color={T.gold} /> {ROLE_LABELS[role]} Application Pending
                  </div>
                ))}
              </div>
            )}

            <Link
              href="/dashboard/roles"
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4, border: `1.5px solid ${T.navy}`, color: T.navy, borderRadius: 8, padding: "9px 0", fontSize: 13, fontWeight: 700 }}
            >
              Manage Roles <ChevronRight size={14} />
            </Link>
          </div>
        </div>

        <p style={{ marginTop: 28, fontSize: 13, color: T.gray2 }}>
          Looking for a property?{" "}
          <Link href="/listings" style={{ color: T.navy, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 4 }}>
            <Search size={13} /> Browse listings
          </Link>
        </p>
      </div>
    </div>
  );
}