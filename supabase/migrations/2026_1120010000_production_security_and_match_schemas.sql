-- =====================================================================
-- PRODUCTION HARDENING, RLS PRIVILEGE GUARDS & EXTERNAL MATCH ID SCHEMAS
-- =====================================================================
-- Unifies all remaining database schema, trigger, and RLS requirements for v1.0:
-- 1. Converts match_id in posts, blocked_post_attempts, and predictions from UUID
--    foreign keys (pointing to unused public.matches) to canonical text external IDs
--    (ESPN / FotMob), and adds sporting_scorers to predictions.
-- 2. Creates match_mvp_votes and match_player_ratings tables for La Grada community ratings.
-- 3. Adds BEFORE UPDATE privilege-escalation guards on profiles and posts so regular
--    authenticated users cannot unban themselves, alter points, or self-approve flagged posts.
-- 4. Enforces active ban status (is_user_banned) and emergency read-only wall mode
--    (is_wall_read_only) at the database RLS level.
-- 5. Configures RLS policies and grants on external_api_cache for L2 sports caching.

-- ---------------------------------------------------------------------
-- 1. HELPER FUNCTIONS FOR BAN & READ-ONLY WALL ENFORCEMENT
-- ---------------------------------------------------------------------
create or replace function public.is_user_banned(user_uuid uuid default auth.uid())
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = user_uuid
      and is_banned = true
      and (banned_until is null or banned_until > now())
  );
$$;

grant execute on function public.is_user_banned(uuid) to anon, authenticated, service_role;

create or replace function public.is_wall_read_only()
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select exists (
    select 1
    from public.system_announcements
    where is_active = true
      and read_only_wall = true
  );
$$;

grant execute on function public.is_wall_read_only() to anon, authenticated, service_role;

-- ---------------------------------------------------------------------
-- 2. PRIVILEGE ESCALATION GUARDS (PROFILES & POSTS)
-- ---------------------------------------------------------------------
create or replace function public.protect_profile_privileged_columns()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if current_setting('request.jwt.claim.role', true) = 'service_role'
     or session_user in ('postgres', 'supabase_admin')
     or public.is_admin((select auth.uid())) then
    return new;
  end if;

  if new.is_banned is distinct from old.is_banned
     or new.banned_until is distinct from old.banned_until
     or new.banned_reason is distinct from old.banned_reason then
    raise exception 'permission denied: cannot modify disciplinary status';
  end if;

  if new.points is distinct from old.points
     and current_setting('mareona.allow_points_sync', true) is distinct from 'true' then
    raise exception 'permission denied: cannot modify points directly';
  end if;

  return new;
end;
$$;

drop trigger if exists profiles_protect_privileged_columns on public.profiles;
create trigger profiles_protect_privileged_columns
  before update on public.profiles
  for each row execute function public.protect_profile_privileged_columns();

create or replace function public.protect_post_moderation_columns()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if current_setting('request.jwt.claim.role', true) = 'service_role'
     or session_user in ('postgres', 'supabase_admin')
     or public.is_admin((select auth.uid())) then
    return new;
  end if;

  if old.moderation_status = 'flagged' and new.moderation_status = 'approved' then
    raise exception 'permission denied: cannot self-approve a flagged post';
  end if;

  return new;
end;
$$;

drop trigger if exists posts_protect_moderation_columns on public.posts;
create trigger posts_protect_moderation_columns
  before update on public.posts
  for each row execute function public.protect_post_moderation_columns();

-- ---------------------------------------------------------------------
-- 3. POSTS & BLOCKED_POST_ATTEMPTS: EXTERNAL MATCH_ID (TEXT) & RLS
-- ---------------------------------------------------------------------
drop index if exists public.posts_match_idx;

alter table public.posts
  drop constraint if exists posts_match_id_fkey;

alter table public.posts
  alter column match_id type text using match_id::text;

create index if not exists posts_match_idx
  on public.posts (match_id, created_at desc)
  where deleted_at is null;

alter table public.blocked_post_attempts
  alter column match_id type text using match_id::text;

drop policy if exists "posts_insert_own" on public.posts;
create policy "posts_insert_own" on public.posts
  for insert to authenticated
  with check (
    (select auth.uid()) = user_id
    and deleted_at is null
    and not public.is_user_banned((select auth.uid()))
    and not public.is_wall_read_only()
  );

drop policy if exists "posts_update_own" on public.posts;
create policy "posts_update_own" on public.posts
  for update to authenticated
  using (
    (select auth.uid()) = user_id
    and not public.is_user_banned((select auth.uid()))
  )
  with check (
    (select auth.uid()) = user_id
    and not public.is_user_banned((select auth.uid()))
  );

-- ---------------------------------------------------------------------
-- 4. PREDICTIONS (LA PORRA): EXTERNAL MATCH_ID, SCORERS & POINTS SYNC
-- ---------------------------------------------------------------------
drop policy if exists "predictions_select_own_or_after_kickoff" on public.predictions;
drop policy if exists "predictions_insert_own_before_kickoff" on public.predictions;
drop policy if exists "predictions_update_own_before_kickoff" on public.predictions;
drop policy if exists "predictions_select_public" on public.predictions;
drop policy if exists "predictions_insert_own" on public.predictions;
drop policy if exists "predictions_update_own" on public.predictions;

alter table public.predictions
  drop constraint if exists predictions_match_id_fkey;

alter table public.predictions
  alter column match_id type text using match_id::text;

alter table public.predictions
  add column if not exists sporting_scorers text[] not null default '{}'::text[];

create policy "predictions_select_public" on public.predictions
  for select to anon, authenticated
  using (true);

create policy "predictions_insert_own" on public.predictions
  for insert to authenticated
  with check (
    (select auth.uid()) = user_id
    and not public.is_user_banned((select auth.uid()))
  );

create policy "predictions_update_own" on public.predictions
  for update to authenticated
  using (
    (select auth.uid()) = user_id
    and not public.is_user_banned((select auth.uid()))
  )
  with check (
    (select auth.uid()) = user_id
    and not public.is_user_banned((select auth.uid()))
  );

grant select on public.predictions to anon, authenticated;
grant insert on public.predictions to authenticated;
grant update (home_score, away_score, sporting_scorers, points_awarded, updated_at) on public.predictions to authenticated;

-- Automatically synchronize profiles.points whenever predictions.points_awarded changes
create or replace function public.sync_profile_porra_points()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid;
  v_total   integer;
begin
  v_user_id := coalesce(new.user_id, old.user_id);
  if v_user_id is null then
    return coalesce(new, old);
  end if;

  select coalesce(sum(points_awarded), 0)::integer
    into v_total
    from public.predictions
   where user_id = v_user_id
     and points_awarded is not null;

  perform set_config('mareona.allow_points_sync', 'true', true);
  update public.profiles
     set points = greatest(0, v_total)
   where id = v_user_id;

  return coalesce(new, old);
end;
$$;

drop trigger if exists predictions_sync_profile_points on public.predictions;
create trigger predictions_sync_profile_points
  after insert or update of points_awarded or delete on public.predictions
  for each row execute function public.sync_profile_porra_points();

-- ---------------------------------------------------------------------
-- 5. LA GRADA: MATCH MVP VOTES & PLAYER RATINGS TABLES
-- ---------------------------------------------------------------------
create table if not exists public.match_mvp_votes (
  id          uuid primary key default gen_random_uuid(),
  match_id    text not null,
  user_id     uuid not null references public.profiles (id) on delete cascade,
  player_id   text not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint match_mvp_votes_one_per_user unique (match_id, user_id)
);

create index if not exists match_mvp_votes_match_idx
  on public.match_mvp_votes (match_id, player_id);

drop trigger if exists match_mvp_votes_set_updated_at on public.match_mvp_votes;
create trigger match_mvp_votes_set_updated_at
  before update on public.match_mvp_votes
  for each row execute function public.set_updated_at();

alter table public.match_mvp_votes enable row level security;

drop policy if exists "match_mvp_votes_select_public" on public.match_mvp_votes;
create policy "match_mvp_votes_select_public" on public.match_mvp_votes
  for select to anon, authenticated
  using (true);

drop policy if exists "match_mvp_votes_insert_own" on public.match_mvp_votes;
create policy "match_mvp_votes_insert_own" on public.match_mvp_votes
  for insert to authenticated
  with check (
    (select auth.uid()) = user_id
    and not public.is_user_banned((select auth.uid()))
  );

drop policy if exists "match_mvp_votes_update_own" on public.match_mvp_votes;
create policy "match_mvp_votes_update_own" on public.match_mvp_votes
  for update to authenticated
  using (
    (select auth.uid()) = user_id
    and not public.is_user_banned((select auth.uid()))
  )
  with check (
    (select auth.uid()) = user_id
    and not public.is_user_banned((select auth.uid()))
  );

grant all on public.match_mvp_votes to postgres, service_role;
grant select on public.match_mvp_votes to anon, authenticated;
grant insert, update (player_id, updated_at) on public.match_mvp_votes to authenticated;

create table if not exists public.match_player_ratings (
  id          uuid primary key default gen_random_uuid(),
  match_id    text not null,
  user_id     uuid not null references public.profiles (id) on delete cascade,
  target_id   text not null,
  rating      smallint not null check (rating between 0 and 10),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint match_player_ratings_one_per_target unique (match_id, user_id, target_id)
);

create index if not exists match_player_ratings_match_idx
  on public.match_player_ratings (match_id, target_id);

drop trigger if exists match_player_ratings_set_updated_at on public.match_player_ratings;
create trigger match_player_ratings_set_updated_at
  before update on public.match_player_ratings
  for each row execute function public.set_updated_at();

alter table public.match_player_ratings enable row level security;

drop policy if exists "match_player_ratings_select_public" on public.match_player_ratings;
create policy "match_player_ratings_select_public" on public.match_player_ratings
  for select to anon, authenticated
  using (true);

drop policy if exists "match_player_ratings_insert_own" on public.match_player_ratings;
create policy "match_player_ratings_insert_own" on public.match_player_ratings
  for insert to authenticated
  with check (
    (select auth.uid()) = user_id
    and not public.is_user_banned((select auth.uid()))
  );

drop policy if exists "match_player_ratings_update_own" on public.match_player_ratings;
create policy "match_player_ratings_update_own" on public.match_player_ratings
  for update to authenticated
  using (
    (select auth.uid()) = user_id
    and not public.is_user_banned((select auth.uid()))
  )
  with check (
    (select auth.uid()) = user_id
    and not public.is_user_banned((select auth.uid()))
  );

grant all on public.match_player_ratings to postgres, service_role;
grant select on public.match_player_ratings to anon, authenticated;
grant insert, update (rating, updated_at) on public.match_player_ratings to authenticated;

-- ---------------------------------------------------------------------
-- 6. EXTERNAL API CACHE: RLS POLICIES & GRANTS FOR L2 CACHE
-- ---------------------------------------------------------------------
drop policy if exists "external_api_cache_select_all" on public.external_api_cache;
create policy "external_api_cache_select_all"
  on public.external_api_cache for select
  to anon, authenticated, service_role
  using (true);

drop policy if exists "external_api_cache_insert_all" on public.external_api_cache;
create policy "external_api_cache_insert_all"
  on public.external_api_cache for insert
  to anon, authenticated, service_role
  with check (true);

drop policy if exists "external_api_cache_update_all" on public.external_api_cache;
create policy "external_api_cache_update_all"
  on public.external_api_cache for update
  to anon, authenticated, service_role
  using (true)
  with check (true);

drop policy if exists "external_api_cache_delete_admin" on public.external_api_cache;
create policy "external_api_cache_delete_admin"
  on public.external_api_cache for delete
  to authenticated, service_role
  using (public.is_admin() or current_setting('request.jwt.claim.role', true) = 'service_role');

grant all on public.external_api_cache to postgres, service_role;
grant select, insert, update on public.external_api_cache to anon, authenticated;
grant delete on public.external_api_cache to authenticated;
