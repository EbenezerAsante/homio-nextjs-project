import Link from "next/link";
import { T, fmt, CAT_LABEL } from "../lib/constants";

export default function BuyerCompareTab({ listings, compareIds }) {
  const selected = (listings || []).filter((l) => compareIds?.includes(l.id));

  if (selected.length === 0) {
    return (
      <div
        style={{
          background: "#fff",
          border: `1px solid ${T.border}`,
          borderRadius: 12,
          padding: "60px 24px",
          textAlign: "center",
        }}
      >
        <p style={{ color: T.navy, fontWeight: 700, fontSize: 18, margin: "0 0 8px" }}>
          No properties selected for comparison
        </p>
        <p style={{ color: T.gray2, fontSize: 14, margin: "0 0 20px" }}>
          Go to Saved Properties and check "Compare" on up to 4 listings.
        </p>
      </div>
    );
  }

  const rows = [
    { label: "Price", get: (p) => fmt(p.price, p.listing_type) },
    { label: "Location", get: (p) => `${p.city}, ${p.region}` },
    { label: "Type", get: (p) => CAT_LABEL[p.category] || p.category },
    { label: "Bedrooms", get: (p) => p.bedrooms || "—" },
    { label: "Bathrooms", get: (p) => p.bathrooms || "—" },
    { label: "Floor Area", get: (p) => (p.sqft ? `${p.sqft.toLocaleString()} sqft` : "—") },
    { label: "Furnished", get: (p) => (p.furnished ? "Yes" : "No") },
  ];

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff", borderRadius: 10, overflow: "hidden" }}>
        <thead>
          <tr>
            <th style={{ ...thStyle, textAlign: "left" }}></th>
            {selected.map((p) => {
              const cover = p.listing_images?.[0]?.url;
              return (
                <th key={p.id} style={thStyle}>
                  {cover && (
                    <img
                      src={cover}
                      alt={p.title}
                      style={{ width: "100%", height: 90, objectFit: "cover", borderRadius: 6, marginBottom: 8 }}
                    />
                  )}
                  <Link href={`/property/${p.id}`} style={{ color: T.navy, fontWeight: 700, fontSize: 13, textDecoration: "none" }}>
                    {p.title}
                  </Link>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label}>
              <td style={{ ...tdStyle, fontWeight: 700, color: T.gray1, background: T.bg }}>{row.label}</td>
              {selected.map((p) => (
                <td key={p.id} style={tdStyle}>{row.get(p)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const thStyle = {
  padding: 14,
  borderBottom: `2px solid ${T.border}`,
  minWidth: 160,
  verticalAlign: "top",
};

const tdStyle = {
  padding: "12px 14px",
  borderBottom: `1px solid ${T.border}`,
  fontSize: 13,
  color: T.gray1,
};