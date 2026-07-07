"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { createClient } from "../../lib/supabase-client";
import { T } from "../../lib/constants";

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = createClient();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError(null);

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
    setDone(true);
  };

  const inputStyle = { width: "100%", border: `1.5px solid ${T.border}`, borderRadius: 8, padding: "10px 14px", fontSize: 14, marginBottom: 14, boxSizing: "border-box" };

  return (
    <div style={{ background: T.bg, minHeight: "90vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ background: "#fff", borderRadius: 14, padding: 36, maxWidth: 400, width: "100%", boxShadow: T.shadow, border: `1px solid ${T.border}` }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontWeight: 900, fontSize: 24, color: T.navy }}>
            Homio<span style={{ color: T.gold }}>.</span>
          </div>
          <p style={{ color: T.gray2, fontSize: 13, marginTop: 6 }}>
            {done ? "Password updated" : "Choose a new password"}
          </p>
        </div>

        {done ? (
          <>
            <p style={{ color: T.gray1, fontSize: 14, textAlign: "center", marginBottom: 20 }}>
              Your password has been updated. You can now sign in with your new password.
            </p>
            <button
              onClick={() => router.push("/login")}
              style={{
                width: "100%",
                background: T.navy,
                color: "#fff",
                border: "none",
                borderRadius: 8,
                padding: "12px",
                fontWeight: 700,
                fontSize: 14,
                cursor: "pointer",
              }}
            >
              Go to Sign In
            </button>
          </>
        ) : (
          <>
            <div style={{ position: "relative" }}>
              <input
                placeholder="New password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ ...inputStyle, paddingRight: 42 }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                style={{ position: "absolute", right: 12, top: 10, background: "none", border: "none", cursor: "pointer", color: T.gray2, display: "flex", alignItems: "center" }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <input
              placeholder="Confirm new password"
              type={showPassword ? "text" : "password"}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              style={inputStyle}
            />

            {error && <div style={{ color: T.red, fontSize: 13, marginBottom: 14 }}>{error}</div>}

            <button
              onClick={submit}
              disabled={loading}
              style={{
                width: "100%",
                background: T.gold,
                color: "#fff",
                border: "none",
                borderRadius: 8,
                padding: "12px",
                fontWeight: 700,
                fontSize: 14,
                cursor: loading ? "default" : "pointer",
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? "Updating…" : "Update Password"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}