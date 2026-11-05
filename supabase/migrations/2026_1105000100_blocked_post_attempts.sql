-- Audit log of posts rejected by moderation. Rejected text is never published, but we keep it
-- per user to detect repeat offenders and tune the moderation prompt.
create table public.blocked_post_attempts (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles (id) on delete cascade,
  body        text not null check (char_length(body) between 1 and 500),
  parent_id   uuid,
  match_id    uuid,
  reason      text,
  created_at  timestamptz not null default now()
);

create index blocked_post_attempts_user_idx
  on public.blocked_post_attempts (user_id, created_at desc);

alter table public.blocked_post_attempts enable row level security;

-- Users may only append their own attempts (written by the server action on their behalf).
-- There is deliberately no SELECT/UPDATE/DELETE policy: only service-role tooling can read it.
create policy "blocked_attempts_insert_own" on public.blocked_post_attempts
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

revoke all on public.blocked_post_attempts from anon, authenticated;
grant insert on public.blocked_post_attempts to authenticated;
