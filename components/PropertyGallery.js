"use client";

import { useState, useEffect, useRef } from "react";
import { T } from "../lib/constants";
import { X } from "lucide-react";

export default function PropertyGallery({ images, title }) {
  const [active, setActive] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const list = images.length ? images : ["https://via.placeholder.com/800x500?text=Homio"];
  const touchStartX = useRef(null);

  const goPrev = () => setActive((i) => (i - 1 + list.length) % list.length);
  const goNext = () => setActive((i) => (i + 1) % list.length);

  // Lock page scroll while the full-screen viewer is open
  useEffect(() => {
    if (!fullscreen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [fullscreen]);

  // Keyboard support (desktop) while full-screen
  useEffect(() => {
    if (!fullscreen) return;
    const handleKey = (e) => {
      if (e.key === "Escape") setFullscreen(false);
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [fullscreen, list.length]);

  function handleTouchStart(e) {
    touchStartX.current = e.touches[0].clientX;
  }
  function handleTouchEnd(e) {
    if (touchStartX.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(deltaX) > 40) {
      if (deltaX > 0) goPrev();
      else goNext();
    }
    touchStartX.current = null;
  }

  return (
    <div style={{ width: "100%", minWidth: 0, boxSizing: "border-box" }}>
      <div
        className="homio-detail-gallery"
        onClick={() => setFullscreen(true)}
        style={{ position: "relative", width: "100%", boxSizing: "border-box", borderRadius: 12, overflow: "hidden", marginBottom: 10, height: 420, background: "#111", cursor: "pointer" }}
      >
        <img src={list[active]} alt={title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />

        {list.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); goPrev(); }}
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
              onClick={(e) => { e.stopPropagation(); goNext(); }}
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

      {/* Full-screen photo viewer */}
      {fullscreen && (
        <div
          onClick={() => setFullscreen(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 2000,
            background: "#000",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <button
            onClick={(e) => { e.stopPropagation(); setFullscreen(false); }}
            aria-label="Close"
            style={{
              position: "absolute",
              top: "calc(14px + env(safe-area-inset-top))",
              right: 14,
              zIndex: 3,
              background: "rgba(255,255,255,.15)",
              border: "none",
              borderRadius: "50%",
              width: 40,
              height: 40,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <X size={22} color="#fff" />
          </button>

          <div
            onClick={(e) => e.stopPropagation()}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              minHeight: 0,
              padding: "0 12px",
            }}
          >
            <img
              src={list[active]}
              alt={title}
              style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", userSelect: "none" }}
              draggable={false}
            />

            {list.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); goPrev(); }}
                  aria-label="Previous photo"
                  style={{
                    position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)",
                    background: "rgba(255,255,255,.15)", color: "#fff", border: "none", borderRadius: "50%",
                    width: 40, height: 40, fontSize: 20, cursor: "pointer",
                  }}
                >
                  ‹
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); goNext(); }}
                  aria-label="Next photo"
                  style={{
                    position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)",
                    background: "rgba(255,255,255,.15)", color: "#fff", border: "none", borderRadius: "50%",
                    width: 40, height: 40, fontSize: 20, cursor: "pointer",
                  }}
                >
                  ›
                </button>
              </>
            )}
          </div>

          {list.length > 1 && (
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                textAlign: "center",
                color: "#fff",
                fontSize: 13,
                fontWeight: 600,
                padding: "8px 0 calc(14px + env(safe-area-inset-bottom))",
              }}
            >
              {active + 1} / {list.length}
            </div>
          )}
        </div>
      )}
    </div>
  );
}