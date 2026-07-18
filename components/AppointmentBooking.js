"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-client";
import { requestAppointment } from "@/lib/appointments-queries";
import { findOrCreateConversation, sendConversationMessage } from "@/lib/conversation-queries";
import { T } from "@/lib/constants";
import { Calendar } from "lucide-react";

export default function AppointmentBooking({ listingId, agentId }) {
  const router = useRouter();
  const supabase = createClient();
  const [datetime, setDatetime] = useState("");
  const [note, setNote] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [isOwnListing, setIsOwnListing] = useState(false);
  const [checkingOwner, setCheckingOwner] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setIsOwnListing(!!data.user && data.user.id === agentId);
      setCheckingOwner(false);
    });
  }, [agentId]);

  const submit = async () => {
    if (!datetime) {
      setError("Please choose a date and time.");
      return;
    }
    setSending(true);
    setError(null);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setSending(false);
      router.push("/login");
      return;
    }
    if (user.id === agentId) {
      setSending(false);
      setError("You can't book a viewing on your own listing.");
      return;
    }

    try {
      const conversation = await findOrCreateConversation(listingId, user.id);
      const when = new Date(datetime).toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
      await requestAppointment(listingId, user.id, agentId, new Date(datetime).toISOString(), note, conversation.id);
      await sendConversationMessage(
        conversation.id,
        user.id,
        "buyer",
        `📅 Requested a viewing for ${when}${note ? ` — ${note}` : ""}`
      );
      router.push(`/dashboard/messages?open=${conversation.id}`);
    } catch (e) {
      setError(e.message || "Failed to request viewing");
      setSending(false);
    }
  };

  if (checkingOwner) return null;

  if (isOwnListing) {
    return (
      <div style={{ background: T.bg, color: T.gray2, padding: 14, borderRadius: 8, textAlign: "center", fontSize: 13 }}>
        This is your own listing — viewing requests aren't available here.
      </div>
    );
  }

  const inputStyle = { width: "100%", border: `1.5px solid ${T.border}`, borderRadius: 8, padding: "8px 12px", fontSize: 13, marginBottom: 8, boxSizing: "border-box" };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 700, color: T.navy, marginBottom: 10 }}>
        <Calendar size={15} /> Request a Viewing
      </div>
      <input
        type="datetime-local"
        value={datetime}
        onChange={(e) => setDatetime(e.target.value)}
        style={inputStyle}
      />
      <textarea
        placeholder="Anything the agent should know? (optional)"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={2}
        style={{ ...inputStyle, resize: "vertical" }}
      />
      {error && <div style={{ color: T.red, fontSize: 12, marginBottom: 8 }}>{error}</div>}
      <button
        onClick={submit}
        disabled={sending}
        style={{
          width: "100%",
          background: T.gold,
          border: "none",
          color: "#fff",
          borderRadius: 8,
          padding: "10px",
          fontWeight: 700,
          cursor: sending ? "default" : "pointer",
          opacity: sending ? 0.6 : 1,
        }}
      >
        {sending ? "Requesting…" : "Request Viewing"}
      </button>
    </div>
  );
}