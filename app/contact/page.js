"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase-client";
import { T } from "@/lib/constants";
import { Mail, CheckCircle2 } from "lucide-react";

export default function ContactPage() {
  const supabase = createClient();
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    if (!form.name || !form.email || !form.message) {
      setError("Please fill in all fields.");
      return;
    }
    setSending(true);
    setError(null);
    const { error: err } = await supabase.from("contact_messages").insert(form);
    setSending(false);
    if (err) setError(err.message);
    else setSent(true);
  };

  const inputStyle = { width: "100%", border: `1.5px solid ${T.border}`, borderRadius: 8, padding: "10px 14px", fontSize: 14, marginBottom: 14, boxSizing: "border-box", fontFamily: "inherit" };

  return (
    <div style={{ background: T.bg, minHeight: "80vh", padding: "64px 24px" }}>
      <div style={{ maxWidth: 480, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <p style={{ color: T.gold, fontWeight: 700, fontSize: 11, letterSpacing: 2, textTransform: "uppercase", margin: "0 0 10px" }}>
            Contact
          </p>
          <h1 style={{ color: T.navy, fontWeight: 900, fontSize: 28, margin: "0 0 10px" }}>Get in touch</h1>
          <p style={{ color: T.gray2, fontSize: 14 }}>
            Questions, feedback, or need help with your account? Send us a message and we'll get back to you.
          </p>
        </div>

        <div style={{ background: "#fff", border: `1px solid ${T.border}`, borderRadius: 14, padding: 32, boxShadow: T.shadow }}>
          {sent ? (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <CheckCircle2 size={32} color={T.green} style={{ marginBottom: 12 }} />
              <h3 style={{ color: T.navy, fontSize: 17, fontWeight: 800, margin: "0 0 6px" }}>Message sent</h3>
              <p style={{ color: T.gray2, fontSize: 13.5 }}>Thanks for reaching out — we'll get back to you soon.</p>
            </div>
          ) : (
            <>
              <input placeholder="Your Name" value={form.name} onChange={(e) => set("name", e.target.value)} style={inputStyle} />
              <input placeholder="Your Email" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} style={inputStyle} />
              <textarea
                placeholder="How can we help?"
                value={form.message}
                onChange={(e) => set("message", e.target.value)}
                rows={5}
                style={{ ...inputStyle, resize: "vertical" }}
              />
              {error && <div style={{ color: T.red, fontSize: 12.5, marginBottom: 12 }}>{error}</div>}
              <button
                onClick={submit}
                disabled={sending}
                style={{
                  width: "100%",
                  background: T.gold,
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  padding: "12px",
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: sending ? "default" : "pointer",
                  opacity: sending ? 0.6 : 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                }}
              >
                <Mail size={15} /> {sending ? "Sending…" : "Send Message"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}