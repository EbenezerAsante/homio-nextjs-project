"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import { T, REGIONS, CAT_LABEL } from "../lib/constants";

export default function FilterSidebar({ searchParams }) {
  const router = useRouter();
  const pathname = usePathname();

  const [type, setType] = useState(searchParams.type || "all");
  const [region, setRegion] = useState(searchParams.region || "");
  const [category, setCategory] = useState(searchParams.category || "");
  const [beds, setBeds] = useState(searchParams.beds || "");
  const [minPrice, setMinPrice] = useState(searchParams.minPrice || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.maxPrice || "");
  const [furnished, setFurnished] = useState(searchParams.furnished === "true");

  const apply = (overrides = {}) => {
    const params = new URLSearchParams();
    const state = { type, region, category, beds, minPrice, maxPrice, furnished, ...overrides };
    if (state.type && state.type !== "all") params.set("type", state.type);
    if (state.region) params.set("region", state.region);
    if (state.category) params.set("category", state.category);
    if (state.beds) params.set("beds", state.beds);
    if (state.minPrice) params.set("minPrice", state.minPrice);
    if (state.maxPrice) params.set("maxPrice", state.maxPrice);
    if (state.furnished) params.set("furnished", "true");
    router.push(`${pathname}?${params.toString()}`);
  };

  const clearAll = () => {
    setType("all"); setRegion(""); setCategory(""); setBeds("");
    setMinPrice(""); setMaxPrice(""); setFurnished(false);
    router.push(pathname);
  };

  const FLabel = ({ children }) => (
    <div style={{ fontSize: 11, fontWeight: 700, color: T.gray2, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 6 }}>
      {children}
    </div>
  );
  const selectStyle = { width: "100%", border: `1.5px solid ${T.border}`, borderRadius: 8, padding: "9px 12px", fontSize: 14, marginBottom: 16 };
  const inputStyle = { width: "100%", border: `1.5px solid ${T.border}`, borderRadius: 8, padding: "9px 12px", fontSize: 14, marginBottom: 10, boxSizing: "border-box" };

  return (
    <aside
      className="homio-filter-sidebar"
      style={{
        width: 240,
        flexShrink: 0,
        background: "#fff",
        borderRadius: 10,
        boxShadow: T.shadow,
        padding: 20,
        border: `1px solid ${T.border}`,
        position: "sticky",
        top: 80,
      }}
    >
      <div style={{ fontWeight: 800, fontSize: 16, color: T.navy, marginBottom: 20 }}>Filters</div>

      <FLabel>Listing Type</FLabel>
      <select value={type} onChange={(e) => { setType(e.target.value); apply({ type: e.target.value }); }} style={selectStyle}>
        <option value="all">Sale & Rent</option>
        <option value="sale">For Sale</option>
        <option value="rent">To Let</option>
      </select>

      <FLabel>Region</FLabel>
      <select value={region} onChange={(e) => { setRegion(e.target.value); apply({ region: e.target.value }); }} style={selectStyle}>
        <option value="">All Regions</option>
        {REGIONS.map((r) => (
          <option key={r} value={r}>{r}</option>
        ))}
      </select>

      <FLabel>Property Type</FLabel>
      <select value={category} onChange={(e) => { setCategory(e.target.value); apply({ category: e.target.value }); }} style={selectStyle}>
        <option value="">Any Type</option>
        {Object.entries(CAT_LABEL).map(([k, l]) => (
          <option key={k} value={k}>{l}</option>
        ))}
      </select>

      <FLabel>Bedrooms</FLabel>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
        {[["", "Any"], ["1", "1+"], ["2", "2+"], ["3", "3+"], ["4", "4+"]].map(([v, l]) => (
          <button
            key={v}
            onClick={() => { setBeds(v); apply({ beds: v }); }}
            style={{
              padding: "5px 11px",
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 700,
              border: `1.5px solid ${beds === v ? T.navy : T.border}`,
              background: beds === v ? T.navy : "#fff",
              color: beds === v ? "#fff" : T.gray2,
              cursor: "pointer",
            }}
          >
            {l}
          </button>
        ))}
      </div>

      <FLabel>Min Price (GH₵)</FLabel>
      <input value={minPrice} onChange={(e) => setMinPrice(e.target.value)} onBlur={() => apply()} type="number" placeholder="e.g. 500" style={inputStyle} />
      <FLabel>Max Price (GH₵)</FLabel>
      <input value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} onBlur={() => apply()} type="number" placeholder="e.g. 1,000,000" style={{ ...inputStyle, marginBottom: 16 }} />

      <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 14, color: T.gray1, marginBottom: 20 }}>
        <input
          type="checkbox"
          checked={furnished}
          onChange={(e) => { setFurnished(e.target.checked); apply({ furnished: e.target.checked }); }}
          style={{ width: 16, height: 16 }}
        />
        Furnished only
      </label>

      <button
        onClick={clearAll}
        style={{ width: "100%", background: T.bg, color: T.gray1, border: "none", borderRadius: 8, padding: "9px", fontWeight: 700, fontSize: 13, cursor: "pointer" }}
      >
        Clear all filters
      </button>
    </aside>
  );
}
