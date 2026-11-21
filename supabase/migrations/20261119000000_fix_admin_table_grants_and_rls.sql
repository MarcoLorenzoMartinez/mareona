-- =====================================================================
-- FIX ADMIN TABLE GRANTS & RLS POLICIES FOR TELEMETRY, AUDIT & MODERATION
-- =====================================================================
-- Root cause:
-- 1. `site_visits_admin_select_policy` queried `public.user_roles` directly
--    instead of calling `public.is_admin()` (SECURITY DEFINER), while
--    `public.user_roles` lacked `GRANT SELECT TO authenticated`, causing
--    PostgreSQL error 42501 ("permission denied for table user_roles")
--    whenever an authenticated administrator loaded `/admin/estadisticas`.
-- 2. Several tables lacked explicit table/column privileges for `authenticated`
--    and `service_role` or admin RLS policies for moderation and discipline.

-- 1. Ensure `blocked_post_attempts` and `user_reports` exist in case earlier
--    optional migrations were skipped on the target database.
create table if not exists public.blocked_post_attempts (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles (id) on delete cascade,
  body        text not null check (char_length(body) between 1 and 2000),
  parent_id   uuid,
  match_id    uuid,
  reason      text,
  created_at  timestamptz not null default now()
);

create index if not exists blocked_post_attempts_user_idx
  on public.blocked_post_attempts (user_id, created_at desc);

alter table public.blocked_post_attempts enable row level security;

drop policy if exists "blocked_attempts_insert_own" on public.blocked_post_attempts;
create policy "blocked_attempts_insert_own" on public.blocked_post_attempts
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "blocked_attempts_select_admin" on public.blocked_post_attempts;
create policy "blocked_attempts_select_admin" on public.blocked_post_attempts
  for select to authenticated
  using (public.is_admin());

create table if not exists public.user_reports (
  id                uuid primary key default gen_random_uuid(),
  reporter_id       uuid not null references public.profiles (id) on delete cascade,
  reported_id       uuid not null references public.profiles (id) on delete cascade,
  conversation_id   uuid references public.conversations (id) on delete set null,
  category          text not null check (category in ('harassment', 'threats', 'spam_scam', 'impersonation', 'other')),
  details           text,
  evidence_snapshot text,
  status            text not null default 'pending' check (status in ('pending', 'reviewed', 'dismissed')),
  created_at        timestamptz not null default now(),
  check (reporter_id <> reported_id)
);

create index if not exists user_reports_reported_idx on public.user_reports (reported_id, created_at desc);
create index if not exists user_reports_status_idx on public.user_reports (status, created_at desc);

alter table public.user_reports enable row level security;

drop policy if exists "user_reports_insert_own" on public.user_reports;
create policy "user_reports_insert_own" on public.user_reports
  for insert to authenticated
  with check ((select auth.uid()) = reporter_id);

drop policy if exists "user_reports_select_admin" on public.user_reports;
create policy "user_reports_select_admin" on public.user_reports
  for select to authenticated
  using (public.is_admin());

drop policy if exists "user_reports_update_admin" on public.user_reports;
create policy "user_reports_update_admin" on public.user_reports
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- 2. Replace `site_visits` admin SELECT policy to use `public.is_admin()` (SECURITY DEFINER)
drop policy if exists "site_visits_admin_select_policy" on public.site_visits;
create policy "site_visits_admin_select_policy"
  on public.site_visits
  for select
  to authenticated
  using (public.is_admin());

-- 3. Allow administrators to read all predictions for KPI counters and moderate profiles/posts
drop policy if exists "predictions_select_admin" on public.predictions;
create policy "predictions_select_admin"
  on public.predictions
  for select
  to authenticated
  using (public.is_admin());

drop policy if exists "profiles_update_admin" on public.profiles;
create policy "profiles_update_admin"
  on public.profiles
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "posts_update_admin" on public.posts;
create policy "posts_update_admin"
  on public.posts
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- 4. Grant required table & column privileges to PostgREST roles
grant all on public.site_visits to postgres, service_role;
grant insert on public.site_visits to anon, authenticated;
grant select on public.site_visits to authenticated;

grant all on public.user_roles to postgres, service_role;
grant select on public.user_roles to authenticated;

grant all on public.admin_audit_logs to postgres, service_role;
grant select, insert on public.admin_audit_logs to authenticated;

grant all on public.system_announcements to postgres, service_role;
grant select on public.system_announcements to anon, authenticated;
grant insert, update, delete on public.system_announcements to authenticated;

grant all on public.blocked_post_attempts to postgres, service_role;
grant select, insert on public.blocked_post_attempts to authenticated;

grant all on public.user_reports to postgres, service_role;
grant select, insert, update on public.user_reports to authenticated;

grant all on public.predictions to postgres, service_role;
grant select, insert on public.predictions to authenticated;

grant update (is_banned, banned_until, banned_reason, avatar_url) on public.profiles to authenticated;
grant update (moderation_status, moderation_reason, deleted_at) on public.posts to authenticated;
