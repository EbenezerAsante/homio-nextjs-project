"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase-client";
import { T } from "@/lib/constants";

export default function ProfileTab({ agent, userId }) {
  const supabase = createClient();
  const [form, setForm] = useState({
    company: agent?.company || "",
    full_name: agent?.full_name || "",
    phone: agent?.phone || "",
    email: agent?.email || "",
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    setSaving(true);
    setMessage(null);
    const { error } = await supabase.from("agents").update(form).eq("id", userId);
    setSaving(false);
    setMessage(error ? error.message : "Profile updated");
  };

  const inputStyle = {
    width: "100%",
    maxWidth: 400,
    border: `1.5px solid ${T.border}`,
    borderRadius: 8,
    padding: "10px 14px",
    fontSize: 14,
    marginBottom: 14,
    boxSizing: "border-box",
    display: "block",
  };

  return (
    <div style={{ background: "#fff", borderRadius: 10, border: `1px solid ${T.border}`, padding: 28, maxWidth: 460 }}>
      <label style={{ fontSize: 13, color: T.gray2 }}>Company / Agency Name</label>
      <input style={inputStyle} value={form.company} onChange={(e) => set("company", e.target.value)} />

      <label style={{ fontSize: 13, color: T.gray2 }}>Full Name</label>
      <input style={inputStyle} value={form.full_name} onChange={(e) => set("full_name", e.target.value)} />

      <label style={{ fontSize: 13, color: T.gray2 }}>Phone</label>
      <input style={inputStyle} value={form.phone} onChange={(e) => set("phone", e.target.value)} />

      <label style={{ fontSize: 13, color: T.gray2 }}>Email</label>
      <input style={inputStyle} value={form.email} onChange={(e) => set("email", e.target.value)} disabled />

      {message && <div style={{ fontSize: 13, color: message.includes("updated") ? T.green : T.red, marginBottom: 14 }}>{message}</div>}

      <button
        className="admin-btn admin-btn-primary"
        onClick={save}
        disabled={saving}
        style={{ opacity: saving ? 0.6 : 1 }}
      >
        {saving ? "Saving..." : "Save Changes"}
      </button>
    </div>
  );
}
