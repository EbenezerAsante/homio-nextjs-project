"use client";

import { useState } from "react";
import { createClient } from "../lib/supabase-client";
import { T } from "../lib/constants";

export default function SecurityTab() {
  const supabase = createClient();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
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

    if (password.length < 6) {
      return setError("Password must be at least 6 characters.");
    }
    if (password !== confirm) {
      return setError("Passwords don't match.");
    }

    setLoading(true);
    const { error: err } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (err) return setError(err.message);
    setSuccess("Password updated successfully.");
    setPassword("");
    setConfirm("");
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
        <h3 style={{ margin: "0 0 4px", color: T.navy, fontSize: 16 }}>Change Password</h3>
        <p style={{ margin: "0 0 20px", fontSize: 13, color: T.gray2 }}>
          Choose a new password for your Homio account.
        </p>

        <input
          placeholder="New password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={inputStyle}
        />
        <input
          placeholder="Confirm new password"
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          style={inputStyle}
        />

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
          {loading ? "Updating…" : "Update Password"}
        </button>
      </div>
    </div>
  );
}