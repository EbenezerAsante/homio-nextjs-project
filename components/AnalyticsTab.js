import { T } from "@/lib/constants";

export default function AnalyticsTab({ analytics, listings }) {
  const byType = listings.reduce((acc, l) => {
    const key = l.category || "unspecified";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const byRegion = listings.reduce((acc, l) => {
    const key = l.region || "unspecified";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  return (
    <div>
      <div className="admin-stats-grid" style={{ marginBottom: 32 }}>
        <div className="admin-stat-card">
          <div className="stat-label">Total Views</div>
          <div className="stat-value">{analytics.totalViews}</div>
        </div>
        <div className="admin-stat-card">
          <div className="stat-label">Response Rate</div>
          <div className="stat-value">{analytics.responseRate}%</div>
        </div>
        <div className="admin-stat-card">
          <div className="stat-label">Active Listings</div>
          <div className="stat-value">{analytics.activeListings}</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        <div style={{ background: "#fff", border: `1px solid ${T.border}`, borderRadius: 10, padding: 20 }}>
          <h3 style={{ fontSize: 15, marginBottom: 14 }}>By Property Type</h3>
          {Object.entries(byType).length === 0 ? (
            <div style={{ color: T.gray2, fontSize: 13 }}>No data yet</div>
          ) : (
            Object.entries(byType).map(([type, count]) => (
              <div key={type} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${T.border}`, fontSize: 14 }}>
                <span style={{ textTransform: "capitalize" }}>{type}</span>
                <span style={{ fontWeight: 700, color: T.navy }}>{count}</span>
              </div>
            ))
          )}
        </div>

        <div style={{ background: "#fff", border: `1px solid ${T.border}`, borderRadius: 10, padding: 20 }}>
          <h3 style={{ fontSize: 15, marginBottom: 14 }}>By Region</h3>
          {Object.entries(byRegion).length === 0 ? (
            <div style={{ color: T.gray2, fontSize: 13 }}>No data yet</div>
          ) : (
            Object.entries(byRegion).map(([region, count]) => (
              <div key={region} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${T.border}`, fontSize: 14 }}>
                <span>{region}</span>
                <span style={{ fontWeight: 700, color: T.navy }}>{count}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
