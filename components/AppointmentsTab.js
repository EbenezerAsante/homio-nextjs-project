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
    <table className="admin-table">
      <thead>
        <tr>
          <th>Listing</th>
          <th>Requested Time</th>
          <th>Note</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {appointments.map((a) => {
          const meta = STATUS_META[a.status] || STATUS_META.pending;
          const busy = busyId === a.id;
          return (
            <tr key={a.id}>
              <td>{a.listings?.title || "—"}</td>
              <td style={{ fontSize: 13 }}>{new Date(a.requested_time).toLocaleString()}</td>
              <td style={{ maxWidth: 200, fontSize: 13, color: T.gray2 }}>{a.note || "—"}</td>
              <td>
                <span style={{ fontSize: 11, fontWeight: 700, color: meta.color, background: meta.bg, padding: "3px 9px", borderRadius: 999 }}>
                  {meta.label}
                </span>
              </td>
              <td>
                {a.status === "pending" ? (
                  <div style={{ display: "flex", gap: 6 }}>
                    <button
                      onClick={() => handleStatus(a.id, "confirmed")}
                      disabled={busy}
                      title="Confirm"
                      style={{ background: T.greenL, color: T.green, border: "none", borderRadius: 6, padding: "5px 8px", cursor: busy ? "default" : "pointer" }}
                    >
                      <CheckCircle2 size={14} />
                    </button>
                    <button
                      onClick={() => handleStatus(a.id, "declined")}
                      disabled={busy}
                      title="Decline"
                      style={{ background: T.redL, color: T.red, border: "none", borderRadius: 6, padding: "5px 8px", cursor: busy ? "default" : "pointer" }}
                    >
                      <XCircle size={14} />
                    </button>
                  </div>
                ) : a.status === "confirmed" ? (
                  <button
                    onClick={() => handleStatus(a.id, "completed")}
                    disabled={busy}
                    title="Mark completed"
                    style={{ background: T.bg, color: T.gray1, border: "none", borderRadius: 6, padding: "5px 8px", cursor: busy ? "default" : "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 12 }}
                  >
                    <Clock3 size={13} /> Mark done
                  </button>
                ) : (
                  <span style={{ color: T.gray2, fontSize: 12 }}>—</span>
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}