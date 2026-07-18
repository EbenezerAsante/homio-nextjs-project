"use client";

import { useEffect, useState } from "react";
import { fetchAllConversationsAdmin } from "@/lib/conversation-queries";
import ConversationThread from "./ConversationThread";
import { T } from "@/lib/constants";
import { Search, MessageSquare } from "lucide-react";

export default function AdminMessageCenter({ adminId }) {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState(null);

  useEffect(() => {
    fetchAllConversationsAdmin().then((data) => {
      setConversations(data);
      setLoading(false);
    });
  }, []);

  const q = query.trim().toLowerCase();
  const filtered = !q
    ? conversations
    : conversations.filter((c) => {
        const haystack = [
          c.listings?.title,
          c.buyer?.full_name,
          c.buyer?.email,
          c.agent_profile?.full_name,
          c.agent_profile?.email,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return haystack.includes(q);
      });

  if (loading) {
    return <div style={{ padding: 30, textAlign: "center", color: T.gray2 }}>Loading conversations…</div>;
  }

  return (
    <div>
      <div style={{ position: "relative", marginBottom: 16 }}>
        <Search size={16} color={T.gray2} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by buyer, agent, or property…"
          style={{
            width: "100%",
            boxSizing: "border-box",
            border: `1.5px solid ${T.border}`,
            borderRadius: 8,
            padding: "10px 12px 10px 36px",
            fontSize: 13.5,
          }}
        />
      </div>

      {filtered.length === 0 ? (
        <div style={{ background: "#fff", border: `1px dashed ${T.border}`, borderRadius: 12, padding: 40, textAlign: "center", color: T.gray2 }}>
          <MessageSquare size={26} color={T.gray2} style={{ marginBottom: 8 }} />
          <div>{q ? "No conversations match that search." : "No conversations on the platform yet."}</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.map((c) => {
            const cover = c.listings?.listing_images?.slice().sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))?.[0]?.url;
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
                    <div style={{ fontWeight: 700, fontSize: 14, color: T.navy, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {c.listings?.title || "Listing"}
                    </div>
                    <div style={{ fontSize: 12, color: T.gray2, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {c.buyer?.full_name || "Unnamed buyer"} ↔ {c.agent_profile?.full_name || "Unnamed agent"}
                    </div>
                    <div style={{ fontSize: 13, color: T.gray1, marginTop: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {c.lastMessage?.body || "No messages yet"}
                    </div>
                  </div>

                  <div style={{ fontSize: 11, color: T.gray2, flexShrink: 0, textAlign: "right" }}>
                    <div>{c.lastMessage?.created_at ? new Date(c.lastMessage.created_at).toLocaleDateString() : ""}</div>
                    <div style={{ marginTop: 2 }}>{c.messageCount} msg{c.messageCount === 1 ? "" : "s"}</div>
                  </div>
                </button>

                {isOpen && (
                  <div style={{ border: `1px solid ${T.border}`, borderTop: "none", borderRadius: "0 0 10px 10px", overflow: "hidden" }}>
                    <ConversationThread conversation={c} currentUserId={adminId} currentUserRole="admin" readOnly />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}