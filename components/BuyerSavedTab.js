import Link from "next/link";
import PropertyCard from "../components/PropertyCard";
import { T } from "../lib/constants";

export default function BuyerSavedTab({ listings, compareIds, onToggleCompare }) {
  if (!listings || listings.length === 0) {
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
          No saved properties yet
        </p>
        <p style={{ color: T.gray2, fontSize: 14, margin: "0 0 20px" }}>
          Tap the heart icon on any listing to save it here.
        </p>
        <Link href="/listings" style={{ color: T.navy, fontWeight: 700, textDecoration: "underline" }}>
          Browse listings
        </Link>
      </div>
    );
  }

  return (
    <div>
      <p style={{ fontSize: 13, color: T.gray2, marginBottom: 16 }}>
        Select up to 4 properties to compare side by side.
      </p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))",
          gap: 20,
        }}
      >
        {listings.map((p) => {
          const isSelected = compareIds?.includes(p.id);
          const disabled = !isSelected && compareIds?.length >= 4;
          return (
            <div key={p.id} style={{ position: "relative" }}>
              <label
                style={{
                  position: "absolute",
                  top: 10,
                  left: 10,
                  zIndex: 5,
                  background: "rgba(255,255,255,.95)",
                  borderRadius: 6,
                  padding: "4px 8px",
                  fontSize: 11,
                  fontWeight: 700,
                  color: disabled ? T.gray3 : T.navy,
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  cursor: disabled ? "not-allowed" : "pointer",
                  boxShadow: "0 2px 6px rgba(0,0,0,.12)",
                }}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  disabled={disabled}
                  onChange={() => onToggleCompare?.(p.id)}
                  style={{ margin: 0 }}
                />
                Compare
              </label>
              <PropertyCard p={p} />
            </div>
          );
        })}
      </div>
    </div>
  );
}