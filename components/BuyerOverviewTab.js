import { T } from "../lib/constants";

export default function BuyerOverviewTab({ user, savedCount, onNavigate }) {
  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("en-GB", { month: "long", year: "numeric" })
    : "—";

  const firstName = user?.user_metadata?.full_name?.split(" ")[0] || "there";

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: T.navy, margin: "0 0 4px" }}>
          Welcome back, {firstName} 👋
        </h2>
        <p style={{ fontSize: 13, color: T.gray2, margin: "0 0 16px" }}>
          Here's a quick look at your Homio account.
        </p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button
            onClick={() => onNavigate?.("saved")}
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
            View Saved Properties
          </button>
          <a
            href="/listings"
            style={{
              border: `1.5px solid ${T.navy}`,
              color: T.navy,
              borderRadius: 8,
              padding: "9px 18px",
              fontWeight: 700,
              fontSize: 13,
              textDecoration: "none",
            }}
          >
            Browse Listings
          </a>
        </div>
      </div>

      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="stat-label">Saved Properties</div>
          <div className="stat-value">{savedCount}</div>
        </div>
        <div className="admin-stat-card">
          <div className="stat-label">Member Since</div>
          <div className="stat-value" style={{ fontSize: 18 }}>{memberSince}</div>
        </div>
      </div>
    </div>
  );
}