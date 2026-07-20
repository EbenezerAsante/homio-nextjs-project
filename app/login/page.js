"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, User } from "lucide-react";
import { createClient } from "../../lib/supabase-client";
import { T } from "../../lib/constants";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [mode, setMode] = useState("login"); // login | signup | forgot
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [form, setForm] = useState({
    email: "", password: "", confirmPassword: "",
    firstName: "", lastName: "", phone: "",
  });
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    setError(null);
    setMessage(null);

    if (mode === "forgot") {
      setLoading(true);
      const { error: err } = await supabase.auth.resetPasswordForEmail(form.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      setLoading(false);
      if (err) return setError(err.message);
      setMessage("Check your email for a password reset link.");
      return;
    }

    if (mode === "login") {
      setLoading(true);
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

    // signup — validate the extra fields before hitting Supabase
    if (!form.firstName.trim() || !form.lastName.trim()) {
      return setError("Please enter your first and last name.");
    }
    if (form.password.length < 8) {
      return setError("Password must be at least 8 characters.");
    }
    if (form.password !== form.confirmPassword) {
      return setError("Passwords don't match.");
    }

    setLoading(true);
    const fullName = `${form.firstName.trim()} ${form.lastName.trim()}`;
    const phone = form.phone.trim() ? `+233${form.phone.trim().replace(/^0/, "")}` : "";

    // everyone gets the same kind of account — what they want to DO
    // (buy, sell, become an agent, etc.) is chosen afterwards on
    // /dashboard, not at signup.
    const { error: err } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { full_name: fullName, phone } },
    });
    if (err) {
      setLoading(false);
      return setError(err.message);
    }

    setLoading(false);
    router.push("/dashboard");
    router.refresh();
  };

  const inputStyle = { width: "100%", border: `1.5px solid ${T.border}`, borderRadius: 8, padding: "10px 14px", fontSize: 14, boxSizing: "border-box" };
  const labelStyle = { display: "block", fontSize: 11, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", color: T.gray2, marginBottom: 6 };
  const fieldWrap = { marginBottom: 16 };

  return (
    <div style={{ background: T.bg, minHeight: "90vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ background: "#fff", borderRadius: 14, padding: 36, maxWidth: 420, width: "100%", boxShadow: T.shadow, border: `1px solid ${T.border}` }}>
        {mode === "signup" ? (
          <div style={{ marginBottom: 22 }}>
            <p style={{ color: T.gold, fontWeight: 700, fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", margin: "0 0 8px" }}>
              Join Homio
            </p>
            <h1 style={{ color: T.navy, fontWeight: 900, fontSize: 26, margin: "0 0 8px" }}>Create your account</h1>
            <p style={{ color: T.gray2, fontSize: 13, margin: "0 0 18px" }}>
              You'll choose what to do next — buy, sell, or list a property.
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
              <div style={{ width: 26, height: 26, borderRadius: "50%", background: T.navy, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, flexShrink: 0 }}>
                1
              </div>
              <div style={{ flex: 1, height: 2, background: T.border, margin: "0 6px" }} />
              <div style={{ width: 26, height: 26, borderRadius: "50%", border: `2px solid ${T.border}`, color: T.gray3, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, flexShrink: 0 }}>
                2
              </div>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <div style={{ fontWeight: 900, fontSize: 24, color: T.navy }}>
              Homio<span style={{ color: T.gold }}>.</span>
            </div>
            <p style={{ color: T.gray2, fontSize: 13, marginTop: 6 }}>
              {mode === "login" ? "Sign in to your account" : "We'll email you a reset link"}
            </p>
          </div>
        )}

        {mode === "signup" && (
          <>
            <div style={{ display: "flex", gap: 10 }}>
              <div style={{ ...fieldWrap, flex: 1 }}>
                <label style={labelStyle}>First Name</label>
                <div style={{ position: "relative" }}>
                  <User size={15} style={{ position: "absolute", left: 12, top: 12, color: T.gray3 }} />
                  <input placeholder="First" value={form.firstName} onChange={(e) => set("firstName", e.target.value)} style={{ ...inputStyle, paddingLeft: 34 }} />
                </div>
              </div>
              <div style={{ ...fieldWrap, flex: 1 }}>
                <label style={labelStyle}>Last Name</label>
                <div style={{ position: "relative" }}>
                  <User size={15} style={{ position: "absolute", left: 12, top: 12, color: T.gray3 }} />
                  <input placeholder="Last" value={form.lastName} onChange={(e) => set("lastName", e.target.value)} style={{ ...inputStyle, paddingLeft: 34 }} />
                </div>
              </div>
            </div>

            <div style={fieldWrap}>
              <label style={labelStyle}>Phone Number</label>
              <div style={{ display: "flex", border: `1.5px solid ${T.border}`, borderRadius: 8, overflow: "hidden" }}>
                <span style={{ display: "flex", alignItems: "center", padding: "0 12px", background: T.bg, color: T.gray1, fontSize: 14, fontWeight: 600, borderRight: `1.5px solid ${T.border}` }}>
                  +233
                </span>
                <input
                  placeholder="XX XXX XXXX"
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value)}
                  style={{ flex: 1, border: "none", padding: "10px 14px", fontSize: 14, boxSizing: "border-box", minWidth: 0 }}
                />
              </div>
            </div>
          </>
        )}

        <div style={fieldWrap}>
          {mode === "signup" && <label style={labelStyle}>Email Address</label>}
          <input placeholder={mode === "signup" ? "you@example.com" : "Email"} type="email" value={form.email} onChange={(e) => set("email", e.target.value)} style={inputStyle} />
        </div>

        {mode !== "forgot" && (
          <div style={fieldWrap}>
            {mode === "signup" && <label style={labelStyle}>Password</label>}
            <div style={{ position: "relative" }}>
              <input
                placeholder={mode === "signup" ? "Min 8 characters" : "Password"}
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={(e) => set("password", e.target.value)}
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
          </div>
        )}

        {mode === "signup" && (
          <div style={fieldWrap}>
            <label style={labelStyle}>Confirm Password</label>
            <div style={{ position: "relative" }}>
              <input
                placeholder="Re-enter password"
                type={showConfirm ? "text" : "password"}
                value={form.confirmPassword}
                onChange={(e) => set("confirmPassword", e.target.value)}
                style={{ ...inputStyle, paddingRight: 42 }}
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                aria-label={showConfirm ? "Hide password" : "Show password"}
                style={{ position: "absolute", right: 12, top: 10, background: "none", border: "none", cursor: "pointer", color: T.gray2, display: "flex", alignItems: "center" }}
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
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
          {loading ? "Please wait…" : mode === "login" ? "Sign In" : mode === "forgot" ? "Send Reset Link" : "Continue"}
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