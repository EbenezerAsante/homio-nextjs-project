"use client";

import { useEffect, useRef, useState } from "react";
import { fetchMessages, sendMessage } from "@/lib/messaging-queries";
import { T } from "@/lib/constants";
import { Send } from "lucide-react";

export default function MessageThread({ enquiry, currentUserId, currentUserRole }) {
  const [messages, setMessages] = useState([]);
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  const load = async () => {
    const data = await fetchMessages(enquiry.id);
    setMessages(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [enquiry.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const handleSend = async () => {
    if (!body.trim()) return;
    setSending(true);
    try {
      await sendMessage(enquiry.id, currentUserId, currentUserRole, body.trim());
      setBody("");
      await load();
    } catch (e) {
      alert(e.message || "Failed to send message");
    }
    setSending(false);
  };

  return (
    <div style={{ border: `1px solid ${T.border}`, borderRadius: 10, background: "#fff", display: "flex", flexDirection: "column", height: 420 }}>
      <div style={{ padding: "12px 16px", borderBottom: `1px solid ${T.border}`, fontSize: 13, fontWeight: 700, color: T.navy }}>
        {enquiry.listings?.title || "Enquiry"}
        <div style={{ fontWeight: 400, color: T.gray2, fontSize: 12, marginTop: 2 }}>
          {currentUserRole === "buyer" ? `with the listing agent` : `with ${enquiry.name}`}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
        {/* Original enquiry message, shown as the first bubble */}
        {enquiry.message && (
          <div style={{ alignSelf: "flex-start", maxWidth: "80%" }}>
            <div style={{ background: T.bg, borderRadius: 12, borderBottomLeftRadius: 4, padding: "8px 12px", fontSize: 13.5, color: T.gray1 }}>
              {enquiry.message}
            </div>
            <div style={{ fontSize: 10.5, color: T.gray2, marginTop: 2, marginLeft: 4 }}>
              {enquiry.name} · {new Date(enquiry.created_at).toLocaleString()}
            </div>
          </div>
        )}

        {loading ? (
          <div style={{ color: T.gray2, fontSize: 13, textAlign: "center", padding: 20 }}>Loading…</div>
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
          style={{ flex: 1, border: `1.5px solid ${T.border}`, borderRadius: 8, padding: "8px 12px", fontSize: 13.5 }}
        />
        <button
          onClick={handleSend}
          disabled={sending || !body.trim()}
          style={{ background: T.navy, color: "#fff", border: "none", borderRadius: 8, padding: "8px 14px", cursor: sending ? "default" : "pointer", opacity: sending || !body.trim() ? 0.6 : 1, display: "flex", alignItems: "center" }}
        >
          <Send size={15} />
        </button>
      </div>
    </div>
  );
}