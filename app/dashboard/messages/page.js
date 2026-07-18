"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase-client";
import { fetchAllUserConversationsV2 } from "@/lib/conversation-queries";
import ConversationThread from "@/components/ConversationThread";
import { T } from "@/lib/constants";
import { MessageCircle, ChevronLeft } from "lucide-react";

// Short, WhatsApp-style timestamp: time if today, weekday if this week,
// otherwise a short date.
function formatWhen(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  if (sameDay) return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  const daysAgo = Math.floor((now - d) / (1000 * 60 * 60 * 24));
  if (daysAgo < 7) return d.toLocaleDateString([], { weekday: "short" });
  return d.toLocaleDateString([], { day: "numeric", month: "short" });
}

const STATUS_LABEL = {
  active: { label: "Available", color: T.green },
  under_offer: { label: "Under Offer", color: T.gold },
  taken: { label: "Sold", color: T.gray2 },
  rented: { label: "Rented", color: T.gray2 },
  expired: { label: "Expired", color: T.gray2 },
  pending: { label: "Pending Review", color: T.gold },
};

export default function BuyerMessagesPageWrapper() {
  return (
    <Suspense fallback={<div style={{ padding: 60, textAlign: "center", color: T.gray2 }}>Loading messages…</div>}>
      <BuyerMessagesPage />
    </Suspense>
  );
}

function BuyerMessagesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const [user, setUser] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [filter, setFilter] = useState("all"); // all | listings | enquiries
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async (uid) => {
    const convos = await fetchAllUserConversationsV2(uid);
    setConversations(convos);
    return convos;
  };

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) {
        router.push("/login");
        return;
      }
      setUser(data.user);
      const convos = await load(data.user.id);

      // Coming from Enquire / Request Viewing — open that conversation directly.
      const openId = searchParams.get("open");
      if (openId) {
        const match = convos.find((c) => c.id === openId);
        if (match) setSelected(match);
      }

      setLoading(false);
    });
  }, []);

  function openConversation(c) {
    setSelected(c);
    // Optimistically clear the unread badge in the list right away —
    // MessageThread itself marks it read server-side on open.
    setConversations((prev) => prev.map((x) => (x.id === c.id ? { ...x, unreadCount: 0 } : x)));
  }

  function backToList() {
    setSelected(null);
    if (user) load(user.id); // refresh previews/unread counts after reading
  }

  if (loading) {
    return <div style={{ padding: 60, textAlign: "center", color: T.gray2 }}>Loading messages…</div>;
  }

  // ── Thread view ──
  if (selected) {
    const listing = selected.listings;
    const cover = listing?.listing_images?.slice().sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))?.[0]?.url;
    return (
      <div style={{ background: T.bg, minHeight: "90vh" }}>
        <div style={{ maxWidth: 700, margin: "0 auto", padding: "0 0 24px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "16px 20px",
              background: "#fff",
              borderBottom: `1px solid ${T.border}`,
              position: "sticky",
              top: 0,
              zIndex: 5,
            }}
          >
            <button
              onClick={backToList}
              aria-label="Back to messages"
              style={{ background: "none", border: "none", cursor: "pointer", display: "flex", padding: 4, flexShrink: 0 }}
            >
              <ChevronLeft size={22} color={T.navy} />
            </button>
            {cover ? (
              <img src={cover} alt="" style={{ width: 40, height: 40, borderRadius: 8, objectFit: "cover", flexShrink: 0 }} />
            ) : (
              <div style={{ width: 40, height: 40, borderRadius: 8, background: T.bg, flexShrink: 0 }} />
            )}
            <div style={{ minWidth: 0, overflow: "hidden" }}>
              <div style={{ fontWeight: 800, fontSize: 14.5, color: T.navy, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {listing?.title || "Listing"}
              </div>
              <div style={{ fontSize: 12, color: T.gray2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                with {selected.counterpartName}
              </div>
            </div>
          </div>

          <div style={{ padding: "16px 20px 0" }}>
            <ConversationThread conversation={selected} currentUserId={user.id} currentUserRole={selected.myRole} />
          </div>
        </div>
      </div>
    );
  }

  // ── Inbox list view ──
  return (
    <div style={{ background: T.bg, minHeight: "90vh", padding: "40px 20px" }}>
      <div style={{ maxWidth: 700, margin: "0 auto" }}>
        <p style={{ color: T.gold, fontWeight: 700, fontSize: 11, letterSpacing: 2, textTransform: "uppercase", margin: "0 0 6px" }}>
          Dashboard
        </p>
        <h1 style={{ color: T.navy, fontWeight: 900, fontSize: 26, margin: "0 0 16px" }}>Messages</h1>

        <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
          {[
            { id: "all", label: "All" },
            { id: "listings", label: "Listings" },
            { id: "enquiries", label: "Enquiries" },
          ].map((tab) => {
            const count =
              tab.id === "all"
                ? conversations.length
                : conversations.filter((c) => c.myRole === (tab.id === "listings" ? "agent" : "buyer")).length;
            const active = filter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                style={{
                  border: `1.5px solid ${active ? T.navy : T.border}`,
                  background: active ? T.navy : "#fff",
                  color: active ? "#fff" : T.gray1,
                  borderRadius: 999,
                  padding: "7px 14px",
                  fontSize: 12.5,
                  fontWeight: 700,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                {tab.label} {count > 0 && `(${count})`}
              </button>
            );
          })}
        </div>

        {(() => {
          const visible = conversations.filter((c) => {
            if (filter === "listings") return c.myRole === "agent";
            if (filter === "enquiries") return c.myRole === "buyer";
            return true;
          });
          return visible.length === 0 ? (
          <div style={{ background: "#fff", border: `1px dashed ${T.border}`, borderRadius: 12, padding: 40, textAlign: "center", color: T.gray2 }}>
            <MessageCircle size={28} color={T.gray2} style={{ marginBottom: 10 }} />
            <div>No conversations yet. Message an agent about a property to start one.</div>
          </div>
        ) : (
          <div style={{ background: "#fff", borderRadius: 12, border: `1px solid ${T.border}`, overflow: "hidden" }}>
            {visible.map((c, i) => {
              const listing = c.listings;
              const cover = listing?.listing_images?.slice().sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))?.[0]?.url;
              const unread = c.unreadCount > 0;
              const isListing = c.myRole === "agent";
              const statusMeta = STATUS_LABEL[listing?.status] || null;
              return (
                <button
                  key={c.id}
                  onClick={() => openConversation(c)}
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "14px 16px",
                    background: "none",
                    border: "none",
                    borderTop: i === 0 ? "none" : `1px solid ${T.border}`,
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  {cover ? (
                    <img src={cover} alt="" style={{ width: 54, height: 54, borderRadius: 10, objectFit: "cover", flexShrink: 0 }} />
                  ) : (
                    <div style={{ width: 54, height: 54, borderRadius: 10, background: T.bg, flexShrink: 0 }} />
                  )}

                  <div style={{ minWidth: 0, flex: 1, overflow: "hidden" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4, flexWrap: "wrap" }}>
                      <span
                        style={{
                          fontSize: 9.5,
                          fontWeight: 800,
                          letterSpacing: 0.4,
                          textTransform: "uppercase",
                          color: isListing ? T.navy : T.gold,
                          background: isListing ? "#E8EEF7" : "#FBF0DC",
                          padding: "2px 7px",
                          borderRadius: 4,
                          flexShrink: 0,
                        }}
                      >
                        {isListing ? "My Listing" : "Enquiry"}
                      </span>
                      {statusMeta && (
                        <span
                          style={{
                            fontSize: 9.5,
                            fontWeight: 700,
                            letterSpacing: 0.3,
                            textTransform: "uppercase",
                            color: statusMeta.color,
                            flexShrink: 0,
                          }}
                        >
                          {statusMeta.label}
                        </span>
                      )}
                    </div>

                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: 13.5,
                        color: T.navy,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      🏡 {listing?.title || "Listing"}
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8, marginTop: 3 }}>
                      <div
                        style={{
                          fontWeight: unread ? 800 : 700,
                          fontSize: 14,
                          color: T.gray1,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          minWidth: 0,
                        }}
                      >
                        {c.counterpartName}
                      </div>
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        color: unread ? T.gray1 : T.gray2,
                        fontWeight: unread ? 700 : 400,
                        marginTop: 1,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {c.lastMessage?.body || "No messages yet"}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                      {unread && (
                        <span
                          style={{
                            fontSize: 10.5,
                            fontWeight: 800,
                            color: "#fff",
                            background: T.gold,
                            borderRadius: 999,
                            padding: "2px 8px",
                          }}
                        >
                          {c.unreadCount} New
                        </span>
                      )}
                      <span style={{ fontSize: 11, color: T.gray2, fontWeight: 500 }}>
                        {formatWhen(c.lastMessage?.created_at || c.created_at)}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
          );
        })()}
      </div>
    </div>
  );
}