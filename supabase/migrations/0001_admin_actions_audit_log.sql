-- Admin action audit log.
-- Records every moderation/administrative action so "who did what and
-- when, and why" is always answerable after the fact — listing
-- approvals/rejections, report status changes, role application
-- decisions, and user suspend/activate.
--
-- Deliberately append-only: there are INSERT and SELECT policies below
-- but no UPDATE or DELETE policy, so under RLS nobody — including
-- platform admins — can edit or remove a row through the app. Only
-- direct database access (service role / SQL editor) can, which is the
-- point: the log has to be tamper-resistant to be worth anything.

create table if not exists admin_actions (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references profiles(id) not null,
  actor_name text not null,          -- snapshot at time of action, survives profile edits/deletion
  action text not null,               -- e.g. 'listing.approve', 'user.suspend'
  target_type text not null,          -- e.g. 'listing', 'user', 'application', 'report'
  target_id text not null,
  target_label text,                  -- snapshot for readability, e.g. listing title or user email
  reason text,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index if not exists admin_actions_created_at_idx on admin_actions (created_at desc);
create index if not exists admin_actions_target_idx on admin_actions (target_type, target_id);
create index if not exists admin_actions_actor_idx on admin_actions (actor_id);

alter table admin_actions enable row level security;

-- Only platform admins can read the log.
create policy "Platform admins can view audit log"
  on admin_actions for select
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.is_platform_admin = true
    )
  );

-- Only platform admins can write to it, and only ever as themselves
-- (actor_id must match the authenticated user — prevents an admin
-- client from logging an action under someone else's name).
create policy "Platform admins can insert audit log entries"
  on admin_actions for insert
  with check (
    actor_id = auth.uid()
    and exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.is_platform_admin = true
    )
  );

-- No update/delete policy is intentional — see header comment.
