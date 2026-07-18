import { createClient } from "@/lib/supabase-client";

// Buyer: request a viewing
export async function requestAppointment(listingId, buyerId, agentId, requestedTime, note, conversationId = null) {
  const supabase = createClient();
  const { error } = await supabase.from("appointments").insert({
    listing_id: listingId,
    buyer_id: buyerId,
    agent_id: agentId,
    requested_time: requestedTime,
    note: note || null,
    conversation_id: conversationId,
  });
  if (error) throw error;
  return true;
}

// Buyer: fetch their own appointment requests
export async function fetchBuyerAppointments(buyerId) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("appointments")
    .select("*, listings(id, title, city, region)")
    .eq("buyer_id", buyerId)
    .order("requested_time", { ascending: true });
  if (error) {
    console.error("fetchBuyerAppointments error:", error.message);
    return [];
  }
  return data ?? [];
}

// Agent: fetch appointment requests for their listings
export async function fetchAgentAppointments(agentId) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("appointments")
    .select("*, listings(id, title, city, region, listing_images(url, sort_order))")
    .eq("agent_id", agentId)
    .order("requested_time", { ascending: true });
  if (error) {
    console.error("fetchAgentAppointments error:", error.message);
    return [];
  }
  return data ?? [];
}

// Agent: update an appointment's status (confirmed/declined/completed)
export async function updateAppointmentStatus(id, status) {
  const supabase = createClient();
  const { error } = await supabase.from("appointments").update({ status }).eq("id", id);
  if (error) throw error;
  return true;
}

// Buyer: cancel their own appointment request
export async function cancelAppointment(id) {
  const supabase = createClient();
  const { error } = await supabase.from("appointments").update({ status: "cancelled" }).eq("id", id);
  if (error) throw error;
  return true;
}