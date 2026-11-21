-- Migration: Allow authors to select their own posts so soft-delete UPDATE passes RLS
-- Without this policy, setting deleted_at != null fails because posts_select_public_visible requires deleted_at is null.

drop policy if exists "posts_select_own" on public.posts;
create policy "posts_select_own"
  on public.posts
  for select
  to authenticated
  using ((select auth.uid()) = user_id);
