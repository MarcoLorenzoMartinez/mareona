-- =====================================================================
-- DIRECT MESSAGES: SOFT-DELETE, REALTIME REPLICA IDENTITY & LEGAL CUSTODY
-- =====================================================================

-- 1. Ensure full replica identity on messages so Supabase Realtime streams
--    both INSERT and soft-delete UPDATE events accurately under RLS.
alter table public.messages replica identity full;

-- 2. Allow the sender of a direct message to soft-delete their own message
--    (setting deleted_at) without altering the original body or metadata.
--    Once deleted_at is set, the row is hidden from regular users by the
--    existing "messages_select_member" policy (which requires deleted_at is null),
--    while remaining intact in the database under blocked legal custody
--    (Art. 32 LOPDGDD / LSSI-CE) for judicial or law-enforcement requests.
create policy "messages_soft_delete_own" on public.messages
  for update to authenticated
  using ((select auth.uid()) = sender_id and deleted_at is null)
  with check ((select auth.uid()) = sender_id and deleted_at is not null);

revoke update on public.messages from authenticated;
grant update (deleted_at) on public.messages to authenticated;

-- 3. Widen blocked_post_attempts body length constraint from 500 to 2000 chars
--    so blocked direct messages (up to 2000 chars) are preserved intact in legal
--    custody without failing the length check.
alter table public.blocked_post_attempts
  drop constraint if exists blocked_post_attempts_body_check;

alter table public.blocked_post_attempts
  add constraint blocked_post_attempts_body_check
  check (char_length(body) between 1 and 2000);
