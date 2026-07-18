-- Safe to run even if some of these already exist from a previous attempt —
-- each policy is dropped first (if present) then recreated fresh.

drop policy if exists "messages_insert_conversation_participants" on messages;
create policy "messages_insert_conversation_participants"
  on messages for insert
  with check (
    sender_id = auth.uid()
    and conversation_id is not null
    and exists (
      select 1 from conversations c
      where c.id = messages.conversation_id
      and (c.buyer_id = auth.uid() or c.agent_id = auth.uid())
    )
  );

drop policy if exists "messages_select_conversation_participants" on messages;
create policy "messages_select_conversation_participants"
  on messages for select
  using (
    conversation_id is not null
    and exists (
      select 1 from conversations c
      where c.id = messages.conversation_id
      and (c.buyer_id = auth.uid() or c.agent_id = auth.uid())
    )
  );

drop policy if exists "messages_update_conversation_participants" on messages;
create policy "messages_update_conversation_participants"
  on messages for update
  using (
    conversation_id is not null
    and exists (
      select 1 from conversations c
      where c.id = messages.conversation_id
      and (c.buyer_id = auth.uid() or c.agent_id = auth.uid())
    )
  );
