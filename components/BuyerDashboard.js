"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "../lib/supabase-client";
import { T } from "../lib/constants";
import BuyerOverviewTab from "./BuyerOverviewTab";
import BuyerSavedTab from "./BuyerSavedTab";
import BuyerCompareTab from "./BuyerCompareTab";
import BuyerRecentlyViewedTab from "./BuyerRecentlyViewedTab";
import BuyerSavedSearchesTab from "./BuyerSavedSearchesTab";
import BuyerMortgageTab from "./BuyerMortgageTab";
import BuyerProfileTab from "./BuyerProfileTab";
import SecurityTab from "./SecurityTab";
import "../styles/admin.css";

const NAV_ITEMS = [
  { id: "overview", label: "Overview" },
  { id: "search", label: "Search Properties" },
  { id: "saved", label: "Saved Properties" },
  { id: "searches", label: "Saved Searches" },
  { id: "recent", label: "Recently Viewed" },
  { id: "compare", label: "Compare Properties" },
  { id: "mortgage", label: "Mortgage Calculator" },
  { id: "profile", label: "Profile" },
  { id: "security", label: "Security" },
];

export default function BuyerDashboard({ user }) {
  const supabase = createClient();
  const [activeTab, setActiveTab] = useState("overview");
  const [listings, setListings] = useState([]);
  const [compareIds, setCompareIds] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadFavorites() {
    setLoading(true);

    const { data: favRows } = await supabase
      .from("favorites")
      .select("listing_id, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!favRows || favRows.length === 0) {
      setListings([]);
      setLoading(false);
      return;
    }

    const listingIds = favRows.map((r) => r.listing_id);
    const { data: listingRows } = await supabase
      .from("listings")
      .select("*, listing_images(url, sort_order)")
      .in("id", listingIds);

    const ordered = listingIds.map((id) => listingRows?.find((l) => l.id === id)).filter(Boolean);
    setListings(ordered);
    setLoading(false);
  }

  useEffect(() => {
    loadFavorites();
  }, [user.id]);

  const toggleCompare = (id) => {
    setCompareIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 4) return prev; // cap at 4
      return [...prev, id];
    });
  };

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
          <h1>{NAV_ITEMS.find((n) => n.id === activeTab)?.label}</h1>
          <div style={{ fontSize: 14, color: T.gray2 }}>
            {user?.user_metadata?.full_name || user?.email}
          </div>
        </div>

        {loading && (activeTab === "saved" || activeTab === "compare") ? (
          <div style={{ padding: 40, textAlign: "center", color: T.gray2 }}>Loading...</div>
        ) : (
          <>
            {activeTab === "overview" && (
              <BuyerOverviewTab user={user} savedCount={listings.length} onNavigate={setActiveTab} />
            )}

            {activeTab === "search" && (
              <div style={{ padding: 24, textAlign: "center" }}>
                <p style={{ color: T.gray2, marginBottom: 16 }}>
                  Head to the full listings page to search and filter properties.
                </p>
                <Link
                  href="/listings"
                  style={{
                    display: "inline-block",
                    background: T.gold,
                    color: "#fff",
                    borderRadius: 8,
                    padding: "10px 24px",
                    fontWeight: 700,
                    fontSize: 14,
                    textDecoration: "none",
                  }}
                >
                  Go to Search
                </Link>
              </div>
            )}

            {activeTab === "saved" && (
              <BuyerSavedTab listings={listings} compareIds={compareIds} onToggleCompare={toggleCompare} />
            )}

            {activeTab === "searches" && <BuyerSavedSearchesTab userId={user.id} />}

            {activeTab === "recent" && <BuyerRecentlyViewedTab />}

            {activeTab === "compare" && <BuyerCompareTab listings={listings} compareIds={compareIds} />}

            {activeTab === "mortgage" && <BuyerMortgageTab />}

            {activeTab === "profile" && <BuyerProfileTab user={user} />}

            {activeTab === "security" && <SecurityTab />}
          </>
        )}
      </main>
    </div>
  );
}