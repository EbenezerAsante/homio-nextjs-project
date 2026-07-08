"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-client";
import { fetchBuyerConversations } from "@/lib/messaging-queries";
import MessageThread from "@/components/MessageThread";
import { T } from "@/lib/constants";
import { MessageCircle } from "lucide-react";

export default function BuyerMessagesPage() {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) {
        router.push("/login");
        return;
      }
      setUser(data.user);
      const convos = await fetchBuyerConversations(data.user.id);
      setConversations(convos);
      if (convos.length > 0) setSelected(convos[0]);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div style={{ padding: 60, textAlign: "center", color: T.gray2 }}>Loading messages…</div>;
  }

  return (
    <div style={{ background: T.bg, minHeight: "90vh", padding: "40px 24px" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <p style={{ color: T.gold, fontWeight: 700, fontSize: 11, letterSpacing: 2, textTransform: "uppercase", margin: "0 0 6px" }}>
          Dashboard
        </p>
        <h1 style={{ color: T.navy, fontWeight: 900, fontSize: 26, margin: "0 0 24px" }}>Messages</h1>

        {conversations.length === 0 ? (
          <div style={{ background: "#fff", border: `1px dashed ${T.border}`, borderRadius: 12, padding: 40, textAlign: "center", color: T.gray2 }}>
            <MessageCircle size={28} color={T.gray2} style={{ marginBottom: 10 }} />
            <div>No conversations yet. Enquire about a property to start one.</div>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 20 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {conversations.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelected(c)}
                  style={{
                    textAlign: "left",
                    background: selected?.id === c.id ? "#fff" : "transparent",
                    border: `1px solid ${selected?.id === c.id ? T.navy : T.border}`,
                    borderRadius: 10,
                    padding: "10px 12px",
                    cursor: "pointer",
                  }}
                >
                  <div style={{ fontSize: 13, fontWeight: 700, color: T.navy }}>{c.listings?.title || "Listing"}</div>
                  <div style={{ fontSize: 11.5, color: T.gray2, marginTop: 2 }}>
                    {c.listings?.city}{c.listings?.region ? `, ${c.listings.region}` : ""}
                  </div>
                </button>
              ))}
            </div>

            {selected && <MessageThread enquiry={selected} currentUserId={user.id} currentUserRole="buyer" />}
          </div>
        )}
      </div>
    </div>
  );
}