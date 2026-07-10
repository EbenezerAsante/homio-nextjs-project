"use client";

import { useState } from "react";
import { createListing, updateListing } from "@/lib/admin-queries";
import { T, getCoords } from "@/lib/constants";
import PhotoUploader from "./PhotoUploader";
import VideoUploader from "./VideoUploader";
import LocationPicker from "./LocationPicker";

const PROPERTY_TYPES = ["house", "apartment", "land", "commercial", "shortlet", "office"];
const REGIONS = ["Greater Accra", "Ashanti", "Central", "Eastern", "Western", "Volta", "Northern", "Upper East", "Upper West", "Bono"];
const MIN_PHOTOS = 5;

export default function ListingForm({ userId, existing, onDone, onCancel }) {
  const [form, setForm] = useState({
    title: existing?.title || "",
    description: existing?.description || "",
    listing_type: existing?.listing_type || "sale",
    category: existing?.category || "house",
    price: existing?.price || "",
    currency: existing?.currency || "GHS",
    region: existing?.region || "",
    city: existing?.city || "",
    address: existing?.address || "",
    plot_size: existing?.plot_size || "",
    bedrooms: existing?.bedrooms || "",
    bathrooms: existing?.bathrooms || "",
    furnished: existing?.furnished || false,
    latitude: existing?.latitude || null,
    longitude: existing?.longitude || null,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [savedListing, setSavedListing] = useState(existing || null);
  const [images, setImages] = useState(existing?.images || []);
  const [videoUrl, setVideoUrl] = useState(existing?.video_url || null);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    setSaving(true);
    setError(null);
    try {
      const payload = {
        ...form,
        price: form.price ? Number(form.price) : null,
        bedrooms: form.bedrooms ? Number(form.bedrooms) : null,
        bathrooms: form.bathrooms ? Number(form.bathrooms) : null,
        latitude: form.latitude != null ? Number(form.latitude) : null,
        longitude: form.longitude != null ? Number(form.longitude) : null,
        agent_id: userId,
      };

      let result;
      if (savedListing) {
        result = await updateListing(savedListing.id, payload);
      } else {
        result = await createListing({ ...payload, status: "active" });
      }
      setSavedListing(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = {
    width: "100%",
    border: `1.5px solid ${T.border}`,
    borderRadius: 8,
    padding: "9px 12px",
    fontSize: 14,
    marginBottom: 12,
    boxSizing: "border-box",
  };

  return (
    <div style={{ background: "#fff", borderRadius: 10, border: `1px solid ${T.border}`, padding: 24, marginBottom: 24 }}>
      <h3 style={{ marginBottom: 16, fontSize: 16 }}>{existing ? "Edit Listing" : "New Listing"}</h3>

      <input style={inputStyle} placeholder="Title" value={form.title} onChange={(e) => set("title", e.target.value)} />
      <textarea style={{ ...inputStyle, minHeight: 80 }} placeholder="Description" value={form.description} onChange={(e) => set("description", e.target.value)} />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <select style={inputStyle} value={form.listing_type} onChange={(e) => set("listing_type", e.target.value)}>
          <option value="sale">For Sale</option>
          <option value="rent">For Rent</option>
        </select>
        <select style={inputStyle} value={form.category} onChange={(e) => set("category", e.target.value)}>
          {PROPERTY_TYPES.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        <input style={inputStyle} placeholder="Price" type="number" value={form.price} onChange={(e) => set("price", e.target.value)} />
        <select style={inputStyle} value={form.region} onChange={(e) => set("region", e.target.value)}>
          <option value="">Select Region</option>
          {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
        <input style={inputStyle} placeholder="City / Town" value={form.city} onChange={(e) => set("city", e.target.value)} />
        <input style={inputStyle} placeholder="Address" value={form.address} onChange={(e) => set("address", e.target.value)} />
        <input style={inputStyle} placeholder="Plot Size (e.g. 0.5 acre, 100x100 ft)" value={form.plot_size} onChange={(e) => set("plot_size", e.target.value)} />
        <input style={inputStyle} placeholder="Bedrooms" type="number" value={form.bedrooms} onChange={(e) => set("bedrooms", e.target.value)} />
        <input style={inputStyle} placeholder="Bathrooms" type="number" value={form.bathrooms} onChange={(e) => set("bathrooms", e.target.value)} />
      </div>

      <div style={{ marginBottom: 12 }}>
        <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: T.gray1, marginBottom: 6 }}>
          Exact Location
        </label>
        <LocationPicker
          latitude={form.latitude || getCoords(form.city, form.region)[0]}
          longitude={form.longitude || getCoords(form.city, form.region)[1]}
          onChange={(lat, lng) => setForm((f) => ({ ...f, latitude: lat, longitude: lng }))}
        />
      </div>

      {error && <div style={{ color: T.red, fontSize: 13, marginBottom: 12 }}>{error}</div>}

      <div style={{ display: "flex", gap: 10, marginBottom: savedListing ? 20 : 0 }}>
        <button className="admin-btn admin-btn-gold" onClick={submit} disabled={saving}>
          {saving ? "Saving..." : savedListing ? "Update Details" : "Save & Add Photos"}
        </button>
        <button className="admin-btn" style={{ background: T.border, color: T.text }} onClick={onCancel}>
          Cancel
        </button>
      </div>

      {savedListing && (
        <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 20 }}>
          <h4 style={{ fontSize: 14, marginBottom: 10, color: T.text }}>
            Photos <span style={{ fontWeight: 400, fontSize: 12.5, color: images.length >= MIN_PHOTOS ? T.green : T.gold }}>
              ({images.length}/{MIN_PHOTOS} minimum)
            </span>
          </h4>
          <PhotoUploader
            agentId={userId}
            listingId={savedListing.id}
            images={images}
            onChange={setImages}
          />

          <div style={{ marginTop: 20 }}>
            <VideoUploader
              agentId={userId}
              listingId={savedListing.id}
              videoUrl={videoUrl}
              onChange={setVideoUrl}
            />
          </div>

          {images.length < MIN_PHOTOS && (
            <div style={{ color: T.gold, fontSize: 12.5, marginTop: 12 }}>
              Add at least {MIN_PHOTOS - images.length} more photo{MIN_PHOTOS - images.length > 1 ? "s" : ""} before finishing your listing.
            </div>
          )}

          <button
            className="admin-btn admin-btn-primary"
            style={{ marginTop: 16, opacity: images.length < MIN_PHOTOS ? 0.5 : 1, cursor: images.length < MIN_PHOTOS ? "not-allowed" : "pointer" }}
            onClick={() => images.length >= MIN_PHOTOS && onDone()}
            disabled={images.length < MIN_PHOTOS}
          >
            Done
          </button>
        </div>
      )}
    </div>
  );
}