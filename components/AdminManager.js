"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../lib/supabase-client";
import { T, fmt, REGIONS, CAT_LABEL } from "../lib/constants";
import PhotoUploader from "./PhotoUploader";

const EMPTY_FORM = {
  title: "", listing_type: "rent", category: "apartment", region: "Greater Accra", city: "",
  price: "", bedrooms: "", bathrooms: "", sqft: "", garage: "", furnished: false,
  images: [], description: "", tag: "",
};

export default function AdminManager({ userId, initialListings }) {
  const supabase = createClient();
  const router = useRouter();

  const [listings, setListings] = useState(initialListings);
  const [tab, setTab] = useState("list");
  const [form, setForm] = useState(EMPTY_FORM);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [confirmId, setConfirmId] = useState(null);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const startEdit = (p) => {
    const existingImages = p.listing_images?.length
      ? [...p.listing_images].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)).map((im) => im.url)
      : [];
    setForm({
      title: p.title, listing_type: p.listing_type, category: p.category, region: p.region,
      city: p.city, price: String(p.price), bedrooms: String(p.bedrooms), bathrooms: String(p.bathrooms),
      sqft: String(p.sqft), garage: String(p.garage || 0), furnished: p.furnished,
      images: existingImages, description: p.description || "", tag: p.tag || "",
    });
    setEditing(p.id);
    setTab("add");
  };

  const save = async () => {
    if (!form.title || !form.price || !form.city) {
      setError("Please fill in title, price and city.");
      return;
    }
    setSaving(true);
    setError(null);

    const payload = {
      title: form.title,
      listing_type: form.listing_type,
      category: form.category,
      region: form.region,
      city: form.city,
      price: Number(form.price) || 0,
      bedrooms: Number(form.bedrooms) || 0,
      bathrooms: Number(form.bathrooms) || 0,
      sqft: Number(form.sqft) || 0,
      garage: Number(form.garage) || 0,
      furnished: form.furnished,
      description: form.description,
      tag: form.tag || null,
      agent_id: userId,
      status: "active",
    };

    const cleanImages = form.images.map((u) => u.trim()).filter(Boolean);

    if (editing) {
      const { error: err } = await supabase.from("listings").update(payload).eq("id", editing);
      if (err) { setSaving(false); return setError(err.message); }

      await supabase.from("listing_images").delete().eq("listing_id", editing);
      if (cleanImages.length) {
        await supabase.from("listing_images").insert(
          cleanImages.map((url, sort_order) => ({ listing_id: editing, url, sort_order }))
        );
      }
    } else {
      const { data: newListing, error: err } = await supabase.from("listings").insert(payload).select().single();
      if (err) { setSaving(false); return setError(err.message); }

      if (cleanImages.length && newListing) {
        await supabase.from("listing_images").insert(
          cleanImages.map((url, sort_order) => ({ listing_id: newListing.id, url, sort_order }))
        );
      }
    }

    setSaving(false);
    setForm(EMPTY_FORM);
    setEditing(null);
    setTab("list");
    router.refresh();

    // re-fetch to update local list
    const { data: fresh } = await supabase
      .from("listings")
      .select("*, listing_images(url, sort_order)")
      .eq("agent_id", userId)
      .order("created_at", { ascending: false });
    setListings(fresh || []);
  };

  const remove = async (id) => {
    await supabase.from("listings").delete().eq("id", id);
    setListings((ls) => ls.filter((l) => l.id !== id));
    setConfirmId(null);
  };

  const FLabel = ({ children }) => <div style={{ fontSize: 12, fontWeight: 700, color: T.gray2, marginBottom: 4 }}>{children}</div>;
  const inputStyle = { width: "100%", marginBottom: 14, boxSizing: "border-box", border: `1.5px solid ${T.border}`, borderRadius: 8, padding: "9px 13px", fontSize: 14 };
  const selectStyle = { ...inputStyle };

  return (
    <div style={{ background: T.bg, minHeight: "90vh" }}>
      <div style={{ background: T.navy, padding: "20px 24px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h2 style={{ color: "#fff", margin: 0, fontWeight: 900, fontSize: 20 }}>⚙️ Homio Admin</h2>
            <p style={{ color: "rgba(255,255,255,.6)", margin: 0, fontSize: 13 }}>Manage your property listings</p>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={() => { setTab("list"); setForm(EMPTY_FORM); setEditing(null); }}
              style={{ background: tab === "list" ? T.gold : "transparent", color: "#fff", border: `1.5px solid ${tab === "list" ? T.gold : "rgba(255,255,255,.4)"}`, borderRadius: 8, padding: "8px 16px", fontWeight: 700, fontSize: 13, cursor: "pointer" }}
            >
              All Listings ({listings.length})
            </button>
            <button
              onClick={() => setTab("add")}
              style={{ background: tab === "add" ? T.gold : "transparent", color: "#fff", border: `1.5px solid ${tab === "add" ? T.gold : "rgba(255,255,255,.4)"}`, borderRadius: 8, padding: "8px 16px", fontWeight: 700, fontSize: 13, cursor: "pointer" }}
            >
              {editing ? "Edit Property" : "Add New Property"}
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "28px 24px" }}>
        {tab === "list" && (
          <div style={{ background: "#fff", borderRadius: 10, border: `1px solid ${T.border}`, overflow: "auto" }}>
            <table style={{ width: "100%", minWidth: 640, borderCollapse: "collapse", fontSize: 14 }}>
              <thead>
                <tr style={{ background: T.bg, borderBottom: `2px solid ${T.border}` }}>
                  {["Property", "Location", "Price", "Type", "Actions"].map((h) => (
                    <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontWeight: 700, color: T.gray2, fontSize: 12, textTransform: "uppercase" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {listings.map((p, i) => (
                  <tr key={p.id} style={{ borderBottom: `1px solid ${T.border}`, background: i % 2 === 0 ? "#fff" : T.bg }}>
                    <td style={{ padding: "12px 16px", display: "flex", gap: 10, alignItems: "center" }}>
                      <img
                        src={[...(p.listing_images || [])].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))[0]?.url || "https://via.placeholder.com/56x40"}
                        alt=""
                        style={{ width: 56, height: 40, objectFit: "cover", borderRadius: 6 }}
                      />
                      <div style={{ fontWeight: 700, color: T.navy, fontSize: 13 }}>{p.title}</div>
                    </td>
                    <td style={{ padding: "12px 16px", color: T.gray2 }}>{p.city}, {p.region}</td>
                    <td style={{ padding: "12px 16px", fontWeight: 700, color: T.gold }}>{fmt(p.price, p.listing_type)}</td>
                    <td style={{ padding: "12px 16px" }}>{p.listing_type === "rent" ? "To Let" : "For Sale"}</td>
                    <td style={{ padding: "12px 16px", display: "flex", gap: 6 }}>
                      <button onClick={() => startEdit(p)} style={{ background: T.bg, border: "none", borderRadius: 6, padding: "6px 12px", cursor: "pointer", fontSize: 13 }}>✏️ Edit</button>
                      <button onClick={() => setConfirmId(p.id)} style={{ background: T.redL, color: T.red, border: "none", borderRadius: 6, padding: "6px 12px", cursor: "pointer", fontSize: 13 }}>🗑</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {listings.length === 0 && <div style={{ textAlign: "center", padding: 40, color: T.gray3 }}>No listings yet — add your first property.</div>}
          </div>
        )}

        {tab === "add" && (
          <div className="homio-admin-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28 }}>
            <div style={{ background: "#fff", borderRadius: 10, padding: 28, border: `1px solid ${T.border}` }}>
              <h3 style={{ color: T.navy, margin: "0 0 20px" }}>Property Details</h3>
              <FLabel>Title *</FLabel>
              <input value={form.title} onChange={(e) => set("title", e.target.value)} style={inputStyle} placeholder="e.g. Modern 3-Bed Apartment" />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <FLabel>Listing Type *</FLabel>
                  <select value={form.listing_type} onChange={(e) => set("listing_type", e.target.value)} style={selectStyle}>
                    <option value="rent">To Let</option>
                    <option value="sale">For Sale</option>
                  </select>
                </div>
                <div>
                  <FLabel>Category</FLabel>
                  <select value={form.category} onChange={(e) => set("category", e.target.value)} style={selectStyle}>
                    {Object.entries(CAT_LABEL).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <FLabel>Region</FLabel>
                  <select value={form.region} onChange={(e) => set("region", e.target.value)} style={selectStyle}>
                    {REGIONS.map((r) => <option key={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <FLabel>City / Area</FLabel>
                  <input value={form.city} onChange={(e) => set("city", e.target.value)} style={inputStyle} placeholder="e.g. East Legon" />
                </div>
              </div>
              <FLabel>Price (GH₵) *</FLabel>
              <input value={form.price} onChange={(e) => set("price", e.target.value)} type="number" style={inputStyle} placeholder="e.g. 3500" />
              <div className="homio-4col-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
                {[["Beds", "bedrooms"], ["Baths", "bathrooms"], ["Sqft", "sqft"], ["Garage", "garage"]].map(([l, k]) => (
                  <div key={k}>
                    <FLabel>{l}</FLabel>
                    <input value={form[k]} onChange={(e) => set(k, e.target.value)} type="number" style={inputStyle} placeholder="0" />
                  </div>
                ))}
              </div>
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 14 }}>
                <input type="checkbox" checked={form.furnished} onChange={(e) => set("furnished", e.target.checked)} />
                Furnished
              </label>
            </div>

            <div style={{ background: "#fff", borderRadius: 10, padding: 28, border: `1px solid ${T.border}` }}>
              <h3 style={{ color: T.navy, margin: "0 0 20px" }}>Media & Description</h3>
              <FLabel>Photos (first one is the cover photo)</FLabel>
              <PhotoUploader
                images={form.images}
                onChange={(images) => set("images", images)}
                userId={userId}
              />
              <FLabel>Description</FLabel>
              <textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={5} style={{ ...inputStyle, resize: "vertical" }} placeholder="Describe the property…" />
              <FLabel>Tag</FLabel>
              <select value={form.tag} onChange={(e) => set("tag", e.target.value)} style={selectStyle}>
                {["", "Featured", "New", "Hot", "Luxury"].map((t) => <option key={t} value={t}>{t || "None"}</option>)}
              </select>

              {error && <div style={{ color: T.red, fontSize: 13, marginBottom: 14 }}>{error}</div>}

              <div style={{ display: "flex", gap: 10 }}>
                <button
                  onClick={save}
                  disabled={saving}
                  style={{ flex: 1, background: T.gold, color: "#fff", border: "none", borderRadius: 8, padding: "12px", fontWeight: 700, cursor: "pointer", opacity: saving ? 0.6 : 1 }}
                >
                  {saving ? "Saving…" : editing ? "Update Property" : "Add Listing"}
                </button>
                <button
                  onClick={() => { setForm(EMPTY_FORM); setEditing(null); setTab("list"); }}
                  style={{ background: T.bg, color: T.gray1, border: "none", borderRadius: 8, padding: "12px 20px", fontWeight: 700, cursor: "pointer" }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {confirmId && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 500 }}>
          <div style={{ background: "#fff", borderRadius: 14, padding: 32, textAlign: "center", maxWidth: 340, width: "90%" }}>
            <div style={{ fontSize: 44, marginBottom: 12 }}>⚠️</div>
            <h3 style={{ color: T.navy, margin: "0 0 8px" }}>Delete this property?</h3>
            <p style={{ color: T.gray2, fontSize: 14, margin: "0 0 24px" }}>This cannot be undone.</p>
            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={() => setConfirmId(null)} style={{ flex: 1, background: T.bg, border: "none", borderRadius: 8, padding: 12, fontWeight: 700, cursor: "pointer" }}>Cancel</button>
              <button onClick={() => remove(confirmId)} style={{ flex: 1, background: T.red, color: "#fff", border: "none", borderRadius: 8, padding: 12, fontWeight: 700, cursor: "pointer" }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}