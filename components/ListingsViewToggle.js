"use client";

import { useState } from "react";
import PropertyCard from "./PropertyCard";
import ListingsMap from "./ListingsMap";
import { T } from "../lib/constants";
import { LayoutGrid, Map as MapIcon } from "lucide-react";

export default function ListingsViewToggle({ listings }) {
  const [view, setView] = useState("grid");

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        <button
          onClick={() => setView("grid")}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            border: `1.5px solid ${view === "grid" ? T.navy : T.border}`,
            background: view === "grid" ? T.navy : "#fff",
            color: view === "grid" ? "#fff" : T.gray1,
            borderRadius: 8, padding: "8px 14px", fontSize: 13, fontWeight: 700, cursor: "pointer",
          }}
        >
          <LayoutGrid size={14} /> Grid
        </button>
        <button
          onClick={() => setView("map")}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            border: `1.5px solid ${view === "map" ? T.navy : T.border}`,
            background: view === "map" ? T.navy : "#fff",
            color: view === "map" ? "#fff" : T.gray1,
            borderRadius: 8, padding: "8px 14px", fontSize: 13, fontWeight: 700, cursor: "pointer",
          }}
        >
          <MapIcon size={14} /> Map
        </button>
      </div>

      {view === "map" ? (
        <ListingsMap listings={listings} />
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill,minmax(280px,300px))",
            justifyContent: "start",
            gap: 20,
          }}
        >
          {listings.map((p) => (
            <PropertyCard key={p.id} p={p} />
          ))}
        </div>
      )}
    </div>
  );
}