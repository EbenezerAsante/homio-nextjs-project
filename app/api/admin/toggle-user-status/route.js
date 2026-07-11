import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase-server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export async function POST(request) {
  const { userId, action } = await request.json(); // action: "suspend" | "activate"

  if (!userId || !["suspend", "activate"].includes(action)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  // Verify the caller is actually signed in and is a platform admin
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_platform_admin")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.is_platform_admin) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  // Safety: an admin can't suspend their own account by accident
  if (userId === user.id) {
    return NextResponse.json({ error: "You cannot suspend your own account" }, { status: 400 });
  }

  // Privileged service-role client — only ever used here, server-side,
  // after the admin check above. This key must never reach the browser.
  const adminClient = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const banDuration = action === "suspend" ? "876000h" : "none"; // ~100 years = effectively permanent, or lift the ban

  const { error: authError } = await adminClient.auth.admin.updateUserById(userId, {
    ban_duration: banDuration,
  });
  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 500 });
  }

  const { error: profileError } = await adminClient
    .from("profiles")
    .update({ account_status: action === "suspend" ? "suspended" : "active" })
    .eq("id", userId);
  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  // Listings follow the account: hide them on suspension, restore on reactivation.
  // We only ever touch listings whose current status we can cleanly reverse —
  // an already-pending or already-rejected listing is untouched either way.
  if (action === "suspend") {
    const { data: toHide } = await adminClient
      .from("listings")
      .select("id, status")
      .eq("agent_id", userId)
      .eq("status", "active");

    if (toHide && toHide.length > 0) {
      await Promise.all(
        toHide.map((l) =>
          adminClient
            .from("listings")
            .update({ status: "suspended", previous_status: l.status })
            .eq("id", l.id)
        )
      );
    }
  } else {
    const { data: toRestore } = await adminClient
      .from("listings")
      .select("id, previous_status")
      .eq("agent_id", userId)
      .eq("status", "suspended");

    if (toRestore && toRestore.length > 0) {
      await Promise.all(
        toRestore.map((l) =>
          adminClient
            .from("listings")
            .update({ status: l.previous_status || "active", previous_status: null })
            .eq("id", l.id)
        )
      );
    }
  }

  return NextResponse.json({ success: true });
}