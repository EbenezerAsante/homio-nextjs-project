"use client";

import { useEffect, useRef, useState } from "react";
import { fetchConversationMessages, sendConversationMessage, markConversationRead } from "@/lib/conversation-queries";
import { T } from "@/lib/constants";
import { Send } from "lucide-react";

export default function ConversationThread({ conversation, currentUserId, currentUserRole, fill = false }) {
  const [messages, setMessages] = useState([]);
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  const load = async () => {
    const data = await fetchConversationMessages(conversation.id);
    setMessages(data);
    setLoading(false);
    markConversationRead(conversation.id, currentUserId);
  };

  useEffect(() => {
    load();
  }, [conversation.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const handleSend = async () => {
    if (!body.trim()) return;
    setSending(true);
    try {
      await sendConversationMessage(conversation.id, currentUserId, currentUserRole, body.trim());
      setBody("");
      await load();
    } catch (e) {
      alert(e.message || "Failed to send message");
    }
    setSending(false);
  };

  return (
    <div
      style={{
        border: fill ? "none" : `1px solid ${T.border}`,
        borderRadius: fill ? 0 : 10,
        background: "#fff",
        display: "flex",
        flexDirection: "column",
        height: fill ? "100%" : 420,
      }}
    >
      <div style={{ flex: 1, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
        {loading ? (
          <div style={{ color: T.gray2, fontSize: 13, textAlign: "center", padding: 20 }}>Loading…</div>
        ) : messages.length === 0 ? (
          <div style={{ color: T.gray2, fontSize: 13, textAlign: "center", padding: 20 }}>
            No messages yet — say hello.
          </div>
        ) : (
          messages.map((m) => {
            const isMine = m.sender_id === currentUserId;
            return (
              <div key={m.id} style={{ alignSelf: isMine ? "flex-end" : "flex-start", maxWidth: "80%" }}>
                <div
                  style={{
                    background: isMine ? T.navy : T.bg,
                    color: isMine ? "#fff" : T.gray1,
                    borderRadius: 12,
                    borderBottomRightRadius: isMine ? 4 : 12,
                    borderBottomLeftRadius: isMine ? 12 : 4,
                    padding: "8px 12px",
                    fontSize: 13.5,
                    overflowWrap: "break-word",
                  }}
                >
                  {m.body}
                </div>
                <div style={{ fontSize: 10.5, color: T.gray2, marginTop: 2, textAlign: isMine ? "right" : "left", marginRight: isMine ? 4 : 0, marginLeft: isMine ? 0 : 4 }}>
                  {new Date(m.created_at).toLocaleString()}
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <div style={{ display: "flex", gap: 8, padding: 12, borderTop: `1px solid ${T.border}` }}>
        <input
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Type a message…"
          style={{ flex: 1, border: `1.5px solid ${T.border}`, borderRadius: 8, padding: "8px 12px", fontSize: 13.5, minWidth: 0 }}
        />
        <button
          onClick={handleSend}
          disabled={sending || !body.trim()}
          style={{ background: T.navy, color: "#fff", border: "none", borderRadius: 8, padding: "8px 14px", cursor: sending ? "default" : "pointer", opacity: sending || !body.trim() ? 0.6 : 1, display: "flex", alignItems: "center", flexShrink: 0 }}
        >
          <Send size={15} />
        </button>
      </div>
    </div>
  );
}