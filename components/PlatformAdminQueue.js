"use client";

import { useEffect, useState } from "react";
import { T } from "@/lib/constants";
import { APPROVAL_ROLES, fetchApplications, fetchPendingCounts, approveApplication, rejectApplication, revokeApplication, fetchContactMessages } from "@/lib/platform-admin-queries";
import { CheckCircle2, XCircle, Clock, Briefcase, Building2, HardHat, KeyRound, Mail, ClipboardList } from "lucide-react";

const ROLE_META = {
  agent: { label: "Agents", icon: Briefcase },
  agency: { label: "Agencies", icon: Building2 },
  developer: { label: "Developers", icon: HardHat },
  property_manager: { label: "Property Managers", icon: KeyRound },
};

const FIELD_LABELS = {
  company: "Company",
  bio: "Bio",
  years_experience: "Years of Experience",
  areas_served: "Areas Served",
  company_name: "Company Name",
  registration_number: "Registration Number",
  office_address: "Office Address",
  contact_phone: "Contact Phone",
  registration_docs_url: "Registration Docs",
  services: "Services",
  areas_managed: "Areas Managed",
};

function StatusBadge({ status }) {
  const map = {
    pending: { color: T.gold, bg: "#FDF3E0", label: "Pending" },
    approved: { color: T.green, bg: T.greenL, label: "Approved" },
    rejected: { color: T.red, bg: T.redL, label: "Rejected" },
  };
  const s = map[status] || map.pending;
  return (
    <span style={{ fontSize: 11, fontWeight: 700, color: s.color, background: s.bg, padding: "3px 9px", borderRadius: 999 }}>
      {s.label}
    </span>
  );
}

function ApplicationCard({ app, role, onApprove, onReject, onRevoke, busy }) {
  const relevantFields = Object.keys(FIELD_LABELS).filter((k) => app[k] !== undefined && app[k] !== null && app[k] !== "");

  return (
    <div style={{ background: "#fff", border: `1px solid ${T.border}`, borderRadius: 12, padding: 20, boxShadow: T.shadow }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 16, color: T.navy }}>{app.profiles?.full_name || "Unnamed applicant"}</div>
          <div style={{ fontSize: 13, color: T.gray2 }}>{app.profiles?.email} {app.profiles?.phone ? `· ${app.profiles.phone}` : ""}</div>
        </div>
        <StatusBadge status={app.status} />
      </div>

      {relevantFields.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: 10, marginBottom: 16, fontSize: 13 }}>
          {relevantFields.map((k) => (
            <div key={k}>
              <div style={{ color: T.gray2, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 2 }}>
                {FIELD_LABELS[k]}
              </div>
              <div style={{ color: T.gray1 }}>{Array.isArray(app[k]) ? app[k].join(", ") : String(app[k])}</div>
            </div>
          ))}
        </div>
      )}

      <div style={{ fontSize: 12, color: T.gray2, marginBottom: 14 }}>
        Submitted {new Date(app.submitted_at).toLocaleDateString()}
        {app.reviewed_at && ` · Reviewed ${new Date(app.reviewed_at).toLocaleDateString()}`}
      </div>

      {app.status === "pending" && (
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={() => onApprove(role, app.id)}
            disabled={busy}
            style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: T.green, color: "#fff", border: "none", borderRadius: 8, padding: "9px 0", fontWeight: 700, fontSize: 13, cursor: busy ? "default" : "pointer", opacity: busy ? 0.6 : 1 }}
          >
            <CheckCircle2 size={15} /> Approve
          </button>
          <button
            onClick={() => onReject(role, app.id)}
            disabled={busy}
            style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: "#fff", color: T.red, border: `1.5px solid ${T.red}`, borderRadius: 8, padding: "9px 0", fontWeight: 700, fontSize: 13, cursor: busy ? "default" : "pointer", opacity: busy ? 0.6 : 1 }}
          >
            <XCircle size={15} /> Reject
          </button>
        </div>
      )}

      {app.status === "approved" && (
        <button
          onClick={() => onRevoke(role, app.id)}
          disabled={busy}
          style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: "#fff", color: T.red, border: `1.5px solid ${T.red}`, borderRadius: 8, padding: "9px 0", fontWeight: 700, fontSize: 13, cursor: busy ? "default" : "pointer", opacity: busy ? 0.6 : 1 }}
        >
          <XCircle size={15} /> Revoke Access
        </button>
      )}
    </div>
  );
}

export default function PlatformAdminQueue({ adminName }) {
  const [activeView, setActiveView] = useState("applications"); // applications | contact
  const [activeRole, setActiveRole] = useState("agent");
  const [apps, setApps] = useState([]);
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [filter, setFilter] = useState("pending"); // pending | all
  const [contactMessages, setContactMessages] = useState([]);
  const [contactLoading, setContactLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const [appsData, countsData] = await Promise.all([
      fetchApplications(activeRole, filter === "pending" ? "pending" : null),
      fetchPendingCounts(),
    ]);
    setApps(appsData);
    setCounts(countsData);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [activeRole, filter]);

  useEffect(() => {
    if (activeView !== "contact") return;
    setContactLoading(true);
    fetchContactMessages().then((data) => {
      setContactMessages(data);
      setContactLoading(false);
    });
  }, [activeView]);

  const handleApprove = async (role, userId) => {
    setBusyId(userId);
    try {
      await approveApplication(role, userId);
      await load();
    } catch (e) {
      alert(e.message || "Failed to approve");
    }
    setBusyId(null);
  };

  const handleReject = async (role, userId) => {
    if (!confirm("Reject this application? The applicant will need to re-apply.")) return;
    setBusyId(userId);
    try {
      await rejectApplication(role, userId);
      await load();
    } catch (e) {
      alert(e.message || "Failed to reject");
    }
    setBusyId(null);
  };

  const handleRevoke = async (role, userId) => {
    if (!confirm("Revoke this person's access? They will lose their dashboard access immediately and would need to re-apply.")) return;
    setBusyId(userId);
    try {
      await revokeApplication(role, userId);
      await load();
    } catch (e) {
      alert(e.message || "Failed to revoke");
    }
    setBusyId(null);
  };

  return (
    <div style={{ background: T.bg, minHeight: "90vh", padding: "40px 24px" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <p style={{ color: T.gold, fontWeight: 700, fontSize: 11, letterSpacing: 2, textTransform: "uppercase", margin: "0 0 6px" }}>
          Platform Admin
        </p>
        <h1 style={{ color: T.navy, fontWeight: 900, fontSize: 26, margin: "0 0 20px" }}>
          Platform Administration
        </h1>

        {/* Top-level view switcher */}
        <div style={{ display: "flex", gap: 8, marginBottom: 24, borderBottom: `1px solid ${T.border}` }}>
          <button
            onClick={() => setActiveView("applications")}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              border: "none", background: "none", cursor: "pointer",
              padding: "10px 4px", marginRight: 20, fontSize: 14, fontWeight: 700,
              color: activeView === "applications" ? T.navy : T.gray2,
              borderBottom: activeView === "applications" ? `2px solid ${T.navy}` : "2px solid transparent",
            }}
          >
            <ClipboardList size={15} /> Applications
          </button>
          <button
            onClick={() => setActiveView("contact")}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              border: "none", background: "none", cursor: "pointer",
              padding: "10px 4px", fontSize: 14, fontWeight: 700,
              color: activeView === "contact" ? T.navy : T.gray2,
              borderBottom: activeView === "contact" ? `2px solid ${T.navy}` : "2px solid transparent",
            }}
          >
            <Mail size={15} /> Contact Messages
            {contactMessages.length > 0 && (
              <span style={{ background: T.gold, color: "#fff", borderRadius: 999, fontSize: 10, padding: "1px 6px" }}>
                {contactMessages.length}
              </span>
            )}
          </button>
        </div>

        {activeView === "contact" ? (
          contactLoading ? (
            <div style={{ color: T.gray2, padding: 40, textAlign: "center" }}>Loading messages…</div>
          ) : contactMessages.length === 0 ? (
            <div style={{ background: "#fff", border: `1px dashed ${T.border}`, borderRadius: 12, padding: 40, textAlign: "center", color: T.gray2 }}>
              <Mail size={28} color={T.gray2} style={{ marginBottom: 10 }} />
              <div>No contact messages yet.</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {contactMessages.map((m) => (
                <div key={m.id} style={{ background: "#fff", border: `1px solid ${T.border}`, borderRadius: 10, padding: 18, boxShadow: T.shadow }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 14.5, color: T.navy }}>{m.name}</div>
                      <a href={`mailto:${m.email}`} style={{ fontSize: 12.5, color: T.gray2 }}>{m.email}</a>
                    </div>
                    <div style={{ fontSize: 11.5, color: T.gray2, whiteSpace: "nowrap" }}>
                      {new Date(m.created_at).toLocaleString()}
                    </div>
                  </div>
                  <div style={{ fontSize: 13.5, color: T.gray1, lineHeight: 1.6 }}>{m.message}</div>
                </div>
              ))}
            </div>
          )
        ) : (
        <>
        {/* Role tabs */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 18 }}>
          {APPROVAL_ROLES.map((role) => {
            const meta = ROLE_META[role];
            const Icon = meta.icon;
            const active = activeRole === role;
            return (
              <button
                key={role}
                onClick={() => setActiveRole(role)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  border: `1.5px solid ${active ? T.navy : T.border}`,
                  background: active ? T.navy : "#fff",
                  color: active ? "#fff" : T.gray1,
                  borderRadius: 8,
                  padding: "8px 14px",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                <Icon size={14} /> {meta.label}
                {counts[role] > 0 && (
                  <span style={{ background: active ? "#fff" : T.gold, color: active ? T.navy : "#fff", borderRadius: 999, fontSize: 10, padding: "1px 6px", marginLeft: 2 }}>
                    {counts[role]}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Filter toggle */}
        <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
          {["pending", "all"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                border: "none",
                background: "none",
                color: filter === f ? T.navy : T.gray2,
                fontWeight: 700,
                fontSize: 13,
                cursor: "pointer",
                padding: "4px 0",
                borderBottom: filter === f ? `2px solid ${T.navy}` : "2px solid transparent",
              }}
            >
              {f === "pending" ? "Pending" : "All"}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ color: T.gray2, padding: 40, textAlign: "center" }}>Loading applications…</div>
        ) : apps.length === 0 ? (
          <div style={{ background: "#fff", border: `1px dashed ${T.border}`, borderRadius: 12, padding: 40, textAlign: "center", color: T.gray2 }}>
            <Clock size={28} color={T.gray2} style={{ marginBottom: 10 }} />
            <div>No {filter === "pending" ? "pending" : ""} applications for {ROLE_META[activeRole].label.toLowerCase()}.</div>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))", gap: 16 }}>
            {apps.map((app) => (
              <ApplicationCard
                key={app.id}
                app={app}
                role={activeRole}
                onApprove={handleApprove}
                onReject={handleReject}
                onRevoke={handleRevoke}
                busy={busyId === app.id}
              />
            ))}
          </div>
        )}
        </>
        )}
      </div>
    </div>
  );
}