"use client";

import { useState } from "react";
import { createClient } from "../lib/supabase-client";
import { T } from "../lib/constants";

export default function EnquiryForm({ listingId, agentId }) {
  const supabase = createClient();
  const [form, setForm] = useState({ name: "", phone: "", email: "", message: "" });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  const submit = async () => {
    if (!form.name || !form.phone) {
      setError("Please fill in your name and phone number.");
      return;
    }
    setSending(true);
    setError(null);
    const { error: err } = await supabase.from("enquiries").insert({
      listing_id: listingId,
      agent_id: agentId,
      name: form.name,
      phone: form.phone,
      email: form.email || null,
      message: form.message || null,
    });
    setSending(false);
    if (err) setError(err.message);
    else setSent(true);
  };

  if (sent) {
    return (
      <div style={{ background: T.greenL, color: T.green, padding: 14, borderRadius: 8, textAlign: "center", fontSize: 13, fontWeight: 700 }}>
        ✔ Enquiry sent! The agent will contact you shortly.
      </div>
    );
  }

  const inputStyle = { width: "100%", border: `1.5px solid ${T.border}`, borderRadius: 8, padding: "8px 12px", fontSize: 13, marginBottom: 8, boxSizing: "border-box" };

  return (
    <div>
      <input placeholder="Your Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={inputStyle} />
      <input placeholder="Phone Number *" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} style={inputStyle} />
      <input placeholder="Email (optional)" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} style={inputStyle} />
      <textarea
        placeholder="Message (optional)"
        value={form.message}
        onChange={(e) => setForm({ ...form, message: e.target.value })}
        rows={3}
        style={{ ...inputStyle, resize: "vertical" }}
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
        {sending ? "Sending…" : "✉️ Send Enquiry"}
      </button>
    </div>
  );
}
