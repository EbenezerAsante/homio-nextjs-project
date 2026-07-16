// Writes one row to admin_actions for every moderation/admin decision.
// Called from the client-side admin queries (using the signed-in admin's
// own RLS-bound session) and from server-side API routes alike — either
// way, `supabase` must be a client where auth.uid() resolves to the
// acting admin, since the insert RLS policy checks actor_id = auth.uid().
//
// Logging failures are swallowed (logged to console, not thrown) so a
// glitch in the audit trail never blocks the actual admin action.
export async function logAdminAction(supabase, {
  actorId,
  actorName,
  action,
  targetType,
  targetId,
  targetLabel = null,
  reason = null,
  metadata = null,
}) {
  const { error } = await supabase.from("admin_actions").insert({
    actor_id: actorId,
    actor_name: actorName,
    action,
    target_type: targetType,
    target_id: String(targetId),
    target_label: targetLabel,
    reason,
    metadata,
  });

  if (error) {
    console.error(`audit log failed for action "${action}":`, error.message);
  }
}