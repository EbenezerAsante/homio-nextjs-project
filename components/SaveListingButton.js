"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { T } from "../lib/constants";
import { createClient } from "../lib/supabase-client";

export default function SaveListingButton({ listingId }) {
  const supabase = createClient();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isFavorited, setIsFavorited] = useState(false);

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
    });
    return () => {
      mounted = false;
    };
  }, [listingId]);

  const toggle = async () => {
    if (!user) {
      router.push("/login");
      return;
    }
    if (isFavorited) {
      setIsFavorited(false);
      const { error } = await supabase.from("favorites").delete().eq("user_id", user.id).eq("listing_id", listingId);
      if (error) setIsFavorited(true);
    } else {
      setIsFavorited(true);
      const { error } = await supabase.from("favorites").insert({ user_id: user.id, listing_id: listingId });
      if (error) setIsFavorited(false);
    }
  };

  return (
    <button
      onClick={toggle}
      style={{
        flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
        border: `1.5px solid ${isFavorited ? T.red : T.border}`,
        background: isFavorited ? "#FEE2E2" : "#fff",
        color: isFavorited ? T.red : T.gray1,
        borderRadius: 8, padding: "10px 14px", fontSize: 13.5, fontWeight: 700, cursor: "pointer",
      }}
    >
      <Heart size={15} fill={isFavorited ? T.red : "none"} /> {isFavorited ? "Saved" : "Save"}
    </button>
  );
}