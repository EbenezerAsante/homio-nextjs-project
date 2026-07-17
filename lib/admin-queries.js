import { createClient } from "@/lib/supabase-client";

export async function fetchAgentListings(agentId) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .eq("agent_id", agentId)
    .order("created_at", { ascending: false });
  if (error) {
    console.error("fetchAgentListings error:", error.message);
    return [];
  }
  return data ?? [];
}

export async function fetchAgentEnquiries(agentId) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("enquiries")
    .select("*, listings(title)")
    .eq("agent_id", agentId)
    .order("created_at", { ascending: false });
  if (error) {
    console.error("fetchAgentEnquiries error:", error.message);
    return [];
  }
  return data ?? [];
}

export function buildAnalytics(listings = [], enquiries = []) {
  const totalListings = listings.length;
  const activeListings = listings.filter((l) => l.status === "active").length;
  const totalViews = listings.reduce((sum, l) => sum + (l.view_count ?? l.views_count ?? 0), 0);
  const totalEnquiries = enquiries.length;
  const respondedEnquiries = enquiries.filter((e) => e.responded_at).length;
  const pendingEnquiries = totalEnquiries - respondedEnquiries;
  const responseRate = totalEnquiries > 0 ? Math.round((respondedEnquiries / totalEnquiries) * 100) : 0;

  return {
    totalListings,
    activeListings,
    totalViews,
    totalEnquiries,
    respondedEnquiries,
    pendingEnquiries,
    responseRate,
  };
}

export async function createListing(listingData) {
  const supabase = createClient();
  const { data, error } = await supabase.from("listings").insert(listingData).select().single();
  if (error) {
    console.error("createListing error:", error.message);
    throw error;
  }
  return data;
}

export async function updateListing(id, updates) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("listings")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) {
    console.error("updateListing error:", error.message);
    throw error;
  }
  return data;
}

export async function updateListingStatus(id, status) {
  return updateListing(id, { status });
}

export async function deleteListing(id) {
  const supabase = createClient();
  const { error } = await supabase.from("listings").delete().eq("id", id);
  if (error) {
    console.error("deleteListing error:", error.message);
    throw error;
  }
  return true;
}

export async function updateEnquiryStatus(id, status) {
  const supabase = createClient();
  const updates = { status };
  if (status === "responded") updates.responded_at = new Date().toISOString();
  const { data, error } = await supabase.from("enquiries").update(updates).eq("id", id).select().single();
  if (error) {
    console.error("updateEnquiryStatus error:", error.message);
    throw error;
  }
  return data;
}

export async function uploadListingPhotos(agentId, listingId, files) {
  const supabase = createClient();
  const urls = [];

  for (const file of files) {
    const path = `${agentId}/${listingId}/${Date.now()}-${file.name}`;
    const { error: uploadErr } = await supabase.storage
      .from("listing-images")
      .upload(path, file);
    if (uploadErr) throw uploadErr;

    const { data: publicUrlData } = supabase.storage
      .from("listing-images")
      .getPublicUrl(path);

    const publicUrl = publicUrlData.publicUrl;

    const { error: dbErr } = await supabase
      .from("listing_images")
      .insert({ listing_id: listingId, url: publicUrl });
    if (dbErr) throw dbErr;

    urls.push(publicUrl);
  }

  return urls;
}

export async function deleteListingPhoto(url) {
  const supabase = createClient();
  const { error } = await supabase.from("listing_images").delete().eq("url", url);
  if (error) throw error;
  return true;
}

// Save an external video link (e.g. YouTube) — the only supported way
// to attach a video tour, since direct file upload was removed (large
// phone-recorded videos were blowing past the storage bucket's size
// limit and would have eaten the Supabase free-tier storage quota fast).
export async function setListingVideoLink(listingId, url) {
  const supabase = createClient();
  const { error } = await supabase.from("listings").update({ video_url: url }).eq("id", listingId);
  if (error) throw error;
  return true;
}

export async function removeListingVideo(listingId) {
  const supabase = createClient();
  const { error } = await supabase.from("listings").update({ video_url: null }).eq("id", listingId);
  if (error) throw error;
  return true;
}