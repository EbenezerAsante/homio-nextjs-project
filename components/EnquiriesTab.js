"use client";

import { useState } from "react";
import { updateEnquiryStatus } from "@/lib/admin-queries";
import { T } from "@/lib/constants";
import MessageThread from "./MessageThread";
import { MessageCircle } from "lucide-react";

export default function EnquiriesTab({ enquiries, userId, onChange }) {
  const [openThreadId, setOpenThreadId] = useState(null);

  const handleStatusChange = async (id, status) => {
    await updateEnquiryStatus(id, status);
    onChange();
  };

  return (
    <div>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Contact</th>
            <th>Listing</th>
            <th>Message</th>
            <th>Status</th>
            <th>Received</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {enquiries.length === 0 ? (
            <tr><td colSpan={7} style={{ textAlign: "center", color: T.gray2, padding: 20 }}>No enquiries yet</td></tr>
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
                <td>
                  {e.buyer_id ? (
                    <button
                      onClick={() => setOpenThreadId(openThreadId === e.id ? null : e.id)}
                      title="Message buyer"
                      style={{ background: T.bg, border: "none", borderRadius: 6, padding: "5px 8px", cursor: "pointer", color: T.navy, display: "flex", alignItems: "center" }}
                    >
                      <MessageCircle size={14} />
                    </button>
                  ) : (
                    <span style={{ fontSize: 11, color: T.gray2 }}>No account</span>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {openThreadId && (
        <div style={{ marginTop: 16, maxWidth: 480 }}>
          <MessageThread
            enquiry={enquiries.find((e) => e.id === openThreadId)}
            currentUserId={userId}
            currentUserRole="agent"
          />
        </div>
      )}
    </div>
  );
}