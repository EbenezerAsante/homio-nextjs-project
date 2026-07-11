"use client";

import { useEffect, useState } from "react";
import { Search, ShieldCheck } from "lucide-react";
import { T } from "@/lib/constants";
import { fetchAllUsers } from "@/lib/platform-admin-queries";

const ROLE_COLORS = {
  Admin: { bg: "#EDE9FE", color: "#5B21B6" },
  Owner: { bg: "#DBEAFE", color: "#1E40AF" },
  Agent: { bg: "#DCFCE7", color: "#166534" },
  Agency: { bg: "#DCFCE7", color: "#166534" },
  Developer: { bg: "#DCFCE7", color: "#166534" },
  "Property Manager": { bg: "#DCFCE7", color: "#166534" },
  Buyer: { bg: "#F1F5F9", color: "#475569" },
};

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
  }, []);

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
        <div style={{ background: "#fff", border: `1px solid ${T.border}`, borderRadius: 12, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: T.bg }}>
                <th style={thStyle}>Name</th>
                <th style={thStyle}>Email</th>
                <th style={thStyle}>Phone</th>
                <th style={thStyle}>Roles</th>
                <th style={thStyle}>Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} style={{ borderTop: `1px solid ${T.border}` }}>
                  <td style={tdStyle}>{u.full_name || "—"}</td>
                  <td style={tdStyle}>{u.email || "—"}</td>
                  <td style={tdStyle}>{u.phone || "—"}</td>
                  <td style={{ ...tdStyle, maxWidth: 260 }}>
                    {u.roles.map((r, i) => <RoleBadge key={i} role={r} />)}
                  </td>
                  <td style={tdStyle}>
                    {u.created_at ? new Date(u.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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

const thStyle = {
  textAlign: "left",
  padding: "10px 14px",
  fontSize: 11,
  fontWeight: 700,
  color: T.gray2,
  textTransform: "uppercase",
  letterSpacing: 0.5,
};

const tdStyle = {
  padding: "12px 14px",
  fontSize: 13,
  color: T.gray1,
};