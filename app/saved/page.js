"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "../../lib/supabase-client";
import PropertyCard from "../../components/PropertyCard";
import { T } from "../../lib/constants";
import { fetchOwnerTypeMap, withOwnerTypes } from "../../lib/badge-queries";

export default function SavedPropertiesPage() {
  const supabase = createClient();
  const [user, setUser] = useState(null);
  const [listings, setListings] = useState(null); // null = loading, [] = empty, [...] = has data
  const [checkedAuth, setCheckedAuth] = useState(false);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getUser().then(async ({ data }) => {
      const currentUser = data?.user || null;
      if (!mounted) return;
      setUser(currentUser);
      setCheckedAuth(true);

      if (!currentUser) {
        setListings([]);
        return;
      }

      // Get favorite listing_ids for this user, then fetch the full listing rows
      const { data: favRows, error: favErr } = await supabase
        .from("favorites")
        .select("listing_id, created_at")
        .eq("user_id", currentUser.id)
        .order("created_at", { ascending: false });

      if (favErr || !favRows || favRows.length === 0) {
        if (mounted) setListings([]);
        return;
      }

      const listingIds = favRows.map((r) => r.listing_id);
      const [{ data: listingRows }, ownerTypeMap] = await Promise.all([
        supabase.from("listings").select("*, listing_images(url, sort_order)").in("id", listingIds),
        fetchOwnerTypeMap(supabase),
      ]);
      const enriched = withOwnerTypes(listingRows || [], ownerTypeMap);

      // Preserve the saved order (most recently favorited first)
      const ordered = listingIds
        .map((id) => enriched.find((l) => l.id === id))
        .filter(Boolean);

      if (mounted) setListings(ordered);
    });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div style={{ background: T.bg, minHeight: "100vh" }}>
      <div style={{ background: "#fff", borderBottom: `1px solid ${T.border}`, padding: "28px 24px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <h1 style={{ color: T.navy, fontWeight: 900, fontSize: 26, margin: "0 0 4px" }}>
            Saved Properties
          </h1>
          <p style={{ color: T.gray2, fontSize: 14, margin: 0 }}>
            Properties you've favorited, all in one place.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "28px 24px" }}>
        {/* Not signed in */}
        {checkedAuth && !user && (
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
              Sign in to see your saved properties
            </p>
            <p style={{ color: T.gray2, fontSize: 14, margin: "0 0 20px" }}>
              Create a free account to save listings and find them here anytime.
            </p>
            <Link
              href="/login"
              style={{
                display: "inline-block",
                background: T.navy,
                color: "#fff",
                borderRadius: 8,
                padding: "10px 24px",
                fontWeight: 700,
                fontSize: 14,
              }}
            >
              Sign In / Register
            </Link>
          </div>
        )}

        {/* Signed in, still loading */}
        {user && listings === null && (
          <p style={{ color: T.gray2, textAlign: "center", padding: "40px 0" }}>Loading your saved properties…</p>
        )}

        {/* Signed in, no favorites yet */}
        {user && listings && listings.length === 0 && (
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
              No saved properties yet
            </p>
            <p style={{ color: T.gray2, fontSize: 14, margin: "0 0 20px" }}>
              Tap the heart icon on any listing to save it here.
            </p>
            <Link
              href="/listings"
              style={{ color: T.navy, fontWeight: 700, textDecoration: "underline" }}
            >
              Browse listings
            </Link>
          </div>
        )}

        {/* Signed in, has favorites */}
        {user && listings && listings.length > 0 && (
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
    </div>
  );
}