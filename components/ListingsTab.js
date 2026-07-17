"use client";

import { useState } from "react";
import { deleteListing, updateListingStatus } from "@/lib/admin-queries";
import { T } from "@/lib/constants";
import ListingForm from "./ListingForm";

export default function ListingsTab({ listings, userId, onChange }) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  const handleEdit = (listing) => {
    setEditing(listing);
    setShowForm(true);
  };

  const handleDone = () => {
    setShowForm(false);
    setEditing(null);
    onChange();
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this listing? This cannot be undone.")) return;
    await deleteListing(id);
    onChange();
  };

  const handleStatusChange = async (id, status) => {
    await updateListingStatus(id, status);
    onChange();
  };

  return (
    <div>
      {!showForm && (
        <button
          className="admin-btn admin-btn-gold"
          style={{ marginBottom: 20 }}
          onClick={() => { setEditing(null); setShowForm(true); }}
        >
          + New Listing
        </button>
      )}

      {showForm && (
        <ListingForm
          userId={userId}
          existing={editing}
          onDone={handleDone}
          onCancel={() => { setShowForm(false); setEditing(null); }}
        />
      )}

      {listings.length === 0 ? (
        <div style={{ textAlign: "center", color: T.gray2, padding: 30, background: "#fff", borderRadius: 10, border: `1px solid ${T.border}` }}>
          No listings yet
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {listings.map((l) => (
            <div
              key={l.id}
              style={{
                background: "#fff",
                border: `1px solid ${T.border}`,
                borderRadius: 10,
                padding: 14,
                boxSizing: "border-box",
                width: "100%",
                minWidth: 0,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                <div style={{ fontWeight: 700, fontSize: 14.5, color: T.navy, minWidth: 0, overflowWrap: "break-word" }}>
                  {l.title}
                </div>
                {(l.status === "pending" || l.status === "rejected") && (
                  <span className={`admin-badge ${l.status}`} style={{ flexShrink: 0 }}>
                    {l.status === "pending" ? "Pending Review" : "Rejected"}
                  </span>
                )}
              </div>

              <div style={{ fontSize: 12.5, color: T.gray2, marginTop: 4 }}>
                {l.listing_type} &nbsp;•&nbsp; {l.currency || "GHS"} {l.price?.toLocaleString()} &nbsp;•&nbsp; {l.region}
              </div>

              {l.status === "rejected" && l.rejection_reason && (
                <div style={{ fontSize: 12, color: T.gray2, marginTop: 6, background: T.bg, borderRadius: 6, padding: "6px 8px" }}>
                  {l.rejection_reason}
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
                {l.status === "pending" || l.status === "rejected" ? (
                  <span />
                ) : (
                  <select
                    value={l.status}
                    onChange={(e) => handleStatusChange(l.id, e.target.value)}
                    style={{ border: `1px solid ${T.border}`, borderRadius: 6, padding: "5px 8px", fontSize: 13, minWidth: 0 }}
                  >
                    <option value="active">Active</option>
                    <option value="under_offer">Under Offer</option>
                    <option value="taken">Taken</option>
                    <option value="expired">Expired</option>
                  </select>
                )}
                <div style={{ display: "flex", gap: 14, marginLeft: "auto" }}>
                  <button onClick={() => handleEdit(l)} style={{ background: "none", border: "none", color: T.navy, cursor: "pointer", fontSize: 13, fontWeight: 700 }}>
                    Edit
                  </button>
                  <button onClick={() => handleDelete(l.id)} style={{ background: "none", border: "none", color: T.red, cursor: "pointer", fontSize: 13, fontWeight: 700 }}>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}