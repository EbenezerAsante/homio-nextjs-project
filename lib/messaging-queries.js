import { createClient } from "@/lib/supabase-client";

// Fetch all enquiries (conversations) started by the logged-in buyer,
// with listing info and the most recent message preview.
export async function fetchBuyerConversations(buyerId) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("enquiries")
    .select("*, listings(id, title, price, city, region)")
    .eq("buyer_id", buyerId)
    .order("created_at", { ascending: false });
  if (error) {
    console.error("fetchBuyerConversations error:", error.message);
    return [];
  }
  return data ?? [];
}

// Fetch every message in a thread, oldest first
export async function fetchMessages(enquiryId) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("enquiry_id", enquiryId)
    .order("created_at", { ascending: true });
  if (error) {
    console.error("fetchMessages error:", error.message);
    return [];
  }
  return data ?? [];
}

// Send a message in a thread. senderRole is "buyer" or "agent".
export async function sendMessage(enquiryId, senderId, senderRole, body) {
  const supabase = createClient();
  const { error } = await supabase.from("messages").insert({
    enquiry_id: enquiryId,
    sender_id: senderId,
    sender_role: senderRole,
    body,
  });
  if (error) throw error;
  return true;
}