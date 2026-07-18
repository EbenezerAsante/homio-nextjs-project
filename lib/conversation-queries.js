import { createClient } from "@/lib/supabase-client";

// The core operation every contact action (Enquire, Ask a Question,
// Request Viewing, Make an Offer) calls: reuse the existing thread for
// this buyer+listing pair if one exists, otherwise create it. Relies on
// the unique(listing_id, buyer_id) constraint on conversations — a race
// between two tabs both creating at once is caught by that constraint
// and resolved by re-fetching rather than erroring.
export async function findOrCreateConversation(listingId, buyerId) {
  const supabase = createClient();

  const { data: existing, error: findErr } = await supabase
    .from("conversations")
    .select("*, listings(id, title, agent_id, city, region, listing_images(url, sort_order))")
    .eq("listing_id", listingId)
    .eq("buyer_id", buyerId)
    .maybeSingle();
  if (findErr) throw findErr;
  if (existing) return existing;

  const { data: listing, error: listingErr } = await supabase
    .from("listings")
    .select("agent_id")
    .eq("id", listingId)
    .single();
  if (listingErr) throw listingErr;

  const { data: created, error: createErr } = await supabase
    .from("conversations")
    .insert({
      listing_id: listingId,
      buyer_id: buyerId,
      agent_id: listing.agent_id,
      last_message_at: new Date().toISOString(),
    })
    .select("*, listings(id, title, agent_id, city, region, listing_images(url, sort_order))")
    .single();

  // Unique-constraint race: another request created it a moment earlier —
  // just fetch the one that now exists instead of failing.
  if (createErr) {
    if (createErr.code === "23505") {
      const { data: retry, error: retryErr } = await supabase
        .from("conversations")
        .select("*, listings(id, title, agent_id, city, region, listing_images(url, sort_order))")
        .eq("listing_id", listingId)
        .eq("buyer_id", buyerId)
        .single();
      if (retryErr) throw retryErr;
      return retry;
    }
    throw createErr;
  }

  return created;
}

// ── Conversation-based messaging (buyer ↔ agent, unified system) ──────
// Deliberately separate from fetchMessages/sendMessage/markThreadRead in
// messaging-queries.js — those remain enquiry_id-based because the admin
// report-reply feature (Platform Admin → Reports) still depends on them.
export async function fetchConversationMessages(conversationId) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });
  if (error) {
    console.error("fetchConversationMessages error:", error.message);
    return [];
  }
  return data ?? [];
}

export async function sendConversationMessage(conversationId, senderId, senderRole, body) {
  const supabase = createClient();
  const { error } = await supabase.from("messages").insert({
    conversation_id: conversationId,
    sender_id: senderId,
    sender_role: senderRole,
    body,
  });
  if (error) throw error;

  await supabase
    .from("conversations")
    .update({ last_message_at: new Date().toISOString() })
    .eq("id", conversationId);

  return true;
}

export async function markConversationRead(conversationId, viewerId) {
  const supabase = createClient();
  await supabase
    .from("messages")
    .update({ read_at: new Date().toISOString() })
    .eq("conversation_id", conversationId)
    .neq("sender_id", viewerId)
    .is("read_at", null);
}

export async function fetchBuyerConversationsV2(buyerId) {
  const supabase = createClient();
  const { data: conversations, error } = await supabase
    .from("conversations")
    .select("*, listings(id, title, price, city, region, listing_images(url, sort_order), agents(full_name))")
    .eq("buyer_id", buyerId)
    .order("last_message_at", { ascending: false, nullsFirst: false });
  if (error) {
    console.error("fetchBuyerConversationsV2 error:", error.message);
    return [];
  }
  return attachLastMessageAndUnread(supabase, conversations, buyerId);
}

export async function fetchAgentConversationsV2(agentId) {
  const supabase = createClient();
  const { data: conversations, error } = await supabase
    .from("conversations")
    .select("*, listings(id, title, price, city, region, listing_images(url, sort_order)), profiles!conversations_buyer_id_fkey(full_name)")
    .eq("agent_id", agentId)
    .order("last_message_at", { ascending: false, nullsFirst: false });
  if (error) {
    console.error("fetchAgentConversationsV2 error:", error.message);
    return [];
  }
  return attachLastMessageAndUnread(supabase, conversations, agentId);
}

// Shared: batch-fetch messages for a set of conversations and attach each
// conversation's last message + unread count — same pattern used for the
// buyer inbox we built earlier, now keyed by conversation_id instead of
// enquiry_id.
async function attachLastMessageAndUnread(supabase, conversations, viewerId) {
  if (!conversations || conversations.length === 0) return [];

  const ids = conversations.map((c) => c.id);
  const { data: allMessages } = await supabase
    .from("messages")
    .select("conversation_id, body, created_at, sender_id, read_at")
    .in("conversation_id", ids)
    .order("created_at", { ascending: true });

  const byConversation = {};
  (allMessages || []).forEach((m) => {
    if (!byConversation[m.conversation_id]) byConversation[m.conversation_id] = [];
    byConversation[m.conversation_id].push(m);
  });

  return conversations.map((c) => {
    const msgs = byConversation[c.id] || [];
    const last = msgs.length ? msgs[msgs.length - 1] : null;
    const unreadCount = msgs.filter((m) => m.sender_id !== viewerId && !m.read_at).length;
    return { ...c, lastMessage: last, unreadCount };
  });
}