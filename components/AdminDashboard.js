"use client";

import { useEffect, useState } from "react";
import { fetchAgentListings, fetchAgentEnquiries, buildAnalytics } from "@/lib/admin-queries";
import { fetchAgentAppointments } from "@/lib/appointments-queries";
import { fetchAgentConversationsV2 } from "@/lib/conversation-queries";
import { T } from "@/lib/constants";
import OverviewTab from "./OverviewTab";
import ListingsTab from "./ListingsTab";
import EnquiriesTab from "./EnquiriesTab";
import AppointmentsTab from "./AppointmentsTab";
import AnalyticsTab from "./AnalyticsTab";
import ProfileTab from "./ProfileTab";
import SecurityTab from "./SecurityTab";
import "../styles/admin.css";

const NAV_ITEMS = [
  { id: "overview", label: "Overview" },
  { id: "listings", label: "Listings" },
  { id: "enquiries", label: "Messages" },
  { id: "appointments", label: "Appointments" },
  { id: "analytics", label: "Analytics" },
  { id: "profile", label: "Profile" },
  { id: "security", label: "Security" },
];

export default function AdminDashboard({ agent, userId }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [listings, setListings] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    setLoading(true);
    // enquiries is still fetched for Analytics/Overview, which read
    // fields (responded_at) that conversations don't have — those two
    // tabs migrate to the unified system separately. conversations
    // powers the Messages tab itself.
    const [l, e, c, a] = await Promise.all([
      fetchAgentListings(userId),
      fetchAgentEnquiries(userId),
      fetchAgentConversationsV2(userId),
      fetchAgentAppointments(userId),
    ]);
    setListings(l);
    setEnquiries(e);
    setConversations(c);
    setAppointments(a);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, [userId]);

  const analytics = buildAnalytics(listings, enquiries);

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-logo">
          Homio<span>.</span>
        </div>
        {NAV_ITEMS.map((item) => (
          <div
            key={item.id}
            className={`admin-nav-item ${activeTab === item.id ? "active" : ""}`}
            onClick={() => setActiveTab(item.id)}
          >
            {item.label}
          </div>
        ))}
      </aside>

      <main className="admin-main">
        <div className="admin-header">
          <h1>
            {NAV_ITEMS.find((n) => n.id === activeTab)?.label}
          </h1>
          <div style={{ fontSize: 14, color: T.gray2 }}>
            {agent?.company || agent?.full_name || "Agent"}
          </div>
        </div>

        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: T.gray2 }}>Loading...</div>
        ) : (
          <>
            {activeTab === "overview" && (
              <OverviewTab
                analytics={analytics}
                listings={listings}
                enquiries={enquiries}
                agent={agent}
                onNavigate={setActiveTab}
              />
            )}
            {activeTab === "listings" && <ListingsTab listings={listings} userId={userId} onChange={loadData} />}
            {activeTab === "enquiries" && <EnquiriesTab conversations={conversations} userId={userId} onChange={loadData} />}
            {activeTab === "appointments" && <AppointmentsTab appointments={appointments} onChange={loadData} />}
            {activeTab === "analytics" && <AnalyticsTab analytics={analytics} listings={listings} />}
            {activeTab === "profile" && <ProfileTab agent={agent} userId={userId} />}
            {activeTab === "security" && <SecurityTab />}
          </>
        )}
      </main>
    </div>
  );
}