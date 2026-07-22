"use client";

import { useState } from "react";
import { Flag } from "lucide-react";
import { createClient } from "../lib/supabase-client";
import { T } from "../lib/constants";

const REASONS = [
  "This profile looks fake",
  "Impersonating another agent or agency",
  "Asked for a viewing fee or upfront payment",
  "Inappropriate or unprofessional behavior",
  "Something else",
];

export default function ReportAgentButton({ agentId, agentName }) {
  const supabase = createClient();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState(REASONS[0]);
  const [details, setDetails] = useState("");
  const [reporterName, setReporterName] = useState("");
  const [reporterEmail, setReporterEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState(null);

  const submit = async () => {
    setSubmitting(true);
    setError(null);

    const { data: authData } = await supabase.auth.getUser();

    const { error: err } = await supabase.from("listing_reports").insert({
      reported_user_id: agentId,
      reporter_id: authData?.user?.id || null,
      reason,
      details: details.trim() || null,
      reporter_name: reporterName.trim() || null,
      reporter_email: reporterEmail.trim() || null,
    });

    setSubmitting(false);

    if (err) {
      setError("Couldn't submit your report. Please try again.");
      return;
    }
    setDone(true);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          border: `1.5px solid ${T.border}`, background: "#fff", color: T.gray2,
          borderRadius: 8, padding: "9px 10px", fontSize: 12.5, fontWeight: 700, cursor: "pointer",
        }}
      >
        <Flag size={14} /> Report
      </button>

      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20 }}
        >
          <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: 12, padding: 24, maxWidth: 420, width: "100%" }}>
            {done ? (
              <div style={{ textAlign: "center", padding: "10px 0" }}>
                <p style={{ color: T.navy, fontWeight: 700, fontSize: 15, margin: "0 0 8px" }}>Report submitted</p>
                <p style={{ color: T.gray2, fontSize: 13, margin: "0 0 16px" }}>Thanks — our team will review this.</p>
                <button onClick={() => { setOpen(false); setDone(false); }} style={{ background: T.navy, color: "#fff", border: "none", borderRadius: 8, padding: "9px 20px", fontWeight: 700, cursor: "pointer" }}>
                  Close
                </button>
              </div>
            ) : (
              <>
                <h3 style={{ color: T.navy, fontSize: 16, fontWeight: 800, margin: "0 0 4px" }}>Report {agentName || "this profile"}</h3>
                <p style={{ color: T.gray2, fontSize: 12.5, margin: "0 0 16px" }}>
                  This is for concerns about the person or agency, not a specific listing.
                </p>

                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: T.gray2, marginBottom: 6 }}>Reason</label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  style={{ width: "100%", border: `1.5px solid ${T.border}`, borderRadius: 8, padding: "9px 12px", fontSize: 13.5, marginBottom: 12, boxSizing: "border-box" }}
                >
                  {REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>

                <textarea
                  placeholder="Any details? (optional)"
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  rows={3}
                  style={{ width: "100%", border: `1.5px solid ${T.border}`, borderRadius: 8, padding: "9px 12px", fontSize: 13.5, marginBottom: 12, boxSizing: "border-box", resize: "vertical" }}
                />

                <input
                  placeholder="Your name (optional)"
                  value={reporterName}
                  onChange={(e) => setReporterName(e.target.value)}
                  style={{ width: "100%", border: `1.5px solid ${T.border}`, borderRadius: 8, padding: "9px 12px", fontSize: 13.5, marginBottom: 8, boxSizing: "border-box" }}
                />
                <input
                  placeholder="Your email (optional)"
                  value={reporterEmail}
                  onChange={(e) => setReporterEmail(e.target.value)}
                  style={{ width: "100%", border: `1.5px solid ${T.border}`, borderRadius: 8, padding: "9px 12px", fontSize: 13.5, marginBottom: 14, boxSizing: "border-box" }}
                />

                {error && <div style={{ color: T.red, fontSize: 12.5, marginBottom: 10 }}>{error}</div>}

                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={() => setOpen(false)}
                    style={{ flex: 1, background: "none", border: `1.5px solid ${T.border}`, color: T.gray2, borderRadius: 8, padding: "10px", fontWeight: 700, cursor: "pointer" }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={submit}
                    disabled={submitting}
                    style={{ flex: 1, background: T.red, color: "#fff", border: "none", borderRadius: 8, padding: "10px", fontWeight: 700, cursor: submitting ? "default" : "pointer", opacity: submitting ? 0.6 : 1 }}
                  >
                    {submitting ? "Submitting…" : "Submit Report"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}