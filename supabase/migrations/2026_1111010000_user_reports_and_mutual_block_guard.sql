-- =====================================================================
-- MUTUAL BLOCK ENFORCEMENT & USER/CONVERSATION REPORTING (DSA / RGPD)
-- =====================================================================

-- 1. Enforce mutual block check in can_message_conversation:
--    Neither participant can send messages if a block exists in either direction.
create or replace function public.can_message_conversation(p_conversation_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    exists (
      select 1 from public.conversation_members me
       where me.conversation_id = p_conversation_id
         and me.user_id = (select auth.uid())
    )
    and not exists (
      select 1
        from public.conversation_members other
        join public.user_blocks b
          on (
            (b.blocker_id = other.user_id and b.blocked_id = (select auth.uid()))
            or
            (b.blocker_id = (select auth.uid()) and b.blocked_id = other.user_id)
          )
       where other.conversation_id = p_conversation_id
         and other.user_id <> (select auth.uid())
    );
$$;

-- 2. Enforce mutual block check when opening a direct conversation.
create or replace function public.get_or_create_direct_conversation(p_other_user uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_me  uuid := auth.uid();
  v_key text;
  v_id  uuid;
begin
  if v_me is null then
    raise exception 'not authenticated';
  end if;
  if p_other_user = v_me then
    raise exception 'cannot start a conversation with yourself';
  end if;
  if not exists (select 1 from public.profiles where id = p_other_user) then
    raise exception 'user not found';
  end if;
  if exists (
    select 1 from public.user_blocks
     where (blocker_id = p_other_user and blocked_id = v_me)
        or (blocker_id = v_me and blocked_id = p_other_user)
  ) then
    raise exception 'not allowed';
  end if;

  v_key := least(v_me::text, p_other_user::text) || ':' || greatest(v_me::text, p_other_user::text);

  insert into public.conversations (direct_key)
  values (v_key)
  on conflict (direct_key) do nothing
  returning id into v_id;

  if v_id is null then
    select id into v_id from public.conversations where direct_key = v_key;
  else
    insert into public.conversation_members (conversation_id, user_id)
    values (v_id, v_me), (v_id, p_other_user);
  end if;

  return v_id;
end;
$$;

-- 3. Allow administrators to query blocked_post_attempts for public post
--    moderation and victim-consented safety reports.
create policy "blocked_attempts_select_admin" on public.blocked_post_attempts
  for select to authenticated
  using (public.is_admin());

grant select on public.blocked_post_attempts to authenticated;

-- 4. Dedicated user_reports table for DSA / legal compliance custody.
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

create policy "user_reports_insert_own" on public.user_reports
  for insert to authenticated
  with check ((select auth.uid()) = reporter_id);

create policy "user_reports_select_admin" on public.user_reports
  for select to authenticated
  using (public.is_admin());

create policy "user_reports_update_admin" on public.user_reports
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());
