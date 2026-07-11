"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { T, fmt } from "../lib/constants";
import { createClient } from "../lib/supabase-client";
import { MapPin, BedDouble, Bath, Ruler, BadgeCheck } from "lucide-react";

function Pill({ label, color, bg }) {
  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: 0.6,
        textTransform: "uppercase",
        padding: "3px 9px",
        borderRadius: 999,
        background: bg,
        color,
        lineHeight: 1.6,
      }}
    >
      {label}
    </span>
  );
}

function HeartButton({ listingId }) {
  const supabase = createClient();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isFavorited, setIsFavorited] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getUser().then(async ({ data }) => {
      if (!mounted) return;
      const currentUser = data?.user || null;
      setUser(currentUser);

      if (currentUser) {
        const { data: favRow } = await supabase
          .from("favorites")
          .select("id")
          .eq("user_id", currentUser.id)
          .eq("listing_id", listingId)
          .maybeSingle();
        if (mounted) setIsFavorited(!!favRow);
      }
      if (mounted) setReady(true);
    });
    return () => {
      mounted = false;
    };
  }, [listingId]);

  const toggle = async (e) => {
    e.preventDefault(); // stop the card's Link from navigating
    e.stopPropagation();

    if (!user) {
      router.push("/login");
      return;
    }

    if (isFavorited) {
      setIsFavorited(false); // optimistic update
      const { error } = await supabase
        .from("favorites")
        .delete()
        .eq("user_id", user.id)
        .eq("listing_id", listingId);
      if (error) setIsFavorited(true); // revert on failure
    } else {
      setIsFavorited(true); // optimistic update
      const { error } = await supabase
        .from("favorites")
        .insert({ user_id: user.id, listing_id: listingId });
      if (error) setIsFavorited(false); // revert on failure
    }
  };

  return (
    <button
      onClick={toggle}
      aria-label={isFavorited ? "Remove from favorites" : "Save to favorites"}
      style={{
        position: "absolute",
        top: 10,
        right: 10,
        width: 32,
        height: 32,
        borderRadius: "50%",
        border: "none",
        background: "rgba(255,255,255,.9)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        opacity: ready ? 1 : 0.5,
        boxShadow: "0 2px 6px rgba(0,0,0,.15)",
      }}
    >
      <svg
        width="17"
        height="17"
        viewBox="0 0 24 24"
        fill={isFavorited ? T.red : "none"}
        stroke={isFavorited ? T.red : T.gray2}
        strokeWidth="2"
      >
        <path d="M12 21s-7.5-4.6-10-9.2C.5 8.4 2.2 5 5.6 5c2 0 3.4 1 4.4 2.4C11 6 12.4 5 14.4 5c3.4 0 5.1 3.4 3.6 6.8C19.5 16.4 12 21 12 21z" />
      </svg>
    </button>
  );
}

export default function PropertyCard({ p }) {
  const isRent = p.listing_type === "rent";
  const sortedImages = p.listing_images?.length
    ? [...p.listing_images].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
    : [];
  const coverImage = sortedImages[0]?.url || p.img || "/property-placeholder.svg";

  return (
    <Link href={`/property/${p.id}`} style={{ display: "block", height: "100%" }}>
      <div
        style={{
          background: "#fff",
          borderRadius: 10,
          boxShadow: T.shadow,
          overflow: "hidden",
          cursor: "pointer",
          display: "flex",
          flexDirection: "column",
          height: "100%",
          border: `1px solid ${T.border}`,
          transition: "box-shadow .18s, transform .18s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = T.shadowHover;
          e.currentTarget.style.transform = "translateY(-2px)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = T.shadow;
          e.currentTarget.style.transform = "translateY(0)";
        }}
      >
        <div style={{ position: "relative", height: 196, overflow: "hidden", background: "#eee" }}>
          <img src={coverImage} alt={p.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          <div style={{ position: "absolute", top: 10, left: 10, display: "flex", gap: 6, flexWrap: "wrap" }}>
            <Pill label={isRent ? "To Let" : "For Sale"} bg={isRent ? T.navy : T.green} color="#fff" />
            {p.tag && <Pill label={p.tag} bg={T.gold} color="#fff" />}
            {p.furnished && <Pill label="Furnished" bg="rgba(0,0,0,.55)" color="#fff" />}
          </div>
          <HeartButton listingId={p.id} />
        </div>
        <div style={{ padding: "14px 16px", flex: 1, display: "flex", flexDirection: "column" }}>
          <div style={{ fontWeight: 800, fontSize: 20, color: T.navy, lineHeight: 1.1, marginBottom: 2 }}>
            {fmt(p.price, p.listing_type)}
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, color: T.gray1, marginBottom: 4, lineHeight: 1.4 }}>
            {p.title}
          </div>
          <div style={{ fontSize: 12, color: T.gray2, marginBottom: 6, display: "flex", alignItems: "center", gap: 4 }}>
            <MapPin size={12} strokeWidth={2.2} style={{ flexShrink: 0 }} />
            {p.area ? `${p.area}, ` : ""}{p.city}, {p.region}
          </div>
          {p.ownerType?.verified && (
            <div style={{ fontSize: 11, color: T.green, fontWeight: 700, marginBottom: 8, display: "flex", alignItems: "center", gap: 4 }}>
              <BadgeCheck size={13} strokeWidth={2.4} /> {p.ownerType.label}
            </div>
          )}
          <div
            style={{
              borderTop: `1px solid ${T.gray4}`,
              paddingTop: 10,
              marginTop: "auto",
              display: "flex",
              gap: 14,
              fontSize: 12,
              color: T.gray2,
              flexWrap: "wrap",
            }}
          >
            {p.bedrooms > 0 && (
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <BedDouble size={14} strokeWidth={2.2} /> {p.bedrooms} bed{p.bedrooms > 1 ? "s" : ""}
              </span>
            )}
            {p.bathrooms > 0 && (
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <Bath size={14} strokeWidth={2.2} /> {p.bathrooms} bath{p.bathrooms > 1 ? "s" : ""}
              </span>
            )}
            {p.sqft > 0 && (
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <Ruler size={14} strokeWidth={2.2} /> {p.sqft.toLocaleString()} sqft
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}