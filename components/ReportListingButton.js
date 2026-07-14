"use client";

import { useState } from "react";
import { Flag } from "lucide-react";
import { createClient } from "../lib/supabase-client";
import { T } from "../lib/constants";

const REASONS = [
  "This listing looks fake or fraudulent",
  "Duplicate of another listing",
  "Incorrect price or details",
  "Property no longer available",
  "Inappropriate or offensive content",
  "Something else",
];

export default function ReportListingButton({ listingId }) {
  const supabase = createClient();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState(REASONS[0]);
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState(null);

  const submit = async () => {
    setSubmitting(true);
    setError(null);

    const { data: authData } = await supabase.auth.getUser();

    const { error: err } = await supabase.from("listing_reports").insert({
      listing_id: listingId,
      reporter_id: authData?.user?.id || null,
      reason,
      details: details.trim() || null,
    });

    setSubmitting(false);

    if (err) {
      setError("Couldn't submit your report. Please try again.");
      return;
    }
    setDone(true);
  };

  const closeAndReset = () => {
    setOpen(false);
    setTimeout(() => {
      setDone(false);
      setReason(REASONS[0]);
      setDetails("");
      setError(null);
    }, 300);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          display: "flex", alignItems: "center", gap: 5,
          background: "none", border: "none", cursor: "pointer",
          color: T.gray3, fontSize: 12.5, fontWeight: 600, padding: "4px 0",
        }}
      >
        <Flag size={13} /> Report this listing
      </button>

      {open && (
        <div
          onClick={closeAndReset}
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,.5)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 1000, padding: 20,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ background: "#fff", borderRadius: 14, padding: 28, maxWidth: 420, width: "100%" }}
          >
            {done ? (
              <>
                <h3 style={{ color: T.navy, fontSize: 18, fontWeight: 800, margin: "0 0 8px" }}>
                  Report submitted
                </h3>
                <p style={{ color: T.gray2, fontSize: 14, lineHeight: 1.6, margin: "0 0 20px" }}>
                  Thanks for letting us know. Our team will review this listing.
                </p>
                <button
                  onClick={closeAndReset}
                  style={{ width: "100%", background: T.navy, color: "#fff", border: "none", borderRadius: 8, padding: "10px", fontWeight: 700, fontSize: 14, cursor: "pointer" }}
                >
                  Close
                </button>
              </>
            ) : (
              <>
                <h3 style={{ color: T.navy, fontSize: 18, fontWeight: 800, margin: "0 0 4px" }}>
                  Report this listing
                </h3>
                <p style={{ color: T.gray2, fontSize: 13, margin: "0 0 18px" }}>
                  Help us keep Homio trustworthy. Reports are reviewed by our team.
                </p>

                <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: T.gray1, marginBottom: 6 }}>
                  What's wrong with this listing?
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  style={{ width: "100%", border: `1.5px solid ${T.border}`, borderRadius: 8, padding: "9px 12px", fontSize: 14, marginBottom: 14, boxSizing: "border-box" }}
                >
                  {REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>

                <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: T.gray1, marginBottom: 6 }}>
                  Additional details (optional)
                </label>
                <textarea
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  rows={3}
                  style={{ width: "100%", border: `1.5px solid ${T.border}`, borderRadius: 8, padding: "9px 12px", fontSize: 14, marginBottom: 14, boxSizing: "border-box", resize: "vertical", fontFamily: "inherit" }}
                />

                {error && <p style={{ color: T.red, fontSize: 13, marginBottom: 12 }}>{error}</p>}

                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    onClick={closeAndReset}
                    style={{ flex: 1, background: "none", border: `1.5px solid ${T.border}`, color: T.gray2, borderRadius: 8, padding: "10px", fontWeight: 700, fontSize: 14, cursor: "pointer" }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={submit}
                    disabled={submitting}
                    style={{ flex: 1, background: T.red, color: "#fff", border: "none", borderRadius: 8, padding: "10px", fontWeight: 700, fontSize: 14, cursor: submitting ? "default" : "pointer", opacity: submitting ? 0.6 : 1 }}
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