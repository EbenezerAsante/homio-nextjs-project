-- Baseline snapshot of RLS policies as they existed live in Supabase on
-- 2026-07-16, captured via supabase/export_current_policies.sql and
-- checked into git for the first time. This file is NOT meant to be
-- re-run — these policies already exist in the database. It exists so
-- future policy changes have something to diff against instead of only
-- living as dashboard clicks with no history.
--
-- admin_actions' own policies are defined in
-- 0001_admin_actions_audit_log.sql, not repeated here.
--
-- Going forward: any new policy or policy change should be written as
-- its own numbered migration file and actually run through the SQL
-- Editor (or Supabase CLI) — the same way 0001 was — so this log stays
-- a true history rather than a one-time export.

-- Table: agency_profiles
create policy "agency_profiles_own_insert" on public.agency_profiles as PERMISSIVE for INSERT to public
  with check ((auth.uid() = id));

create policy "agency_profiles_own_select" on public.agency_profiles as PERMISSIVE for SELECT to public
  using (((auth.uid() = id) OR is_platform_admin()));

create policy "agency_profiles_public_select_approved" on public.agency_profiles as PERMISSIVE for SELECT to public
  using ((status = 'approved'::text));

create policy "agency_profiles_update" on public.agency_profiles as PERMISSIVE for UPDATE to public
  using (((auth.uid() = id) OR is_platform_admin()));

-- Table: agent_profiles
create policy "agent_profiles_own_insert" on public.agent_profiles as PERMISSIVE for INSERT to public
  with check ((auth.uid() = id));

create policy "agent_profiles_own_select" on public.agent_profiles as PERMISSIVE for SELECT to public
  using (((auth.uid() = id) OR is_platform_admin()));

create policy "agent_profiles_public_select_approved" on public.agent_profiles as PERMISSIVE for SELECT to public
  using ((status = 'approved'::text));

create policy "agent_profiles_update" on public.agent_profiles as PERMISSIVE for UPDATE to public
  using (((auth.uid() = id) OR is_platform_admin()));

-- Table: agents
create policy "Agents can insert own profile" on public.agents as PERMISSIVE for INSERT to public
  with check ((auth.uid() = id));

create policy "Agents can update own profile" on public.agents as PERMISSIVE for UPDATE to public
  using ((auth.uid() = id));

create policy "Public can view agents" on public.agents as PERMISSIVE for SELECT to public
  using (true);

create policy "agents_platform_admin_delete" on public.agents as PERMISSIVE for DELETE to public
  using (is_platform_admin());

create policy "agents_platform_admin_insert" on public.agents as PERMISSIVE for INSERT to public
  with check (is_platform_admin());

create policy "agents_platform_admin_update" on public.agents as PERMISSIVE for UPDATE to public
  using (is_platform_admin());

-- Table: appointments
create policy "appointments_agent_update" on public.appointments as PERMISSIVE for UPDATE to public
  using (((agent_id = auth.uid()) OR (buyer_id = auth.uid())));

create policy "appointments_buyer_insert" on public.appointments as PERMISSIVE for INSERT to public
  with check ((buyer_id = auth.uid()));

create policy "appointments_buyer_select" on public.appointments as PERMISSIVE for SELECT to public
  using (((buyer_id = auth.uid()) OR (agent_id = auth.uid())));

-- Table: contact_messages
create policy "contact_messages_admin_select" on public.contact_messages as PERMISSIVE for SELECT to public
  using (is_platform_admin());

create policy "contact_messages_public_insert" on public.contact_messages as PERMISSIVE for INSERT to public
  with check (true);

-- Table: developer_profiles
create policy "developer_profiles_own_insert" on public.developer_profiles as PERMISSIVE for INSERT to public
  with check ((auth.uid() = id));

create policy "developer_profiles_own_select" on public.developer_profiles as PERMISSIVE for SELECT to public
  using (((auth.uid() = id) OR is_platform_admin()));

create policy "developer_profiles_public_select_approved" on public.developer_profiles as PERMISSIVE for SELECT to public
  using ((status = 'approved'::text));

create policy "developer_profiles_update" on public.developer_profiles as PERMISSIVE for UPDATE to public
  using (((auth.uid() = id) OR is_platform_admin()));

-- Table: enquiries
create policy "Admins can insert enquiries" on public.enquiries as PERMISSIVE for INSERT to public
  with check ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.is_platform_admin = true)))));

create policy "Admins can view all enquiries" on public.enquiries as PERMISSIVE for SELECT to public
  using ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.is_platform_admin = true)))));

create policy "Agents can update own enquiries" on public.enquiries as PERMISSIVE for UPDATE to public
  using ((auth.uid() = agent_id));

create policy "Agents can view own enquiries" on public.enquiries as PERMISSIVE for SELECT to public
  using ((auth.uid() = agent_id));

create policy "Anyone can submit an enquiry" on public.enquiries as PERMISSIVE for INSERT to public
  with check (true);

create policy "enquiries_buyer_select" on public.enquiries as PERMISSIVE for SELECT to public
  using (((buyer_id = auth.uid()) OR (agent_id = auth.uid())));

-- Table: favorites
create policy "Users can add own favorites" on public.favorites as PERMISSIVE for INSERT to public
  with check ((auth.uid() = user_id));

create policy "Users can remove own favorites" on public.favorites as PERMISSIVE for DELETE to public
  using ((auth.uid() = user_id));

create policy "Users can view own favorites" on public.favorites as PERMISSIVE for SELECT to public
  using ((auth.uid() = user_id));

-- Table: favourites
-- NOTE: this looks like a duplicate of `favorites` (US vs UK spelling)
-- with near-identical policies. Flagging rather than silently dropping
-- one — worth confirming which one the app actually reads/writes
-- (BuyerDashboard uses `favorites` per our notes) and retiring the
-- other, since having both invites data to silently split across them.
create policy "Users can add own favourites" on public.favourites as PERMISSIVE for INSERT to public
  with check ((auth.uid() = user_id));

create policy "Users can remove own favourites" on public.favourites as PERMISSIVE for DELETE to public
  using ((auth.uid() = user_id));

create policy "Users can view own favourites" on public.favourites as PERMISSIVE for SELECT to public
  using ((auth.uid() = user_id));

-- Table: listing_images
create policy "Agents can manage own listing images" on public.listing_images as PERMISSIVE for ALL to public
  using ((auth.uid() = ( SELECT listings.agent_id
   FROM listings
  WHERE (listings.id = listing_images.listing_id))));

create policy "Public can view listing images" on public.listing_images as PERMISSIVE for SELECT to public
  using (true);

-- Table: listing_reports
create policy "Admins can update reports" on public.listing_reports as PERMISSIVE for UPDATE to public
  using ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.is_platform_admin = true)))));

create policy "Admins can view all reports" on public.listing_reports as PERMISSIVE for SELECT to public
  using ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.is_platform_admin = true)))));

create policy "Anyone can submit a report" on public.listing_reports as PERMISSIVE for INSERT to public
  with check (true);

-- Table: listings
create policy "Admins can update all listings" on public.listings as PERMISSIVE for UPDATE to public
  using ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.is_platform_admin = true)))));

create policy "Admins can view all listings" on public.listings as PERMISSIVE for SELECT to public
  using ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.is_platform_admin = true)))));

create policy "Agents can delete own listings" on public.listings as PERMISSIVE for DELETE to public
  using ((auth.uid() = agent_id));

create policy "Agents can insert own listings" on public.listings as PERMISSIVE for INSERT to public
  with check ((auth.uid() = agent_id));

create policy "Agents can update own listings" on public.listings as PERMISSIVE for UPDATE to public
  using ((auth.uid() = agent_id));

create policy "Public can view active listings" on public.listings as PERMISSIVE for SELECT to public
  using (((status = 'active'::text) OR (auth.uid() = agent_id)));

-- Table: messages
create policy "Admins can insert messages" on public.messages as PERMISSIVE for INSERT to public
  with check ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.is_platform_admin = true)))));

create policy "Admins can view all messages" on public.messages as PERMISSIVE for SELECT to public
  using ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.is_platform_admin = true)))));

create policy "messages_insert_participants" on public.messages as PERMISSIVE for INSERT to public
  with check (((sender_id = auth.uid()) AND (EXISTS ( SELECT 1
   FROM enquiries e
  WHERE ((e.id = messages.enquiry_id) AND ((e.buyer_id = auth.uid()) OR (e.agent_id = auth.uid())))))));

create policy "messages_select_participants" on public.messages as PERMISSIVE for SELECT to public
  using ((EXISTS ( SELECT 1
   FROM enquiries e
  WHERE ((e.id = messages.enquiry_id) AND ((e.buyer_id = auth.uid()) OR (e.agent_id = auth.uid()))))));

-- Table: owner_profiles
create policy "owner_profiles_own" on public.owner_profiles as PERMISSIVE for ALL to public
  using ((auth.uid() = id))
  with check ((auth.uid() = id));

create policy "owner_profiles_public_select" on public.owner_profiles as PERMISSIVE for SELECT to public
  using (true);

-- Table: profiles
create policy "profiles_select_own_or_admin" on public.profiles as PERMISSIVE for SELECT to public
  using (((auth.uid() = id) OR is_platform_admin()));

create policy "profiles_update_own" on public.profiles as PERMISSIVE for UPDATE to public
  using ((auth.uid() = id));

-- Table: property_manager_profiles
create policy "pm_profiles_own_insert" on public.property_manager_profiles as PERMISSIVE for INSERT to public
  with check ((auth.uid() = id));

create policy "pm_profiles_own_select" on public.property_manager_profiles as PERMISSIVE for SELECT to public
  using (((auth.uid() = id) OR is_platform_admin()));

create policy "pm_profiles_public_select_approved" on public.property_manager_profiles as PERMISSIVE for SELECT to public
  using ((status = 'approved'::text));

create policy "pm_profiles_update" on public.property_manager_profiles as PERMISSIVE for UPDATE to public
  using (((auth.uid() = id) OR is_platform_admin()));

-- Table: saved_searches
create policy "Users can add own saved searches" on public.saved_searches as PERMISSIVE for INSERT to public
  with check ((auth.uid() = user_id));

create policy "Users can delete own saved searches" on public.saved_searches as PERMISSIVE for DELETE to public
  using ((auth.uid() = user_id));

create policy "Users can view own saved searches" on public.saved_searches as PERMISSIVE for SELECT to public
  using ((auth.uid() = user_id));
