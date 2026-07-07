"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { T, REGIONS, CAT_LABEL } from "../lib/constants";

export default function SearchWidget() {
  const router = useRouter();
  const [type, setType] = useState("sale");
  const [region, setRegion] = useState("All Regions");
  const [category, setCategory] = useState("");
  const [q, setQ] = useState("");

  const search = () => {
    const params = new URLSearchParams();
    params.set("type", type);
    if (region !== "All Regions") params.set("region", region);
    if (category) params.set("category", category);
    if (q) params.set("q", q);
    router.push(`/listings?${params.toString()}`);
  };

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 12,
        padding: 20,
        boxShadow: "0 24px 64px rgba(0,0,0,0.28)",
        textAlign: "left",
        maxWidth: 660,
        margin: "0 auto",
      }}
    >
      <div style={{ display: "flex", gap: 0, marginBottom: 16, borderBottom: `1px solid ${T.border}`, paddingBottom: 12 }}>
        {[["sale", "For Sale"], ["rent", "For Rent"]].map(([v, l]) => (
          <button
            key={v}
            onClick={() => setType(v)}
            style={{
              border: "none",
              padding: "6px 20px",
              borderRadius: 6,
              fontWeight: 700,
              fontSize: 14,
              cursor: "pointer",
              color: type === v ? "#fff" : T.gray2,
              background: type === v ? T.navy : "transparent",
            }}
          >
            {l}
          </button>
        ))}
      </div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <select
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          style={{
            flex: "0 0 150px",
            border: `1.5px solid ${T.border}`,
            borderRadius: 8,
            padding: "9px 12px",
            fontSize: 14,
          }}
        >
          <option>All Regions</option>
          {REGIONS.map((r) => (
            <option key={r}>{r}</option>
          ))}
        </select>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={{
            flex: "0 0 150px",
            border: `1.5px solid ${T.border}`,
            borderRadius: 8,
            padding: "9px 12px",
            fontSize: 14,
          }}
        >
          <option value="">All Types</option>
          {Object.keys(CAT_LABEL || {}).map((c) => (
            <option key={c} value={c}>{CAT_LABEL[c]}</option>
          ))}
        </select>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="City, area or postcode…"
          onKeyDown={(e) => e.key === "Enter" && search()}
          style={{
            flex: 1,
            minWidth: 140,
            border: `1.5px solid ${T.border}`,
            borderRadius: 8,
            padding: "9px 13px",
            fontSize: 14,
          }}
        />
        <button
          onClick={search}
          style={{
            background: T.gold,
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "10px 22px",
            fontWeight: 700,
            fontSize: 14,
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          🔍 Search
        </button>
      </div>
    </div>
  );
}