"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../lib/supabase-client";
import { findOrCreateConversation, sendConversationMessage } from "../lib/conversation-queries";
import { T } from "../lib/constants";

export default function EnquiryForm({ listingId, agentId }) {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [isOwnListing, setIsOwnListing] = useState(false);
  const [checkingUser, setCheckingUser] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user || null);
      setIsOwnListing(!!data.user && data.user.id === agentId);
      setCheckingUser(false);
    });
  }, [agentId]);

  const submit = async () => {
    if (!message.trim()) {
      setError("Type a message to send.");
      return;
    }
    setSending(true);
    setError(null);
    try {
      const conversation = await findOrCreateConversation(listingId, user.id);
      await sendConversationMessage(conversation.id, user.id, "buyer", message.trim());
      router.push(`/dashboard/messages?open=${conversation.id}`);
    } catch (e) {
      setSending(false);
      setError(e.message || "Couldn't send your message. Try again.");
    }
  };

  if (checkingUser) return null;

  if (isOwnListing) {
    return (
      <div style={{ background: T.bg, color: T.gray2, padding: 14, borderRadius: 8, textAlign: "center", fontSize: 13 }}>
        This is your own listing — enquiries aren't available here.
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ background: T.bg, borderRadius: 8, padding: 16, textAlign: "center" }}>
        <div style={{ fontSize: 13, color: T.gray1, marginBottom: 10 }}>
          Sign in to message the agent about this property.
        </div>
        <a
          href="/login"
          style={{
            display: "inline-block",
            background: T.navy,
            color: "#fff",
            borderRadius: 8,
            padding: "9px 18px",
            fontSize: 13,
            fontWeight: 700,
            textDecoration: "none",
          }}
        >
          Sign in
        </a>
      </div>
    );
  }

  return (
    <div>
      <textarea
        placeholder="Ask a question about this property…"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={3}
        style={{
          width: "100%",
          border: `1.5px solid ${T.border}`,
          borderRadius: 8,
          padding: "8px 12px",
          fontSize: 13,
          marginBottom: 8,
          boxSizing: "border-box",
          resize: "vertical",
        }}
      />
      {error && <div style={{ color: T.red, fontSize: 12, marginBottom: 8 }}>{error}</div>}
      <button
        onClick={submit}
        disabled={sending}
        style={{
          width: "100%",
          background: "transparent",
          border: `1.5px solid ${T.navy}`,
          color: T.navy,
          borderRadius: 8,
          padding: "10px",
          fontWeight: 700,
          cursor: sending ? "default" : "pointer",
          opacity: sending ? 0.6 : 1,
        }}
      >
        {sending ? "Sending…" : "✉️ Message Agent"}
      </button>
    </div>
  );
}