"use client";

import { useState } from "react";
import { createListing, updateListing } from "@/lib/admin-queries";
import { T } from "@/lib/constants";
import PhotoUploader from "./PhotoUploader";

const PROPERTY_TYPES = ["house", "apartment", "land", "commercial", "shortlet", "office"];
const REGIONS = ["Greater Accra", "Ashanti", "Central", "Eastern", "Western", "Volta", "Northern", "Upper East", "Upper West", "Bono"];

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
    bedrooms: existing?.bedrooms || "",
    bathrooms: existing?.bathrooms || "",
    furnished: existing?.furnished || false,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [savedListing, setSavedListing] = useState(existing || null);
  const [images, setImages] = useState(existing?.images || []);

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
        <input style={inputStyle} placeholder="Bedrooms" type="number" value={form.bedrooms} onChange={(e) => set("bedrooms", e.target.value)} />
        <input style={inputStyle} placeholder="Bathrooms" type="number" value={form.bathrooms} onChange={(e) => set("bathrooms", e.target.value)} />
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
          <h4 style={{ fontSize: 14, marginBottom: 10, color: T.text }}>Photos</h4>
          <PhotoUploader
            agentId={userId}
            listingId={savedListing.id}
            images={images}
            onChange={setImages}
          />
          <button className="admin-btn admin-btn-primary" style={{ marginTop: 16 }} onClick={onDone}>
            Done
          </button>
        </div>
      )}
    </div>
  );
}
