import Link from "next/link";
import { T } from "@/lib/constants";

export default function OverviewTab({ analytics, listings, enquiries, agent, onNavigate }) {
  const recentEnquiries = enquiries.slice(0, 5);
  const recentListings = listings.slice(0, 5);

  const cards = [
    { label: "Total Listings", value: analytics.totalListings },
    { label: "Active Listings", value: analytics.activeListings },
    { label: "Total Views", value: analytics.totalViews },
    { label: "Enquiries", value: analytics.totalEnquiries },
    { label: "Pending Enquiries", value: analytics.pendingEnquiries },
    { label: "Response Rate", value: `${analytics.responseRate}%` },
  ];

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: T.navy, margin: "0 0 4px" }}>
          Welcome back, {agent?.full_name?.split(" ")[0] || "there"} 👋
        </h2>
        <p style={{ fontSize: 13, color: T.gray2, margin: "0 0 16px" }}>
          Here's what's happening with your listings today.
        </p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button
            onClick={() => onNavigate?.("listings")}
            style={{
              background: T.gold,
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "9px 18px",
              fontWeight: 700,
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            + Add New Listing
          </button>
          <button
            onClick={() => onNavigate?.("enquiries")}
            style={{
              border: `1.5px solid ${T.navy}`,
              color: T.navy,
              background: "none",
              borderRadius: 8,
              padding: "9px 18px",
              fontWeight: 700,
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            View All Enquiries
          </button>
        </div>
      </div>

      <div className="admin-stats-grid">
        {cards.map((c) => (
          <div className="admin-stat-card" key={c.label}>
            <div className="stat-label">{c.label}</div>
            <div className="stat-value">{c.value}</div>
          </div>
        ))}
      </div>

      <h3 style={{ fontSize: 16, marginBottom: 12, color: T.text }}>Recent Listings</h3>
      <table className="admin-table" style={{ marginBottom: 32 }}>
        <thead>
          <tr>
            <th>Title</th>
            <th>Type</th>
            <th>Price</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {recentListings.length === 0 ? (
            <tr><td colSpan={4} style={{ textAlign: "center", color: T.gray2 }}>No listings yet</td></tr>
          ) : (
            recentListings.map((l) => (
              <tr key={l.id}>
                <td>{l.title}</td>
                <td>{l.listing_type}</td>
                <td>{l.currency || "GHS"} {l.price?.toLocaleString()}</td>
                <td><span className={`admin-badge ${l.status}`}>{l.status}</span></td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <h3 style={{ fontSize: 16, marginBottom: 12, color: T.text }}>Recent Enquiries</h3>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Listing</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {recentEnquiries.length === 0 ? (
            <tr><td colSpan={3} style={{ textAlign: "center", color: T.gray2 }}>No enquiries yet</td></tr>
          ) : (
            recentEnquiries.map((e) => (
              <tr key={e.id}>
                <td>{e.name}</td>
                <td>{e.listings?.title || "—"}</td>
                <td><span className={`admin-badge ${e.status}`}>{e.status}</span></td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}