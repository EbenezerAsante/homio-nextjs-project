"use client";

import { useState } from "react";
import { T } from "../lib/constants";

export default function PropertyGallery({ images, title }) {
  const [active, setActive] = useState(0);
  const list = images.length ? images : ["https://via.placeholder.com/800x500?text=Homio"];

  return (
    <div style={{ width: "100%", minWidth: 0, boxSizing: "border-box" }}>
      <div
        className="homio-detail-gallery"
        style={{ position: "relative", width: "100%", boxSizing: "border-box", borderRadius: 12, overflow: "hidden", marginBottom: 10, height: 420, background: "#111" }}
      >
        <img src={list[active]} alt={title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />

        {list.length > 1 && (
          <>
            <button
              onClick={() => setActive((i) => (i - 1 + list.length) % list.length)}
              aria-label="Previous photo"
              style={{
                position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
                background: "rgba(0,0,0,.5)", color: "#fff", border: "none", borderRadius: 6,
                width: 36, height: 36, fontSize: 18, cursor: "pointer", zIndex: 2,
              }}
            >
              ‹
            </button>
            <button
              onClick={() => setActive((i) => (i + 1) % list.length)}
              aria-label="Next photo"
              style={{
                position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                background: "rgba(0,0,0,.5)", color: "#fff", border: "none", borderRadius: 6,
                width: 36, height: 36, fontSize: 18, cursor: "pointer", zIndex: 2,
              }}
            >
              ›
            </button>
            <div
              style={{
                position: "absolute", bottom: 10, right: 12,
                background: "rgba(0,0,0,.6)", color: "#fff", fontSize: 12, fontWeight: 600,
                padding: "3px 10px", borderRadius: 999,
              }}
            >
              {active + 1} / {list.length}
            </div>
          </>
        )}
      </div>

      {list.length > 1 && (
        <div style={{ display: "flex", gap: 8, width: "100%", maxWidth: "100%", boxSizing: "border-box", overflowX: "auto", paddingBottom: 4 }}>
          {list.map((src, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              style={{
                flexShrink: 0,
                width: 80,
                height: 56,
                borderRadius: 6,
                overflow: "hidden",
                cursor: "pointer",
                padding: 0,
                border: `2px solid ${i === active ? T.gold : T.border}`,
                transition: "border-color .15s",
              }}
            >
              <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}