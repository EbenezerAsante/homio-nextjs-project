"use client";

import { useEffect, useRef } from "react";
import { T, fmt, getCoords } from "../lib/constants";
import { applyPrivacyOffset } from "../lib/location-utils";

export default function ListingsMap({ listings }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);

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
        center: [7.9465, -1.0232], // Ghana center, used if there are no listings
        zoom: 7,
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

      const points = [];

      listings.forEach((p) => {
        let lat = p.latitude;
        let lng = p.longitude;
        if (!lat || !lng) {
          const fallback = getCoords(p.city, p.region);
          // Deterministic jitter (based on the listing id) so multiple
          // listings without exact coordinates don't stack on one pin.
          const seed = p.id ? p.id.charCodeAt(0) + p.id.charCodeAt(p.id.length - 1) : 0;
          const jitter = ((seed % 100) / 100 - 0.5) * 0.06; // ~ within a few km
          lat = fallback[0] + jitter;
          lng = fallback[1] + jitter * 1.3;
        } else if ((p.location_visibility || "approximate") !== "exact") {
          // Never expose a listing's real pin on the public browse map
          // unless the owner explicitly chose "exact".
          [lat, lng] = applyPrivacyOffset(lat, lng, p.id);
        }
        points.push([lat, lng]);

        const popupHtml = `
          <a href="/property/${p.id}" style="text-decoration:none;color:inherit;display:block;min-width:170px;">
            <div style="font-weight:800;color:${T.navy};font-size:13.5px;">${fmt(p.price, p.listing_type)}</div>
            <div style="font-size:12.5px;color:${T.gray1};margin:2px 0;">${p.title}</div>
            <div style="font-size:11.5px;color:${T.gray2};">${p.city}, ${p.region}</div>
          </a>
        `;

        L.marker([lat, lng], { icon: goldIcon }).addTo(map).bindPopup(popupHtml);
      });

      if (points.length > 0) {
        map.fitBounds(points, { padding: [40, 40], maxZoom: 13 });
      }

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
  }, [listings]);

  return (
    <div
      ref={mapRef}
      style={{
        height: 560,
        width: "100%",
        borderRadius: 10,
        border: `1px solid ${T.border}`,
        background: T.bg,
      }}
    />
  );
}