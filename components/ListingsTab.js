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

      <table className="admin-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Type</th>
            <th>Price</th>
            <th>Region</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {listings.length === 0 ? (
            <tr><td colSpan={6} style={{ textAlign: "center", color: T.gray2, padding: 20 }}>No listings yet</td></tr>
          ) : (
            listings.map((l) => (
              <tr key={l.id}>
                <td>{l.title}</td>
                <td>{l.listing_type}</td>
                <td>{l.currency || "GHS"} {l.price?.toLocaleString()}</td>
                <td>{l.region}</td>
                <td>
                  {l.status === "pending" || l.status === "rejected" ? (
                    <div>
                      <span className={`admin-badge ${l.status}`}>
                        {l.status === "pending" ? "Pending Review" : "Rejected"}
                      </span>
                      {l.status === "rejected" && l.rejection_reason && (
                        <div style={{ fontSize: 11, color: T.gray2, marginTop: 4, maxWidth: 180 }}>
                          {l.rejection_reason}
                        </div>
                      )}
                    </div>
                  ) : (
                    <select
                      value={l.status}
                      onChange={(e) => handleStatusChange(l.id, e.target.value)}
                      style={{ border: `1px solid ${T.border}`, borderRadius: 6, padding: "4px 8px", fontSize: 13 }}
                    >
                      <option value="active">Active</option>
                      <option value="under_offer">Under Offer</option>
                      <option value="taken">Taken</option>
                      <option value="expired">Expired</option>
                    </select>
                  )}
                </td>
                <td>
                  <button onClick={() => handleEdit(l)} style={{ marginRight: 8, background: "none", border: "none", color: T.navy, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
                    Edit
                  </button>
                  <button onClick={() => handleDelete(l.id)} style={{ background: "none", border: "none", color: T.red, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}