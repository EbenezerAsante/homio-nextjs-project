"use client";

import { useEffect, useRef } from "react";
import { T } from "../lib/constants";

export default function PropertyMap({ latitude, longitude, title, city, region }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);

  useEffect(() => {
    let cancelled = false;

    async function initMap() {
      // Leaflet needs the browser (window), so it's loaded dynamically here
      // rather than imported at the top of the file.
      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");

      if (cancelled || !mapRef.current || mapInstance.current) return;

      // Fix default marker icon paths (Leaflet's bundler assumptions break in Next.js)
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const map = L.map(mapRef.current, {
        center: [latitude, longitude],
        zoom: 14,
        scrollWheelZoom: false,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      const goldIcon = L.divIcon({
        className: "",
        html: `<div style="background:${T.gold};width:20px;height:20px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.4);"></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 20],
      });

      L.marker([latitude, longitude], { icon: goldIcon })
        .addTo(map)
        .bindPopup(`<strong>${title}</strong><br/>${city}, ${region}`);

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
  }, [latitude, longitude, title, city, region]);

  return (
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
  );
}
