"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { createClient } from "../../lib/supabase-client";
import { T } from "../../lib/constants";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [mode, setMode] = useState("login"); // login | signup | forgot
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: "", password: "", fullName: "", phone: "" });
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    setError(null);
    setMessage(null);
    setLoading(true);

    if (mode === "forgot") {
      const { error: err } = await supabase.auth.resetPasswordForEmail(form.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      setLoading(false);
      if (err) return setError(err.message);
      setMessage("Check your email for a password reset link.");
      return;
    }

    if (mode === "login") {
      const { error: err } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      });
      if (err) {
        setLoading(false);
        return setError(err.message);
      }
      setLoading(false);
      window.location.href = "/dashboard";
      return;
    }

    // signup — everyone gets the same kind of account.
    // What they want to DO (buy, sell, become an agent, etc.) is chosen
    // afterwards on /dashboard, not at signup.
    const { data, error: err } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          full_name: form.fullName,
          phone: form.phone,
        },
      },
    });
    if (err) {
      setLoading(false);
      return setError(err.message);
    }

    setLoading(false);
    router.push("/dashboard");
    router.refresh();
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
            {mode === "login"
              ? "Sign in to your account"
              : mode === "forgot"
              ? "We'll email you a reset link"
              : "Create your account — you'll choose what to do next"}
          </p>
        </div>

        {mode === "signup" && (
          <>
            <input placeholder="Full Name" value={form.fullName} onChange={(e) => set("fullName", e.target.value)} style={inputStyle} />
            <input placeholder="Phone Number (+233...)" value={form.phone} onChange={(e) => set("phone", e.target.value)} style={inputStyle} />
          </>
        )}
        <input placeholder="Email" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} style={inputStyle} />
        {mode !== "forgot" && (
          <div style={{ position: "relative" }}>
            <input
              placeholder="Password"
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={(e) => set("password", e.target.value)}
              style={{ ...inputStyle, paddingRight: 42 }}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              style={{
                position: "absolute",
                right: 12,
                top: 10,
                background: "none",
                border: "none",
                cursor: "pointer",
                color: T.gray2,
                display: "flex",
                alignItems: "center",
              }}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        )}

        {mode === "login" && (
          <p style={{ textAlign: "right", marginTop: -8, marginBottom: 14 }}>
            <button
              onClick={() => { setError(null); setMessage(null); setMode("forgot"); }}
              style={{ color: T.gray2, fontSize: 12.5, background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}
            >
              Forgot password?
            </button>
          </p>
        )}

        {error && <div style={{ color: T.red, fontSize: 13, marginBottom: 14 }}>{error}</div>}
        {message && <div style={{ color: T.green, fontSize: 13, marginBottom: 14 }}>{message}</div>}

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
            marginBottom: 14,
          }}
        >
          {loading ? "Please wait…" : mode === "login" ? "Sign In" : mode === "forgot" ? "Send Reset Link" : "Create Account"}
        </button>

        <p style={{ textAlign: "center", fontSize: 13, color: T.gray2 }}>
          {mode === "forgot" ? (
            <button onClick={() => { setError(null); setMessage(null); setMode("login"); }} style={{ color: T.navy, fontWeight: 700, background: "none", border: "none", cursor: "pointer" }}>
              ← Back to sign in
            </button>
          ) : mode === "login" ? (
            <>
              New here?{" "}
              <button onClick={() => setMode("signup")} style={{ color: T.navy, fontWeight: 700, background: "none", border: "none", cursor: "pointer" }}>
                Create an account
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button onClick={() => setMode("login")} style={{ color: T.navy, fontWeight: 700, background: "none", border: "none", cursor: "pointer" }}>
                Sign in
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}