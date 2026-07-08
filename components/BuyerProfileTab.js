"use client";

import { useState } from "react";
import { createClient } from "../lib/supabase-client";
import { T } from "../lib/constants";

export default function BuyerProfileTab({ user }) {
  const supabase = createClient();
  const [fullName, setFullName] = useState(user?.user_metadata?.full_name || "");
  const [phone, setPhone] = useState(user?.user_metadata?.phone || "");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  const inputStyle = {
    width: "100%",
    border: `1.5px solid ${T.border}`,
    borderRadius: 8,
    padding: "10px 14px",
    fontSize: 14,
    marginBottom: 14,
    boxSizing: "border-box",
    maxWidth: 360,
  };

  const submit = async () => {
    setError(null);
    setSuccess(null);
    setLoading(true);

    const { error: err } = await supabase.auth.updateUser({
      data: { full_name: fullName, phone },
    });

    setLoading(false);
    if (err) return setError(err.message);
    setSuccess("Profile updated successfully.");
  };

  return (
    <div style={{ padding: 24 }}>
      <div
        style={{
          background: "#fff",
          border: `1px solid ${T.border}`,
          borderRadius: 10,
          padding: 24,
          maxWidth: 480,
        }}
      >
        <h3 style={{ margin: "0 0 20px", color: T.navy, fontSize: 16 }}>Your Details</h3>

        <label style={{ fontSize: 12, fontWeight: 700, color: T.gray2, display: "block", marginBottom: 6 }}>
          Email
        </label>
        <input
          value={user?.email || ""}
          disabled
          style={{ ...inputStyle, background: T.bg, color: T.gray2, cursor: "not-allowed" }}
        />

        <label style={{ fontSize: 12, fontWeight: 700, color: T.gray2, display: "block", marginBottom: 6 }}>
          Full Name
        </label>
        <input value={fullName} onChange={(e) => setFullName(e.target.value)} style={inputStyle} />

        <label style={{ fontSize: 12, fontWeight: 700, color: T.gray2, display: "block", marginBottom: 6 }}>
          Phone Number
        </label>
        <input value={phone} onChange={(e) => setPhone(e.target.value)} style={inputStyle} />

        {error && <div style={{ color: T.red, fontSize: 13, marginBottom: 14 }}>{error}</div>}
        {success && <div style={{ color: T.green, fontSize: 13, marginBottom: 14 }}>{success}</div>}

        <button
          onClick={submit}
          disabled={loading}
          style={{
            background: T.gold,
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "10px 24px",
            fontWeight: 700,
            fontSize: 14,
            cursor: loading ? "default" : "pointer",
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? "Saving…" : "Save Changes"}
        </button>
      </div>
    </div>
  );
}