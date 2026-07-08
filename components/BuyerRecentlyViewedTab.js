"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "../lib/supabase-client";
import PropertyCard from "./PropertyCard";
import { T } from "../lib/constants";

const STORAGE_KEY = "homio_recently_viewed";

export default function BuyerRecentlyViewedTab() {
  const supabase = createClient();
  const [listings, setListings] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      let ids = [];
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        ids = raw ? JSON.parse(raw) : [];
      } catch (e) {
        ids = [];
      }

      if (ids.length === 0) {
        if (mounted) setListings([]);
        return;
      }

      const { data } = await supabase
        .from("listings")
        .select("*, listing_images(url, sort_order)")
        .in("id", ids);

      const ordered = ids.map((id) => data?.find((l) => l.id === id)).filter(Boolean);
      if (mounted) setListings(ordered);
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  if (listings === null) {
    return <p style={{ color: T.gray2, textAlign: "center", padding: "40px 0" }}>Loading…</p>;
  }

  if (listings.length === 0) {
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
          No recently viewed properties
        </p>
        <p style={{ color: T.gray2, fontSize: 14, margin: "0 0 20px" }}>
          Properties you view will show up here automatically.
        </p>
        <Link href="/listings" style={{ color: T.navy, fontWeight: 700, textDecoration: "underline" }}>
          Browse listings
        </Link>
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 20 }}>
      {listings.map((p) => (
        <PropertyCard key={p.id} p={p} />
      ))}
    </div>
  );
}