"use client";

import { useState } from "react";
import Link from "next/link";
import { T } from "../lib/constants";
import { SlidersHorizontal, X } from "lucide-react";

const inputStyle = {
  width: "100%",
  padding: "8px 10px",
  border: `1px solid ${T.border}`,
  borderRadius: 6,
  fontSize: 14,
  color: T.gray1,
  boxSizing: "border-box",
};

function FieldLabel({ children }) {
  return (
    <p style={{ color: T.navy, fontWeight: 700, fontSize: 12, letterSpacing: 0.5, textTransform: "uppercase", margin: "0 0 6px" }}>
      {children}
    </p>
  );
}

function TypeLink({ href, active, children, onClick }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      style={{
        flex: 1,
        textAlign: "center",
        padding: "8px 0",
        borderRadius: 6,
        fontSize: 13,
        fontWeight: 700,
        textDecoration: "none",
        background: active ? T.navy : T.bg,
        color: active ? "#fff" : T.gray1,
        border: `1px solid ${active ? T.navy : T.border}`,
      }}
    >
      {children}
    </Link>
  );
}

export default function ListingsFilterPanel({
  type,
  region,
  category,
  beds,
  minPrice,
  maxPrice,
  furnished,
  q,
  sort,
  regions,
  categories,
  catLabel,
  resultCount,
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const typeHref = (t) => {
    const params = new URLSearchParams({ region, category, beds, minPrice, maxPrice, q, sort });
    if (furnished) params.set("furnished", furnished);
    if (t) params.set("type", t);
    [...params.keys()].forEach((k) => { if (!params.get(k)) params.delete(k); });
    return `/listings?${params.toString()}`;
  };

  return (
    <>
      {/* Mobile trigger bar — hidden on desktop */}
      <div className="homio-mobile-filter-trigger" style={{ display: "none", gap: 10, marginBottom: 16 }}>
        <button
          onClick={() => setMobileOpen(true)}
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            background: "#fff",
            border: `1.5px solid ${T.border}`,
            borderRadius: 8,
            padding: "10px 0",
            fontWeight: 700,
            fontSize: 13.5,
            color: T.gray1,
            cursor: "pointer",
          }}
        >
          <SlidersHorizontal size={15} /> Filters &amp; Sort
        </button>
      </div>

      <aside className={`homio-filter-panel${mobileOpen ? " is-open-mobile" : ""}`} style={{ background: "#fff", border: `1px solid ${T.border}`, borderRadius: 12, padding: 20, height: "fit-content" }}>
        <div className="homio-filter-close-btn" style={{ display: "none", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <span style={{ fontWeight: 800, fontSize: 16, color: T.navy }}>
            Filters {resultCount != null && <span style={{ fontWeight: 400, color: T.gray2, fontSize: 13 }}>({resultCount} results)</span>}
          </span>
          <button
            onClick={() => setMobileOpen(false)}
            style={{ background: T.bg, border: "none", borderRadius: 8, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
          >
            <X size={16} color={T.gray1} />
          </button>
        </div>

        <form method="GET" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <FieldLabel>Type</FieldLabel>
            <div style={{ display: "flex", gap: 8 }}>
              <TypeLink href={typeHref("")} active={!type}>All</TypeLink>
              <TypeLink href={typeHref("sale")} active={type === "sale"}>For Sale</TypeLink>
              <TypeLink href={typeHref("rent")} active={type === "rent"}>To Let</TypeLink>
            </div>
          </div>

          <input type="hidden" name="type" value={type} />

          <div>
            <FieldLabel>Search</FieldLabel>
            <input name="q" defaultValue={q} placeholder="City, area, title..." style={inputStyle} />
          </div>

          <div>
            <FieldLabel>Region</FieldLabel>
            <select name="region" defaultValue={region} style={inputStyle}>
              <option value="">All Regions</option>
              {(regions || []).map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          <div>
            <FieldLabel>Category</FieldLabel>
            <select name="category" defaultValue={category} style={inputStyle}>
              <option value="">All Categories</option>
              {categories.map((c) => <option key={c} value={c}>{catLabel[c]}</option>)}
            </select>
          </div>

          <div>
            <FieldLabel>Min Bedrooms</FieldLabel>
            <select name="beds" defaultValue={beds} style={inputStyle}>
              <option value="">Any</option>
              {[1, 2, 3, 4, 5, 6].map((n) => <option key={n} value={n}>{n}+</option>)}
            </select>
          </div>

          <div>
            <FieldLabel>Price Range (GH₵)</FieldLabel>
            <div style={{ display: "flex", gap: 8 }}>
              <input name="minPrice" defaultValue={minPrice} placeholder="Min" type="number" style={inputStyle} />
              <input name="maxPrice" defaultValue={maxPrice} placeholder="Max" type="number" style={inputStyle} />
            </div>
          </div>

          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: T.gray1 }}>
            <input type="checkbox" name="furnished" value="yes" defaultChecked={furnished === "yes"} />
            Furnished only
          </label>

          <div>
            <FieldLabel>Sort By</FieldLabel>
            <select name="sort" defaultValue={sort} style={inputStyle}>
              <option value="newest">Newest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>

          <button
            type="submit"
            style={{ background: T.gold, color: T.navyD, border: "none", borderRadius: 8, padding: "10px 0", fontWeight: 700, fontSize: 14, cursor: "pointer" }}
          >
            Apply Filters
          </button>

          <Link href="/listings" style={{ textAlign: "center", fontSize: 13, color: T.gray2, textDecoration: "underline" }}>
            Clear all filters
          </Link>
        </form>
      </aside>

      <style jsx global>{`
        @media (max-width: 860px) {
          .homio-listings-grid {
            grid-template-columns: 1fr !important;
          }
          .homio-mobile-filter-trigger {
            display: flex !important;
          }
          .homio-filter-panel {
            display: none;
          }
          .homio-filter-panel.is-open-mobile {
            display: block !important;
            position: fixed;
            inset: 0;
            z-index: 3000;
            background: #fff;
            overflow-y: auto;
            border-radius: 0;
            border: none;
            padding: 20px;
          }
          .homio-filter-panel.is-open-mobile .homio-filter-close-btn {
            display: flex !important;
          }
        }
      `}</style>
    </>
  );
}