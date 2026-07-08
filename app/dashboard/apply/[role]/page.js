"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase-client";
import { activateOwnerRole, submitRoleApplication } from "@/lib/profile-queries";
import { T } from "@/lib/constants";
import { CheckCircle2, Clock } from "lucide-react";

const CONFIGS = {
  owner: {
    title: "Sell or Rent My Property",
    instant: true,
  },
  agent: {
    title: "Become an Agent",
    instant: false,
    fields: [
      { key: "company", label: "Company (optional)", type: "text" },
      { key: "bio", label: "Short Bio", type: "textarea" },
      { key: "years_experience", label: "Years of Experience", type: "number" },
      { key: "areas_served", label: "Areas Served (comma separated)", type: "text", list: true },
    ],
  },
  agency: {
    title: "Register My Agency",
    instant: false,
    fields: [
      { key: "company_name", label: "Company Name", type: "text", required: true },
      { key: "registration_number", label: "Registration Number", type: "text" },
      { key: "office_address", label: "Office Address", type: "text" },
      { key: "contact_phone", label: "Contact Phone", type: "text" },
    ],
  },
  developer: {
    title: "Register as a Developer",
    instant: false,
    fields: [
      { key: "company_name", label: "Company Name", type: "text", required: true },
      { key: "contact_phone", label: "Contact Phone", type: "text" },
    ],
  },
  property_manager: {
    title: "Become a Property Manager",
    instant: false,
    fields: [
      { key: "company_name", label: "Company Name", type: "text", required: true },
      { key: "services", label: "Services Offered (comma separated)", type: "text", list: true },
      { key: "areas_managed", label: "Areas Managed (comma separated)", type: "text", list: true },
    ],
  },
};

export default function ApplyPage() {
  const router = useRouter();
  const params = useParams();
  const role = params?.role;
  const supabase = createClient();
  const config = CONFIGS[role];

  const [user, setUser] = useState(null);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.push("/login");
        return;
      }
      setUser(data.user);
    });
  }, []);

  if (!config) {
    return (
      <div style={{ padding: 48, textAlign: "center", color: T.gray2 }}>
        Unknown role. <a href="/dashboard" style={{ color: T.navy }}>Back to dashboard</a>
      </div>
    );
  }

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    if (!user) return;
    setError(null);
    setLoading(true);
    try {
      if (config.instant) {
        await activateOwnerRole(user.id);
        setLoading(false);
        router.push("/dashboard/owner");
        return;
      }

      const payload = {};
      for (const f of config.fields) {
        if (f.list) {
          payload[f.key] = (form[f.key] || "")
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
        } else if (f.type === "number") {
          payload[f.key] = form[f.key] ? Number(form[f.key]) : null;
        } else {
          payload[f.key] = form[f.key] || null;
        }
      }
      await submitRoleApplication(role, user.id, payload);
      setLoading(false);
      setDone(true);
    } catch (e) {
      setLoading(false);
      setError(e.message || "Something went wrong. Please try again.");
    }
  };

  if (done) {
    return (
      <div style={{ background: T.bg, minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div style={{ background: "#fff", borderRadius: 14, padding: 40, maxWidth: 440, width: "100%", textAlign: "center", boxShadow: T.shadow, border: `1px solid ${T.border}` }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#FDF3E0", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <Clock size={26} color={T.gold} />
          </div>
          <h2 style={{ color: T.navy, fontWeight: 900, fontSize: 20, margin: "0 0 8px" }}>Pending Verification</h2>
          <p style={{ color: T.gray2, fontSize: 14, lineHeight: 1.6, margin: "0 0 24px" }}>
            Your application has been submitted. Our team will review it and you'll be notified once it's approved.
          </p>
          <button
            onClick={() => router.push("/dashboard")}
            style={{ background: T.navy, color: "#fff", border: "none", borderRadius: 8, padding: "10px 22px", fontWeight: 700, fontSize: 14, cursor: "pointer" }}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const inputStyle = { width: "100%", border: `1.5px solid ${T.border}`, borderRadius: 8, padding: "10px 14px", fontSize: 14, marginBottom: 14, boxSizing: "border-box", fontFamily: "inherit" };

  return (
    <div style={{ background: T.bg, minHeight: "80vh", padding: "48px 24px" }}>
      <div style={{ maxWidth: 480, margin: "0 auto", background: "#fff", borderRadius: 14, padding: 36, boxShadow: T.shadow, border: `1px solid ${T.border}` }}>
        <h1 style={{ color: T.navy, fontWeight: 900, fontSize: 22, margin: "0 0 6px" }}>{config.title}</h1>

        {config.instant ? (
          <>
            <p style={{ color: T.gray2, fontSize: 14, lineHeight: 1.6, margin: "0 0 24px" }}>
              No agent licence required. You'll be able to list your property and respond to enquiries right away.
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: T.green, fontSize: 13, fontWeight: 700, marginBottom: 24 }}>
              <CheckCircle2 size={16} /> Instant activation — no approval needed
            </div>
          </>
        ) : (
          <p style={{ color: T.gray2, fontSize: 14, lineHeight: 1.6, margin: "0 0 24px" }}>
            This role requires admin verification. Fill in the details below and we'll review your application.
          </p>
        )}

        {!config.instant &&
          config.fields.map((f) => (
            <div key={f.key}>
              <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: T.gray1, marginBottom: 5 }}>
                {f.label}{f.required && " *"}
              </label>
              {f.type === "textarea" ? (
                <textarea
                  value={form[f.key] || ""}
                  onChange={(e) => set(f.key, e.target.value)}
                  rows={3}
                  style={{ ...inputStyle, resize: "vertical" }}
                />
              ) : (
                <input
                  type={f.type === "number" ? "number" : "text"}
                  value={form[f.key] || ""}
                  onChange={(e) => set(f.key, e.target.value)}
                  style={inputStyle}
                />
              )}
            </div>
          ))}

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
            marginTop: 4,
          }}
        >
          {loading ? "Please wait…" : config.instant ? "Activate — Start Listing" : "Submit Application"}
        </button>
      </div>
    </div>
  );
}