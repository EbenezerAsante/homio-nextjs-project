"use client";

import { useEffect, useState } from "react";
import { Search, ShieldCheck, Ban, CheckCircle } from "lucide-react";
import { T } from "@/lib/constants";
import { fetchAllUsers } from "@/lib/platform-admin-queries";
import { createClient } from "@/lib/supabase-client";

const ROLE_COLORS = {
  Admin: { bg: "#EDE9FE", color: "#5B21B6" },
  Owner: { bg: "#DBEAFE", color: "#1E40AF" },
  Agent: { bg: "#DCFCE7", color: "#166534" },
  Agency: { bg: "#DCFCE7", color: "#166534" },
  Developer: { bg: "#DCFCE7", color: "#166534" },
  "Property Manager": { bg: "#DCFCE7", color: "#166534" },
  Buyer: { bg: "#F1F5F9", color: "#475569" },
};

const AVATAR_COLORS = ["#1B3A6B", "#C8961E", "#16A34A", "#7C3AED", "#DC2626", "#0891B2", "#9333EA", "#EA580C"];
function avatarColor(name) {
  const str = name || "?";
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function RoleBadge({ role }) {
  const colors = ROLE_COLORS[role.label] || ROLE_COLORS.Buyer;
  const isPending = role.status === "pending";
  const isRejected = role.status === "rejected";
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        background: isPending ? "#FEF3C7" : isRejected ? "#FEE2E2" : colors.bg,
        color: isPending ? "#92400E" : isRejected ? "#991B1B" : colors.color,
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 700,
        padding: "3px 9px",
        marginRight: 6,
        marginBottom: 4,
      }}
    >
      {role.label === "Admin" && <ShieldCheck size={11} />}
      {role.label}
      {isPending && " (pending)"}
      {isRejected && " (rejected)"}
    </span>
  );
}

export default function UserManagementTab() {
  const [users, setUsers] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const load = async (term = "") => {
    setLoading(true);
    try {
      const data = await fetchAllUsers(term);
      setUsers(data);
    } catch (e) {
      console.error("fetchAllUsers error:", e.message);
      setUsers([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setCurrentUserId(data?.user?.id || null));
  }, []);

  const handleToggleStatus = async (user) => {
    const action = user.account_status === "suspended" ? "activate" : "suspend";
    if (action === "suspend" && !confirm(`Suspend ${user.full_name || user.email}? They won't be able to sign in until reactivated.`)) {
      return;
    }
    setBusyId(user.id);
    try {
      const res = await fetch("/api/admin/toggle-user-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, action }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to update user status");
      await load(search);
    } catch (e) {
      alert(e.message);
    }
    setBusyId(null);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    load(search.trim());
  };

  return (
    <div>
      <form onSubmit={handleSearch} style={{ display: "flex", gap: 8, marginBottom: 20, maxWidth: 420 }}>
        <div style={{ position: "relative", flex: 1 }}>
          <Search size={15} style={{ position: "absolute", left: 12, top: 11, color: T.gray3 }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email…"
            style={{
              width: "100%",
              border: `1.5px solid ${T.border}`,
              borderRadius: 8,
              padding: "9px 12px 9px 34px",
              fontSize: 13,
              boxSizing: "border-box",
            }}
          />
        </div>
        <button
          type="submit"
          style={{ background: T.navy, color: "#fff", border: "none", borderRadius: 8, padding: "9px 18px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}
        >
          Search
        </button>
        {search && (
          <button
            type="button"
            onClick={() => { setSearch(""); load(""); }}
            style={{ background: "none", border: `1.5px solid ${T.border}`, color: T.gray2, borderRadius: 8, padding: "9px 14px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}
          >
            Clear
          </button>
        )}
      </form>

      {loading ? (
        <div style={{ color: T.gray2, padding: 40, textAlign: "center" }}>Loading users…</div>
      ) : !users || users.length === 0 ? (
        <div style={{ background: "#fff", border: `1px dashed ${T.border}`, borderRadius: 12, padding: 40, textAlign: "center", color: T.gray2 }}>
          No users found.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {users.map((u) => {
            const displayName = u.full_name || u.email || "Unnamed user";
            const isYou = u.id === currentUserId;
            const suspended = u.account_status === "suspended";
            return (
              <div
                key={u.id}
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
                <div
                  style={{
                    width: 44, height: 44, borderRadius: "50%", flexShrink: 0,
                    background: avatarColor(displayName), color: "#fff",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontWeight: 800, fontSize: 16,
                  }}
                >
                  {displayName.charAt(0).toUpperCase()}
                </div>

                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 14.5, color: T.navy, overflowWrap: "break-word" }}>
                        {u.full_name || "—"} {isYou && <span style={{ fontSize: 11.5, color: T.gray3, fontWeight: 500 }}>(you)</span>}
                      </div>
                      <div style={{ fontSize: 12.5, color: T.gray2, marginTop: 1, overflowWrap: "break-word" }}>
                        {u.email || "—"}{u.phone ? ` • ${u.phone}` : ""}
                      </div>
                    </div>
                    <span
                      style={{
                        flexShrink: 0,
                        background: suspended ? "#FEE2E2" : "#DCFCE7",
                        color: suspended ? "#991B1B" : "#166534",
                        borderRadius: 999,
                        fontSize: 11,
                        fontWeight: 700,
                        padding: "3px 9px",
                      }}
                    >
                      {suspended ? "Suspended" : "Active"}
                    </span>
                  </div>

                  <div style={{ marginTop: 8 }}>
                    {u.roles.map((r, i) => <RoleBadge key={i} role={r} />)}
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, marginTop: 10, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 11.5, color: T.gray3 }}>
                      Joined {u.created_at ? new Date(u.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                    </span>
                    {!isYou && (
                      <button
                        onClick={() => handleToggleStatus(u)}
                        disabled={busyId === u.id}
                        style={{
                          display: "flex", alignItems: "center", gap: 5,
                          background: "none",
                          border: `1.5px solid ${suspended ? T.green : T.red}`,
                          color: suspended ? T.green : T.red,
                          borderRadius: 6,
                          padding: "5px 10px",
                          fontSize: 11.5,
                          fontWeight: 700,
                          cursor: busyId === u.id ? "default" : "pointer",
                          opacity: busyId === u.id ? 0.6 : 1,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {suspended ? <CheckCircle size={12} /> : <Ban size={12} />}
                        {suspended ? "Activate" : "Suspend"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {users && users.length > 0 && (
        <p style={{ fontSize: 12, color: T.gray3, marginTop: 10 }}>
          Showing {users.length} user{users.length === 1 ? "" : "s"}{users.length === 200 ? " (limit reached — refine your search)" : ""}.
        </p>
      )}
    </div>
  );
}