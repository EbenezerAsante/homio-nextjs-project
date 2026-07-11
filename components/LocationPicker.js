"use client";

import { useEffect, useRef, useState } from "react";
import { T } from "../lib/constants";

export default function LocationPicker({ latitude, longitude, onChange }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markerRef = useRef(null);
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setSearching(true);
    setSearchError(null);
    try {
      // Free OpenStreetMap geocoding — no API key required.
      // Biased toward Ghana with countrycodes=gh, but falls back gracefully.
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=gh&q=${encodeURIComponent(query)}`,
        { headers: { Accept: "application/json" } }
      );
      const results = await res.json();
      if (!results?.length) {
        setSearchError("Couldn't find that location. Try a different search or place the pin manually.");
        setSearching(false);
        return;
      }
      const lat = parseFloat(results[0].lat);
      const lng = parseFloat(results[0].lon);
      if (mapInstance.current && markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
        mapInstance.current.setView([lat, lng], 15);
      }
      onChange(lat, lng);
    } catch (e) {
      setSearchError("Search failed — try placing the pin manually instead.");
    }
    setSearching(false);
  };

  useEffect(() => {
    let cancelled = false;

    async function initMap() {
      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");

      if (cancelled || !mapRef.current || mapInstance.current) return;

      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const map = L.map(mapRef.current, {
        center: [latitude, longitude],
        zoom: 13,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      const goldIcon = L.divIcon({
        className: "",
        html: `<div style="background:${T.gold};width:22px;height:22px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.4);"></div>`,
        iconSize: [22, 22],
        iconAnchor: [11, 22],
      });

      const marker = L.marker([latitude, longitude], { icon: goldIcon, draggable: true }).addTo(map);
      markerRef.current = marker;

      marker.on("dragend", () => {
        const pos = marker.getLatLng();
        onChange(pos.lat, pos.lng);
      });

      map.on("click", (e) => {
        marker.setLatLng(e.latlng);
        onChange(e.latlng.lat, e.latlng.lng);
      });

      mapInstance.current = map;
    }

    initMap();

    return () => {
      cancelled = true;
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
    // Only initialize once — re-centering on prop changes is handled below
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // If the region/city changes before a pin has been manually placed,
  // recenter the map and marker to match (but don't fight the user once
  // they've clicked/dragged — that's handled by the parent only passing
  // updated lat/lng when it's a fresh default, not after a manual pick).
  useEffect(() => {
    if (mapInstance.current && markerRef.current) {
      markerRef.current.setLatLng([latitude, longitude]);
      mapInstance.current.setView([latitude, longitude], mapInstance.current.getZoom());
    }
  }, [latitude, longitude]);

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleSearch())}
          placeholder="Search an address or area (e.g. East Legon, Accra)"
          style={{ flex: 1, border: `1.5px solid ${T.border}`, borderRadius: 8, padding: "8px 12px", fontSize: 13 }}
        />
        <button
          type="button"
          onClick={handleSearch}
          disabled={searching}
          style={{ background: T.navy, color: "#fff", border: "none", borderRadius: 8, padding: "0 16px", fontWeight: 700, fontSize: 13, cursor: searching ? "default" : "pointer", opacity: searching ? 0.6 : 1 }}
        >
          {searching ? "…" : "Search"}
        </button>
      </div>
      {searchError && <div style={{ color: T.red, fontSize: 12, marginBottom: 8 }}>{searchError}</div>}

      <div
        ref={mapRef}
        style={{
          height: 260,
          width: "100%",
          borderRadius: 8,
          border: `1px solid ${T.border}`,
          background: T.bg,
        }}
      />
      <p style={{ fontSize: 12, color: T.gray2, margin: "6px 0 0" }}>
        Search above, or click/drag the pin to set the exact location of this property.
      </p>
    </div>
  );
}