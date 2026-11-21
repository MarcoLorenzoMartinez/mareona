-- =====================================================================
-- CROSS-DEVICE ACCOUNT STATE SYNCHRONIZATION & TABLE GRANTS HARDENING
-- =====================================================================
-- Forward-only migration:
-- 1. Creates public.user_account_state to persist cards, booster packs,
--    and daily mission streaks across all devices for an authenticated account.
-- 2. Restores missing table-level GRANTs on public.cards and core tables
--    to prevent 42501 permission denied errors under RLS.
-- 3. Relaxes NOT NULL constraints on player-only combat columns in public.cards
--    so commemorative crests, moments, and coaches can also be stored.

begin;

-- 1. Restore missing table-level privileges while preserving RLS policies
grant select on
  public.cards,
  public.teams,
  public.matches,
  public.players,
  public.standings,
  public.posts,
  public.polls,
  public.poll_options,
  public.poll_votes
to anon, authenticated;

grant select, insert, update on public.posts to authenticated;
grant select, insert on public.polls, public.poll_options, public.poll_votes to authenticated;
grant select, insert, update, delete on
  public.conversations,
  public.conversation_members,
  public.messages,
  public.user_blocks
to authenticated;

grant all on
  public.cards,
  public.teams,
  public.matches,
  public.players,
  public.standings,
  public.posts,
  public.polls,
  public.poll_options,
  public.poll_votes,
  public.conversations,
  public.conversation_members,
  public.messages,
  public.user_blocks
to postgres, service_role;

-- 2. Allow non-player cards (crests, moments, coaches) in public.cards
alter table public.cards
  alter column "position" drop not null,
  alter column matches_played drop not null,
  alter column attack_power drop not null,
  alter column defense_power drop not null,
  alter column ovr drop not null;

-- 3. Authoritative cross-device account state table for Album, Packs & Missions
create table if not exists public.user_account_state (
  user_id       uuid primary key references public.profiles (id) on delete cascade,
  cards         jsonb not null default '{}'::jsonb,
  packs         jsonb not null default '{"aficionado":1,"rojiblanco":1,"leyenda":0}'::jsonb,
  missions      jsonb not null default '{}'::jsonb,
  has_activity  boolean not null default false,
  revision      integer not null default 1 check (revision >= 0),
  updated_at    timestamptz not null default now()
);

alter table public.user_account_state enable row level security;

drop policy if exists "user_account_state_select_own" on public.user_account_state;
create policy "user_account_state_select_own"
  on public.user_account_state for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "user_account_state_insert_own" on public.user_account_state;
create policy "user_account_state_insert_own"
  on public.user_account_state for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "user_account_state_update_own" on public.user_account_state;
create policy "user_account_state_update_own"
  on public.user_account_state for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

grant select, insert, update on public.user_account_state to authenticated;
grant all on public.user_account_state to postgres, service_role;

commit;
