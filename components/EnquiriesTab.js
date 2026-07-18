"use client";

import { useState } from "react";
import ConversationThread from "./ConversationThread";
import { T } from "@/lib/constants";
import { MessageCircle } from "lucide-react";

export default function EnquiriesTab({ conversations, userId, onChange }) {
  const [openId, setOpenId] = useState(null);

  if (!conversations || conversations.length === 0) {
    return (
      <div style={{ background: "#fff", border: `1px dashed ${T.border}`, borderRadius: 12, padding: 40, textAlign: "center", color: T.gray2 }}>
        <MessageCircle size={28} color={T.gray2} style={{ marginBottom: 10 }} />
        <div>No conversations yet — they'll appear here as soon as a buyer messages you.</div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {conversations.map((c) => {
        const cover = c.listings?.listing_images?.slice().sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))?.[0]?.url;
        const buyerName = c.profiles?.full_name || "A buyer";
        const unread = c.unreadCount > 0;
        const isOpen = openId === c.id;
        return (
          <div key={c.id}>
            <button
              onClick={() => setOpenId(isOpen ? null : c.id)}
              style={{
                width: "100%",
                boxSizing: "border-box",
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: 14,
                background: "#fff",
                border: `1px solid ${T.border}`,
                borderRadius: isOpen ? "10px 10px 0 0" : 10,
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              {cover ? (
                <img src={cover} alt="" style={{ width: 54, height: 54, borderRadius: 8, objectFit: "cover", flexShrink: 0 }} />
              ) : (
                <div style={{ width: 54, height: 54, borderRadius: 8, background: T.bg, flexShrink: 0 }} />
              )}

              <div style={{ minWidth: 0, flex: 1, overflow: "hidden" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
                  <div style={{ fontWeight: unread ? 800 : 700, fontSize: 14, color: T.navy, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {buyerName}
                  </div>
                  <div style={{ fontSize: 11, color: T.gray2, flexShrink: 0 }}>
                    {c.lastMessage?.created_at ? new Date(c.lastMessage.created_at).toLocaleDateString() : ""}
                  </div>
                </div>
                <div style={{ fontSize: 12.5, color: T.navy, fontWeight: 600, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {c.listings?.title || "Listing"}
                </div>
                <div
                  style={{
                    fontSize: 13,
                    color: unread ? T.gray1 : T.gray2,
                    fontWeight: unread ? 700 : 400,
                    marginTop: 3,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {c.lastMessage?.body || "No messages yet"}
                </div>
              </div>

              {unread && (
                <div
                  style={{
                    flexShrink: 0, minWidth: 20, height: 20, borderRadius: 999,
                    background: T.gold, color: "#fff", fontSize: 11, fontWeight: 800,
                    display: "flex", alignItems: "center", justifyContent: "center", padding: "0 5px",
                  }}
                >
                  {c.unreadCount}
                </div>
              )}
            </button>

            {isOpen && (
              <div style={{ border: `1px solid ${T.border}`, borderTop: "none", borderRadius: "0 0 10px 10px", overflow: "hidden" }}>
                <ConversationThread conversation={c} currentUserId={userId} currentUserRole="agent" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}