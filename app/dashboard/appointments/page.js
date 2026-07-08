"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-client";
import { fetchBuyerAppointments, cancelAppointment } from "@/lib/appointments-queries";
import { T } from "@/lib/constants";
import { Calendar, X } from "lucide-react";

const STATUS_META = {
  pending: { color: T.gold, bg: "#FDF3E0", label: "Pending" },
  confirmed: { color: T.green, bg: T.greenL, label: "Confirmed" },
  declined: { color: T.red, bg: T.redL, label: "Declined" },
  completed: { color: T.gray2, bg: T.bg, label: "Completed" },
  cancelled: { color: T.gray2, bg: T.bg, label: "Cancelled" },
};

export default function BuyerAppointmentsPage() {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  const load = async (userId) => {
    const data = await fetchBuyerAppointments(userId);
    setAppointments(data);
    setLoading(false);
  };

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.push("/login");
        return;
      }
      setUser(data.user);
      load(data.user.id);
    });
  }, []);

  const handleCancel = async (id) => {
    if (!confirm("Cancel this viewing request?")) return;
    setBusyId(id);
    await cancelAppointment(id);
    await load(user.id);
    setBusyId(null);
  };

  if (loading) {
    return <div style={{ padding: 60, textAlign: "center", color: T.gray2 }}>Loading appointments…</div>;
  }

  return (
    <div style={{ background: T.bg, minHeight: "90vh", padding: "40px 24px" }}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <p style={{ color: T.gold, fontWeight: 700, fontSize: 11, letterSpacing: 2, textTransform: "uppercase", margin: "0 0 6px" }}>
          Dashboard
        </p>
        <h1 style={{ color: T.navy, fontWeight: 900, fontSize: 26, margin: "0 0 24px" }}>My Appointments</h1>

        {appointments.length === 0 ? (
          <div style={{ background: "#fff", border: `1px dashed ${T.border}`, borderRadius: 12, padding: 40, textAlign: "center", color: T.gray2 }}>
            <Calendar size={28} color={T.gray2} style={{ marginBottom: 10 }} />
            <div>No viewing requests yet. Book one from any property page.</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {appointments.map((a) => {
              const meta = STATUS_META[a.status] || STATUS_META.pending;
              return (
                <div key={a.id} style={{ background: "#fff", border: `1px solid ${T.border}`, borderRadius: 10, padding: 18, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 15, color: T.navy }}>{a.listings?.title || "Listing"}</div>
                    <div style={{ fontSize: 12.5, color: T.gray2, marginTop: 2 }}>
                      {new Date(a.requested_time).toLocaleString()} · {a.listings?.city}{a.listings?.region ? `, ${a.listings.region}` : ""}
                    </div>
                    {a.note && <div style={{ fontSize: 12.5, color: T.gray2, marginTop: 4 }}>"{a.note}"</div>}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: meta.color, background: meta.bg, padding: "3px 9px", borderRadius: 999, whiteSpace: "nowrap" }}>
                      {meta.label}
                    </span>
                    {a.status === "pending" && (
                      <button
                        onClick={() => handleCancel(a.id)}
                        disabled={busyId === a.id}
                        style={{ background: "none", border: "none", cursor: "pointer", color: T.gray2, padding: 4 }}
                        title="Cancel request"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}