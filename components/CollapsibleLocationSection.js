"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import PropertyMap from "./PropertyMap";
import { T } from "../lib/constants";

export default function CollapsibleLocationSection({ p, displayCoords }) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ background: "#fff", borderRadius: 10, padding: 24, border: `1px solid ${T.border}` }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          width: "100%",
          minWidth: 0,
          boxSizing: "border-box",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: 0,
          marginBottom: open ? 12 : 0,
        }}
      >
        <h3
          style={{
            margin: 0,
            color: T.navy,
            fontSize: 16,
            minWidth: 0,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          📍 Map &amp; Location
        </h3>
        <ChevronDown
          size={18}
          color={T.gray2}
          style={{ flexShrink: 0, transform: open ? "rotate(180deg)" : "none", transition: "transform .15s" }}
        />
      </button>

      {open && (
        displayCoords ? (
          <>
            <PropertyMap
              latitude={displayCoords.lat}
              longitude={displayCoords.lng}
              title={p.title}
              city={p.city}
              region={p.region}
            />
            <p style={{ fontSize: 12, color: T.gray3, marginTop: 10 }}>
              📍 {p.area ? `${p.area}, ` : ""}{p.city}, {p.region}
              {!displayCoords.exact && " (approximate location)"}
            </p>
          </>
        ) : (
          <div style={{ background: T.bg, borderRadius: 8, padding: "32px 20px", textAlign: "center" }}>
            <p style={{ color: T.gray2, fontSize: 13.5, margin: "0 0 4px", fontWeight: 700 }}>
              Exact location available after your viewing is confirmed
            </p>
            <p style={{ color: T.gray2, fontSize: 12.5, margin: 0 }}>
              📍 {p.area ? `${p.area}, ` : ""}{p.city}, {p.region}
            </p>
          </div>
        )
      )}
    </div>
  );
}