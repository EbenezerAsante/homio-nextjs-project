"use client";

import { updateEnquiryStatus } from "@/lib/admin-queries";
import { T } from "@/lib/constants";

export default function EnquiriesTab({ enquiries, onChange }) {
  const handleStatusChange = async (id, status) => {
    await updateEnquiryStatus(id, status);
    onChange();
  };

  return (
    <table className="admin-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Contact</th>
          <th>Listing</th>
          <th>Message</th>
          <th>Status</th>
          <th>Received</th>
        </tr>
      </thead>
      <tbody>
        {enquiries.length === 0 ? (
          <tr><td colSpan={6} style={{ textAlign: "center", color: T.gray2, padding: 20 }}>No enquiries yet</td></tr>
        ) : (
          enquiries.map((e) => (
            <tr key={e.id}>
              <td>{e.name}</td>
              <td>
                <div>{e.phone}</div>
                <div style={{ fontSize: 12, color: T.gray2 }}>{e.email}</div>
              </td>
              <td>{e.listings?.title || "—"}</td>
              <td style={{ maxWidth: 240 }}>{e.message}</td>
              <td>
                <select
                  value={e.status}
                  onChange={(ev) => handleStatusChange(e.id, ev.target.value)}
                  style={{ border: `1px solid ${T.border}`, borderRadius: 6, padding: "4px 8px", fontSize: 13 }}
                >
                  <option value="pending">Pending</option>
                  <option value="responded">Responded</option>
                  <option value="closed">Closed</option>
                </select>
              </td>
              <td style={{ fontSize: 13, color: T.gray2 }}>
                {e.created_at ? new Date(e.created_at).toLocaleDateString() : "—"}
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}
