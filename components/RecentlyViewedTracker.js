"use client";

import { useEffect } from "react";

const STORAGE_KEY = "homio_recently_viewed";
const MAX_ITEMS = 12;

export default function RecentlyViewedTracker({ listingId }) {
  useEffect(() => {
    if (!listingId) return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      let ids = raw ? JSON.parse(raw) : [];
      ids = ids.filter((id) => id !== listingId);
      ids.unshift(listingId);
      ids = ids.slice(0, MAX_ITEMS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    } catch (e) {
      // localStorage unavailable (e.g. private browsing) — fail silently
    }
  }, [listingId]);

  return null; // renders nothing, just tracks
}