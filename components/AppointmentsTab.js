"use client";

import { useState } from "react";
import { updateAppointmentStatus } from "@/lib/appointments-queries";
import { T } from "@/lib/constants";
import { CheckCircle2, XCircle, Clock3 } from "lucide-react";

const STATUS_META = {
  pending: { color: T.gold, bg: "#FDF3E0", label: "Pending" },
  confirmed: { color: T.green, bg: T.greenL, label: "Confirmed" },
  declined: { color: T.red, bg: T.redL, label: "Declined" },
  completed: { color: T.gray2, bg: T.bg, label: "Completed" },
  cancelled: { color: T.gray2, bg: T.bg, label: "Cancelled" },
};

export default function AppointmentsTab({ appointments, onChange }) {
  const [busyId, setBusyId] = useState(null);

  const handleStatus = async (id, status) => {
    setBusyId(id);
    await updateAppointmentStatus(id, status);
    await onChange();
    setBusyId(null);
  };

  if (!appointments || appointments.length === 0) {
    return (
      <div style={{ background: "#fff", border: `1px dashed ${T.border}`, borderRadius: 12, padding: 40, textAlign: "center", color: T.gray2 }}>
        No viewing requests yet.
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {appointments.map((a) => {
        const meta = STATUS_META[a.status] || STATUS_META.pending;
        const busy = busyId === a.id;
        const cover = a.listings?.listing_images?.slice().sort((x, y) => (x.sort_order ?? 0) - (y.sort_order ?? 0))?.[0]?.url;
        return (
          <div
            key={a.id}
            style={{
              background: "#fff",
              border: `1px solid ${T.border}`,
              borderRadius: 10,
              padding: 14,
              boxSizing: "border-box",
              width: "100%",
              minWidth: 0,
              display: "flex",
              gap: 12,
            }}
          >
            {cover ? (
              <img src={cover} alt="" style={{ width: 56, height: 56, borderRadius: 8, objectFit: "cover", flexShrink: 0 }} />
            ) : (
              <div style={{ width: 56, height: 56, borderRadius: 8, background: T.bg, flexShrink: 0 }} />
            )}
            <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
              <div style={{ fontWeight: 700, fontSize: 14.5, color: T.navy, minWidth: 0, overflowWrap: "break-word" }}>
                {a.listings?.title || "—"}
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: meta.color, background: meta.bg, padding: "3px 9px", borderRadius: 999, flexShrink: 0 }}>
                {meta.label}
              </span>
            </div>

            <div style={{ fontSize: 12.5, color: T.gray2, marginTop: 4 }}>
              {new Date(a.requested_time).toLocaleString()}
            </div>

            {a.note && (
              <div style={{ fontSize: 13, color: T.gray1, marginTop: 8, background: T.bg, borderRadius: 6, padding: "8px 10px", overflowWrap: "break-word" }}>
                {a.note}
              </div>
            )}

            {a.status === "pending" ? (
              <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                <button
                  onClick={() => handleStatus(a.id, "confirmed")}
                  disabled={busy}
                  style={{
                    display: "flex", alignItems: "center", gap: 6, flex: 1, justifyContent: "center",
                    background: T.greenL, color: T.green, border: "none", borderRadius: 8, padding: "9px 10px",
                    cursor: busy ? "default" : "pointer", fontSize: 13, fontWeight: 700,
                  }}
                >
                  <CheckCircle2 size={15} /> Confirm
                </button>
                <button
                  onClick={() => handleStatus(a.id, "declined")}
                  disabled={busy}
                  style={{
                    display: "flex", alignItems: "center", gap: 6, flex: 1, justifyContent: "center",
                    background: T.redL, color: T.red, border: "none", borderRadius: 8, padding: "9px 10px",
                    cursor: busy ? "default" : "pointer", fontSize: 13, fontWeight: 700,
                  }}
                >
                  <XCircle size={15} /> Decline
                </button>
              </div>
            ) : a.status === "confirmed" ? (
              <button
                onClick={() => handleStatus(a.id, "completed")}
                disabled={busy}
                style={{
                  display: "flex", alignItems: "center", gap: 6, marginTop: 12,
                  background: T.bg, color: T.gray1, border: "none", borderRadius: 8, padding: "9px 12px",
                  cursor: busy ? "default" : "pointer", fontSize: 13, fontWeight: 600,
                }}
              >
                <Clock3 size={14} /> Mark done
              </button>
            ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}