"use client";

import { useEffect, useRef, useState } from "react";
import { T } from "../lib/constants";
import { LocateFixed, Check } from "lucide-react";

export default function LocationPicker({ latitude, longitude, onChange, onAddressFound }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markerRef = useRef(null);
  const debounceRef = useRef(null);

  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [locating, setLocating] = useState(false);
  const [selected, setSelected] = useState(false);

  // Best-effort mapping from Nominatim's address breakdown to our fields
  const extractAddressParts = (address) => {
    if (!address) return null;
    return {
      city: address.city || address.town || address.municipality || address.county || "",
      area: address.suburb || address.neighbourhood || address.quarter || address.village || "",
      address: [address.house_number, address.road].filter(Boolean).join(" "),
    };
  };

  const commitLocation = (lat, lng, zoom = 15) => {
    if (mapInstance.current && markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
      mapInstance.current.setView([lat, lng], zoom);
    }
    onChange(lat, lng);
    setSelected(true);
  };

  // Debounced address-suggestions-as-you-type (free Nominatim geocoding)
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim() || query.trim().length < 3) {
      setSuggestions([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&limit=5&addressdetails=1&countrycodes=gh&q=${encodeURIComponent(query)}`,
          { headers: { Accept: "application/json" } }
        );
        const results = await res.json();
        setSuggestions(results || []);
      } catch {
        setSuggestions([]);
      }
    }, 450);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setSearching(true);
    setSearchError(null);
    setShowSuggestions(false);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&addressdetails=1&countrycodes=gh&q=${encodeURIComponent(query)}`,
        { headers: { Accept: "application/json" } }
      );
      const results = await res.json();
      if (!results?.length) {
        setSearchError("Couldn't find that location. Try a different search or place the pin manually.");
        setSearching(false);
        return;
      }
      commitLocation(parseFloat(results[0].lat), parseFloat(results[0].lon));
      const parts = extractAddressParts(results[0].address);
      if (parts && onAddressFound) onAddressFound(parts);
    } catch (e) {
      setSearchError("Search failed — try placing the pin manually instead.");
    }
    setSearching(false);
  };

  const handleSuggestionClick = (r) => {
    setQuery(r.display_name);
    setShowSuggestions(false);
    setSuggestions([]);
    commitLocation(parseFloat(r.lat), parseFloat(r.lon));
    const parts = extractAddressParts(r.address);
    if (parts && onAddressFound) onAddressFound(parts);
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setSearchError("Your device/browser doesn't support location detection.");
      return;
    }
    setLocating(true);
    setSearchError(null);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        commitLocation(lat, lng, 16);
        // Reverse-geocode the device's actual coordinates so the address
        // fields auto-fill with where the person really is standing.
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&addressdetails=1&lat=${lat}&lon=${lng}`,
            { headers: { Accept: "application/json" } }
          );
          const result = await res.json();
          const parts = extractAddressParts(result?.address);
          if (parts && onAddressFound) onAddressFound(parts);
          if (result?.display_name) setQuery(result.display_name);
        } catch {
          // Non-fatal — the pin is still placed correctly even if the
          // reverse address lookup fails.
        }
        setLocating(false);
      },
      () => {
        setSearchError("Couldn't access your location. Check your browser permissions, or place the pin manually.");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
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
        html: `<div style="background:${T.gold};width:24px;height:24px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.4);"></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 24],
      });

      const marker = L.marker([latitude, longitude], { icon: goldIcon, draggable: true }).addTo(map);
      markerRef.current = marker;

      marker.on("dragend", () => {
        const pos = marker.getLatLng();
        onChange(pos.lat, pos.lng);
        setSelected(true);
      });

      map.on("click", (e) => {
        marker.setLatLng(e.latlng);
        onChange(e.latlng.lat, e.latlng.lng);
        setSelected(true);
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
  // they've clicked/dragged/searched — the parent only passes updated
  // lat/lng from the region fallback until a real pick is made).
  useEffect(() => {
    if (mapInstance.current && markerRef.current) {
      markerRef.current.setLatLng([latitude, longitude]);
      mapInstance.current.setView([latitude, longitude], mapInstance.current.getZoom());
    }
  }, [latitude, longitude]);

  const inputStyle = { flex: 1, border: `1.5px solid ${T.border}`, borderRadius: 8, padding: "9px 12px", fontSize: 13 };

  return (
    <div>
      <p style={{ fontSize: 12.5, color: T.gray1, fontWeight: 700, margin: "0 0 8px" }}>
        Drag the marker to the exact property location. This helps buyers find the property accurately.
      </p>

      <div style={{ position: "relative", marginBottom: 4 }}>
        <div className="homio-location-search-row" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <input
            className="homio-location-search-input"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleSearch())}
            placeholder="Search by address, town, landmark or GhanaPost GPS"
            style={inputStyle}
          />
          <button
            type="button"
            onClick={handleSearch}
            disabled={searching}
            style={{ background: T.navy, color: "#fff", border: "none", borderRadius: 8, padding: "0 16px", fontWeight: 700, fontSize: 13, cursor: searching ? "default" : "pointer", opacity: searching ? 0.6 : 1, flex: "1 1 auto" }}
          >
            {searching ? "…" : "Search"}
          </button>
          <button
            type="button"
            onClick={handleUseCurrentLocation}
            disabled={locating}
            title="Use my current location"
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 5, background: "#fff", color: T.navy, border: `1.5px solid ${T.border}`, borderRadius: 8, padding: "0 14px", fontWeight: 700, fontSize: 13, cursor: locating ? "default" : "pointer", opacity: locating ? 0.6 : 1, whiteSpace: "nowrap", flex: "1 1 auto" }}
          >
            <LocateFixed size={14} /> {locating ? "…" : "My Location"}
          </button>
        </div>

        <style jsx>{`
          @media (max-width: 480px) {
            .homio-location-search-input {
              flex-basis: 100% !important;
            }
          }
        `}</style>

        {showSuggestions && suggestions.length > 0 && (
          <div
            style={{
              position: "absolute",
              top: "calc(100% + 4px)",
              left: 0,
              right: 0,
              background: "#fff",
              border: `1px solid ${T.border}`,
              borderRadius: 8,
              boxShadow: T.shadowHover,
              zIndex: 5000,
              maxHeight: 200,
              overflowY: "auto",
            }}
          >
            {suggestions.map((r) => (
              <button
                key={r.place_id}
                type="button"
                onMouseDown={() => handleSuggestionClick(r)}
                style={{ display: "block", width: "100%", textAlign: "left", background: "none", border: "none", borderBottom: `1px solid ${T.border}`, padding: "9px 12px", fontSize: 12.5, color: T.gray1, cursor: "pointer" }}
              >
                {r.display_name}
              </button>
            ))}
          </div>
        )}
      </div>

      <p style={{ fontSize: 11.5, color: T.gray2, margin: "0 0 10px" }}>
        Examples: Abountem, Kumasi &nbsp;•&nbsp; KNUST Main Gate &nbsp;•&nbsp; AK-039-5028
      </p>

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

      {selected && (
        <div style={{ display: "flex", alignItems: "center", gap: 6, color: T.green, fontSize: 12.5, fontWeight: 700, marginTop: 8 }}>
          <Check size={14} /> Property location selected successfully.
        </div>
      )}
    </div>
  );
}