"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "../lib/supabase-client";
import { T } from "../lib/constants";

export default function BuyerSavedSearchesTab({ userId }) {
  const supabase = createClient();
  const [searches, setSearches] = useState(null);

  async function load() {
    const { data } = await supabase
      .from("saved_searches")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    setSearches(data || []);
  }

  useEffect(() => {
    load();
  }, [userId]);

  const remove = async (id) => {
    setSearches((prev) => prev.filter((s) => s.id !== id)); // optimistic
    const { error } = await supabase.from("saved_searches").delete().eq("id", id);
    if (error) load(); // revert by reloading if it failed
  };

  const buildHref = (filters) => {
    const params = new URLSearchParams();
    Object.entries(filters || {}).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });
    return `/listings?${params.toString()}`;
  };

  if (searches === null) {
    return <p style={{ color: T.gray2, textAlign: "center", padding: "40px 0" }}>Loading…</p>;
  }

  if (searches.length === 0) {
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
          No saved searches yet
        </p>
        <p style={{ color: T.gray2, fontSize: 14, margin: "0 0 20px" }}>
          Save a search from the Listings page to find it here anytime.
        </p>
        <Link href="/listings" style={{ color: T.navy, fontWeight: 700, textDecoration: "underline" }}>
          Browse listings
        </Link>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {searches.map((s) => (
        <div
          key={s.id}
          style={{
            background: "#fff",
            border: `1px solid ${T.border}`,
            borderRadius: 10,
            padding: "16px 20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 10,
          }}
        >
          <div>
            <p style={{ margin: "0 0 4px", fontWeight: 700, color: T.navy, fontSize: 14 }}>{s.label}</p>
            <p style={{ margin: 0, fontSize: 12, color: T.gray2 }}>
              Saved {new Date(s.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
            </p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Link
              href={buildHref(s.filters)}
              style={{
                border: `1.5px solid ${T.navy}`,
                color: T.navy,
                borderRadius: 8,
                padding: "7px 16px",
                fontSize: 13,
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              View Results
            </Link>
            <button
              onClick={() => remove(s.id)}
              style={{
                background: "none",
                border: `1.5px solid ${T.border}`,
                color: T.red,
                borderRadius: 8,
                padding: "7px 16px",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}