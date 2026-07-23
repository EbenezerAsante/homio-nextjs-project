"use client";

import { useState } from "react";
import Link from "next/link";
import { T } from "@/lib/constants";
import { Search, ShieldCheck, Home as HomeIcon } from "lucide-react";

const AVATAR_COLORS = ["#1B3A6B", "#C8961E", "#16A34A", "#7C3AED", "#DC2626", "#0891B2", "#9333EA", "#EA580C"];
function avatarColor(name) {
  const str = name || "?";
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export default function AgentDirectoryClient({ listers, allRegions = [] }) {
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState("");
  const [roleFilter, setRoleFilter] = useState("all"); // all | agent | agency

  const q = query.trim().toLowerCase();
  const filtered = listers.filter((l) => {
    const matchesQuery = !q || `${l.full_name || ""} ${l.company || ""}`.toLowerCase().includes(q);
    const matchesRegion = !region || l.regions.includes(region);
    const matchesRole =
      roleFilter === "all" ||
      (roleFilter === "agent" && l.ownerType?.label === "Verified Agent") ||
      (roleFilter === "agency" && l.ownerType?.label === "Verified Agency");
    return matchesQuery && matchesRegion && matchesRole;
  });

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 16 }}>
        {[
          { id: "all", label: "All" },
          { id: "agent", label: "Agents" },
          { id: "agency", label: "Agencies" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setRoleFilter(tab.id)}
            style={{
              border: `1.5px solid ${roleFilter === tab.id ? T.navy : T.border}`,
              background: roleFilter === tab.id ? T.navy : "#fff",
              color: roleFilter === tab.id ? "#fff" : T.gray1,
              borderRadius: 999, padding: "7px 16px", fontSize: 12.5, fontWeight: 700, cursor: "pointer",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", gap: 10, maxWidth: 560, margin: "0 auto 32px", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 220 }}>
          <Search size={16} color={T.gray3} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or company…"
            style={{
              width: "100%",
              boxSizing: "border-box",
              border: `1.5px solid ${T.border}`,
              borderRadius: 999,
              padding: "12px 16px 12px 40px",
              fontSize: 14,
            }}
          />
        </div>
        {allRegions.length > 0 && (
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            style={{
              border: `1.5px solid ${T.border}`,
              borderRadius: 999,
              padding: "0 16px",
              fontSize: 13.5,
              color: region ? T.navy : T.gray2,
              fontWeight: region ? 700 : 400,
              background: "#fff",
            }}
          >
            <option value="">All Regions</option>
            {allRegions.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        )}
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", color: T.gray2, padding: 40, background: "#fff", borderRadius: 12, border: `1px dashed ${T.border}` }}>
          {q ? `No one found matching "${query}."` : "No listers on the platform yet."}
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 18 }}>
          {filtered.map((l) => (
            <Link
              key={l.id}
              href={`/agents/${l.id}`}
              style={{
                display: "block",
                background: "#fff",
                border: `1px solid ${T.border}`,
                borderRadius: 14,
                padding: 22,
                textDecoration: "none",
                boxShadow: T.shadow,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                <div
                  style={{
                    width: 48, height: 48, borderRadius: "50%", flexShrink: 0,
                    background: avatarColor(l.full_name), color: "#fff",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontWeight: 800, fontSize: 18,
                  }}
                >
                  {(l.full_name || "?").charAt(0).toUpperCase()}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 800, fontSize: 15, color: T.navy, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {l.full_name || "Unnamed"}
                  </div>
                  {l.company && (
                    <div style={{ fontSize: 12.5, color: T.gray2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {l.company}
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                {l.ownerType?.verified && (
                  <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11.5, fontWeight: 700, color: T.green }}>
                    <ShieldCheck size={13} /> {l.ownerType.label}
                  </span>
                )}
                <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11.5, fontWeight: 700, color: T.gray2 }}>
                  <HomeIcon size={13} /> {l.listingCount} listing{l.listingCount === 1 ? "" : "s"}
                </span>
              </div>
              {l.regions.length > 0 && (
                <p style={{ fontSize: 11.5, color: T.gray3, margin: "8px 0 0" }}>{l.regions.join(", ")}</p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}