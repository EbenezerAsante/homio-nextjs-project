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

  if (enquiries.length === 0) {
    return (
      <div style={{ textAlign: "center", color: T.gray2, padding: 30, background: "#fff", borderRadius: 10, border: `1px solid ${T.border}` }}>
        No enquiries yet
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {enquiries.map((e) => {
        const cover = e.listings?.listing_images?.slice().sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))?.[0]?.url;
        return (
        <div key={e.id}>
          <div
            style={{
              background: "#fff",
              border: `1px solid ${T.border}`,
              borderRadius: 10,
              padding: 14,
              boxSizing: "border-box",
              width: "100%",
              minWidth: 0,
              display: "flex",
              gap: 12,
            }}
          >
            {cover ? (
              <img src={cover} alt="" style={{ width: 56, height: 56, borderRadius: 8, objectFit: "cover", flexShrink: 0 }} />
            ) : (
              <div style={{ width: 56, height: 56, borderRadius: 8, background: T.bg, flexShrink: 0 }} />
            )}
            <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
              <div style={{ fontWeight: 700, fontSize: 14.5, color: T.navy, minWidth: 0, overflowWrap: "break-word" }}>
                {e.name}
              </div>
              <div style={{ fontSize: 11.5, color: T.gray2, flexShrink: 0, whiteSpace: "nowrap" }}>
                {e.created_at ? new Date(e.created_at).toLocaleDateString() : "—"}
              </div>
            </div>

            <div style={{ fontSize: 12.5, color: T.navy, fontWeight: 600, marginTop: 4, overflowWrap: "break-word" }}>
              {e.listings?.title || "—"}
            </div>

            <div style={{ fontSize: 12.5, color: T.gray2, marginTop: 4, overflowWrap: "break-word" }}>
              {e.phone}{e.email ? ` • ${e.email}` : ""}
            </div>

            {e.message && (
              <div style={{ fontSize: 13, color: T.gray1, marginTop: 8, background: T.bg, borderRadius: 6, padding: "8px 10px", overflowWrap: "break-word" }}>
                {e.message}
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
              <select
                value={e.status}
                onChange={(ev) => handleStatusChange(e.id, ev.target.value)}
                style={{ border: `1px solid ${T.border}`, borderRadius: 6, padding: "5px 8px", fontSize: 13, minWidth: 0 }}
              >
                <option value="pending">Pending</option>
                <option value="responded">Responded</option>
                <option value="closed">Closed</option>
              </select>

              {e.buyer_id ? (
                <button
                  onClick={() => setOpenThreadId(openThreadId === e.id ? null : e.id)}
                  style={{
                    display: "flex", alignItems: "center", gap: 6,
                    background: T.bg, border: "none", borderRadius: 6, padding: "6px 10px",
                    cursor: "pointer", color: T.navy, fontSize: 13, fontWeight: 600,
                  }}
                >
                  <MessageCircle size={14} /> {openThreadId === e.id ? "Hide thread" : "Message buyer"}
                </button>
              ) : (
                <span style={{ fontSize: 11.5, color: T.gray2 }}>No account</span>
              )}
            </div>
            </div>
          </div>

          {openThreadId === e.id && (
            <div style={{ marginTop: 8 }}>
              <MessageThread
                enquiry={enquiries.find((x) => x.id === openThreadId)}
                currentUserId={userId}
                currentUserRole="agent"
              />
            </div>
          )}
        </div>
        );
      })}
    </div>
  );
}