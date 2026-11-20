-- =====================================================================
-- V1.0 PRODUCTION SECURITY, RLS HARDENING, AGGREGATION RPCS & POST LIKES
-- =====================================================================
-- Forward-only migration (does not alter any of the 20 already-applied
-- migrations). Uses standard YYYYMMDDHHMMSS_name.sql Supabase CLI format.

begin;

-- ---------------------------------------------------------------------
-- 0. ENSURE PREREQUISITE COLUMNS/FUNCTIONS/TABLES EXIST (IDEMPOTENT)
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

drop index if exists public.posts_match_idx;
alter table public.posts drop constraint if exists posts_match_id_fkey;
alter table public.posts alter column match_id type text using match_id::text;
create index if not exists posts_match_idx
  on public.posts (match_id, created_at desc)
  where deleted_at is null;

alter table public.blocked_post_attempts alter column match_id type text using match_id::text;

-- Drop legacy predictions policies BEFORE altering match_id type (0A000 guard)
drop policy if exists "predictions_select_own_or_after_kickoff" on public.predictions;
drop policy if exists "predictions_insert_own_before_kickoff" on public.predictions;
drop policy if exists "predictions_update_own_before_kickoff" on public.predictions;
drop policy if exists "predictions_select_public" on public.predictions;
drop policy if exists "predictions_insert_own" on public.predictions;
drop policy if exists "predictions_update_own" on public.predictions;

alter table public.predictions drop constraint if exists predictions_match_id_fkey;
alter table public.predictions alter column match_id type text using match_id::text;
alter table public.predictions add column if not exists sporting_scorers text[] not null default '{}'::text[];

create policy "predictions_select_public" on public.predictions
  for select to anon, authenticated
  using (true);

grant select on public.predictions to anon, authenticated;
grant insert on public.predictions to authenticated;

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

alter table public.match_mvp_votes enable row level security;
grant all on public.match_mvp_votes to postgres, service_role;
grant select on public.match_mvp_votes to anon, authenticated;

drop policy if exists "match_mvp_votes_select_public" on public.match_mvp_votes;
create policy "match_mvp_votes_select_public" on public.match_mvp_votes
  for select to anon, authenticated
  using (true);

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

alter table public.match_player_ratings enable row level security;
grant all on public.match_player_ratings to postgres, service_role;
grant select on public.match_player_ratings to anon, authenticated;

drop policy if exists "match_player_ratings_select_public" on public.match_player_ratings;
create policy "match_player_ratings_select_public" on public.match_player_ratings
  for select to anon, authenticated
  using (true);

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
-- 1. PREDICTIONS (LA PORRA): LOCK POINTS_AWARDED & KICKOFF INTEGRITY
-- ---------------------------------------------------------------------
revoke update on public.predictions from authenticated;
grant update (home_score, away_score, sporting_scorers, updated_at) on public.predictions to authenticated;

drop policy if exists "predictions_insert_own" on public.predictions;
create policy "predictions_insert_own" on public.predictions
  for insert to authenticated
  with check (
    (select auth.uid()) = user_id
    and points_awarded is null
    and not public.is_user_banned((select auth.uid()))
  );

drop policy if exists "predictions_update_own" on public.predictions;
create policy "predictions_update_own" on public.predictions
  for update to authenticated
  using (
    (select auth.uid()) = user_id
    and points_awarded is null
    and not public.is_user_banned((select auth.uid()))
  )
  with check (
    (select auth.uid()) = user_id
    and points_awarded is null
    and not public.is_user_banned((select auth.uid()))
  );

create or replace function public.protect_prediction_settlement()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if current_setting('request.jwt.claim.role', true) = 'service_role'
     or session_user in ('postgres', 'supabase_admin') then
    return new;
  end if;

  if tg_op = 'INSERT' and new.points_awarded is not null then
    raise exception 'permission denied: cannot set points_awarded on insert';
  end if;

  if tg_op = 'UPDATE' then
    if new.points_awarded is distinct from old.points_awarded then
      raise exception 'permission denied: cannot modify points_awarded';
    end if;
    if old.points_awarded is not null then
      raise exception 'permission denied: cannot modify settled prediction';
    end if;
  end if;

  if exists (
    select 1
    from public.matches m
    where (m.external_id = new.match_id or m.id::text = new.match_id)
      and m.kickoff_at <= now()
  ) then
    raise exception 'permission denied: match has already kicked off';
  end if;

  return new;
end;
$$;

drop trigger if exists predictions_protect_settlement on public.predictions;
create trigger predictions_protect_settlement
  before insert or update on public.predictions
  for each row execute function public.protect_prediction_settlement();

-- Fix double-counting in apply_prediction_points: predictions_sync_profile_points
-- already recomputes profiles.points whenever predictions.points_awarded changes.
create or replace function public.apply_prediction_points(p_prediction_id uuid, p_points integer)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_already integer;
begin
  select points_awarded into v_already
    from public.predictions where id = p_prediction_id for update;

  if not found then
    raise exception 'prediction % not found', p_prediction_id;
  end if;

  if v_already is not null then
    return;
  end if;

  update public.predictions set points_awarded = p_points where id = p_prediction_id;
end;
$$;

revoke all on function public.apply_prediction_points(uuid, integer) from public, anon, authenticated;
grant execute on function public.apply_prediction_points(uuid, integer) to service_role;

-- ---------------------------------------------------------------------
-- 2. EXTERNAL API CACHE: READ-ONLY FOR CLIENTS, WRITE ONLY SERVICE_ROLE
-- ---------------------------------------------------------------------
drop policy if exists "external_api_cache_insert_all" on public.external_api_cache;
drop policy if exists "external_api_cache_update_all" on public.external_api_cache;
drop policy if exists "external_api_cache_delete_admin" on public.external_api_cache;

revoke insert, update, delete on public.external_api_cache from anon, authenticated;
grant select on public.external_api_cache to anon, authenticated;
grant all on public.external_api_cache to postgres, service_role;

drop policy if exists "external_api_cache_write_service_role" on public.external_api_cache;
create policy "external_api_cache_write_service_role"
  on public.external_api_cache for all
  to service_role
  using (true)
  with check (true);

-- ---------------------------------------------------------------------
-- 3. CARDS, PACKS, DUELS & OPEN_CARD_PACK IDENTITY ENFORCEMENT
-- ---------------------------------------------------------------------
do $$
begin
  create type public.card_position as enum ('goalkeeper', 'defender', 'midfielder', 'forward');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.card_decade as enum (
    '1920s', '1930s', '1940s', '1950s', '1960s',
    '1970s', '1980s', '1990s', '2000s', '2010s', '2020s'
  );
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.card_duel_mode as enum ('quick_3', 'lineup_11');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.card_duel_status as enum ('waiting', 'in_progress', 'finished', 'abandoned');
exception when duplicate_object then null;
end $$;

create table if not exists public.cards (
  id                    uuid primary key default gen_random_uuid(),
  slug                  text not null unique,
  full_name             text not null,
  known_as              text not null,
  decade                public.card_decade not null,
  era_label             text not null,
  position              public.card_position not null,
  matches_played        integer not null check (matches_played >= 0),
  attack_power          smallint not null check (attack_power between 30 and 99),
  defense_power         smallint not null check (defense_power between 30 and 99),
  ovr                   smallint not null check (ovr between 50 and 99),
  photo_url             text not null,
  historical_crest_url  text,
  historical_crest_era  text not null default 'modern',
  bio_snippet           text,
  is_active             boolean not null default true,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

alter table public.cards enable row level security;
drop policy if exists "cards_read_all" on public.cards;
create policy "cards_read_all" on public.cards for select using (true);

create table if not exists public.user_cards (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles (id) on delete cascade,
  card_id       uuid not null references public.cards (id) on delete cascade,
  quantity      integer not null default 1 check (quantity >= 1),
  acquired_at   timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  constraint user_cards_unique_per_user unique (user_id, card_id)
);

create index if not exists user_cards_user_idx on public.user_cards (user_id);
create index if not exists user_cards_card_idx on public.user_cards (card_id);
alter table public.user_cards enable row level security;

create table if not exists public.user_packs (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles (id) on delete cascade,
  pack_type     text not null default 'standard' check (pack_type in (
    'aficionado', 'rojiblanco', 'leyenda',
    'standard', 'daily', 'streak', 'prediction_reward'
  )),
  card_count    smallint not null default 5 check (card_count between 1 and 11),
  is_opened     boolean not null default false,
  opened_at     timestamptz,
  created_at    timestamptz not null default now()
);

create index if not exists user_packs_user_unopened_idx on public.user_packs (user_id) where not is_opened;
alter table public.user_packs enable row level security;

create table if not exists public.card_duels (
  id                uuid primary key default gen_random_uuid(),
  host_user_id      uuid not null references public.profiles (id) on delete cascade,
  guest_user_id     uuid references public.profiles (id) on delete set null,
  mode              public.card_duel_mode not null default 'quick_3',
  status            public.card_duel_status not null default 'waiting',
  formation_host    text check (formation_host in ('4-3-3', '4-4-2', '3-5-2', '4-5-1', '3-4-3', '5-3-2', '5-2-3', '4-2-3-1')),
  formation_guest   text check (formation_guest in ('4-3-3', '4-4-2', '3-5-2', '4-5-1', '3-4-3', '5-3-2', '5-2-3', '4-2-3-1')),
  current_round     smallint not null default 1,
  rounds_total      smallint not null default 3 check (rounds_total in (3, 11)),
  host_score        smallint not null default 0 check (host_score >= 0),
  guest_score       smallint not null default 0 check (guest_score >= 0),
  winner_user_id    uuid references public.profiles (id) on delete set null,
  state             jsonb not null default '{}'::jsonb,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

alter table public.card_duels enable row level security;
drop policy if exists "user_cards_owner_manage" on public.user_cards;
drop policy if exists "user_cards_select" on public.user_cards;
create policy "user_cards_select_own"
  on public.user_cards for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "user_packs_owner_manage" on public.user_packs;
create policy "user_packs_select_own"
  on public.user_packs for select
  to authenticated
  using ((select auth.uid()) = user_id);

revoke insert, update, delete on public.user_cards from anon, authenticated;
revoke insert, update, delete on public.user_packs from anon, authenticated;
grant select on public.user_cards, public.user_packs to authenticated;
grant all on public.user_cards, public.user_packs to postgres, service_role;

drop policy if exists "card_duels_participants" on public.card_duels;
drop policy if exists "card_duels_select_participants" on public.card_duels;
create policy "card_duels_select_participants"
  on public.card_duels for select
  to authenticated
  using ((select auth.uid()) in (host_user_id, guest_user_id));

drop policy if exists "card_duels_insert_host" on public.card_duels;
create policy "card_duels_insert_host"
  on public.card_duels for insert
  to authenticated
  with check (
    (select auth.uid()) = host_user_id
    and (guest_user_id is null or host_user_id <> guest_user_id)
    and status = 'waiting'
    and not public.is_user_banned((select auth.uid()))
  );

revoke update, delete on public.card_duels from anon, authenticated;
grant select, insert on public.card_duels to authenticated;
grant all on public.card_duels to postgres, service_role;

create or replace function public.open_card_pack(
  p_pack_id uuid,
  p_user_id uuid
)
returns table (
  card_id uuid,
  slug text,
  known_as text,
  "position" public.card_position,
  decade public.card_decade,
  photo_url text,
  ovr smallint,
  is_new boolean
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_pack record;
  v_chosen_card record;
  v_already_owned boolean;
  v_guaranteed_legend_id uuid;
  v_guaranteed_quality_id uuid;
begin
  if current_setting('request.jwt.claim.role', true) is distinct from 'service_role'
     and session_user not in ('postgres', 'supabase_admin')
     and (auth.uid() is null or p_user_id is distinct from auth.uid()) then
    raise exception 'permission denied: cannot open pack for another user';
  end if;

  select * into v_pack
  from public.user_packs
  where id = p_pack_id and user_id = p_user_id and not is_opened
  for update;

  if not found then
    raise exception 'Pack not found, already opened or not owned by user';
  end if;

  update public.user_packs
  set is_opened = true,
      opened_at = now()
  where id = p_pack_id;

  if v_pack.pack_type = 'leyenda' then
    select c.id into v_guaranteed_legend_id
    from public.cards c
    where c.is_active and c.ovr >= 82
      and not exists (
        select 1 from public.user_cards uc
        where uc.user_id = p_user_id and uc.card_id = c.id
      )
    order by random()
    limit 1;

    if v_guaranteed_legend_id is null then
      select c.id into v_guaranteed_legend_id
      from public.cards c
      where c.is_active and c.ovr >= 82
      order by random()
      limit 1;
    end if;

  elsif v_pack.pack_type = 'rojiblanco' then
    select c.id into v_guaranteed_quality_id
    from public.cards c
    where c.is_active and c.ovr >= 75
    order by random()
    limit 1;
  end if;

  for v_chosen_card in (
    with selected as (
      select c.id, c.slug, c.known_as, c.position, c.decade, c.photo_url, c.ovr, 1 as priority
      from public.cards c
      where c.id in (coalesce(v_guaranteed_legend_id, '00000000-0000-0000-0000-000000000000'::uuid),
                     coalesce(v_guaranteed_quality_id, '00000000-0000-0000-0000-000000000000'::uuid))
      union all
      (
        select c.id, c.slug, c.known_as, c.position, c.decade, c.photo_url, c.ovr, 2 as priority
        from public.cards c
        where c.is_active
          and c.id not in (coalesce(v_guaranteed_legend_id, '00000000-0000-0000-0000-000000000000'::uuid),
                           coalesce(v_guaranteed_quality_id, '00000000-0000-0000-0000-000000000000'::uuid))
        order by random()
        limit v_pack.card_count
      )
    )
    select distinct on (id) id, slug, known_as, "position", decade, photo_url, ovr
    from selected
    order by id, priority asc
    limit v_pack.card_count
  ) loop
    select exists (
      select 1 from public.user_cards
      where user_id = p_user_id and public.user_cards.card_id = v_chosen_card.id
    ) into v_already_owned;

    insert into public.user_cards (user_id, card_id, quantity)
    values (p_user_id, v_chosen_card.id, 1)
    on conflict (user_id, card_id)
    do update set quantity = public.user_cards.quantity + 1, updated_at = now();

    card_id  := v_chosen_card.id;
    slug     := v_chosen_card.slug;
    known_as := v_chosen_card.known_as;
    "position" := v_chosen_card.position;
    decade   := v_chosen_card.decade;
    photo_url:= v_chosen_card.photo_url;
    ovr      := v_chosen_card.ovr;
    is_new   := not v_already_owned;
    return next;
  end loop;
end;
$$;

revoke all on function public.open_card_pack(uuid, uuid) from public, anon;
grant execute on function public.open_card_pack(uuid, uuid) to authenticated, service_role;

-- ---------------------------------------------------------------------
-- 4. POLL OPTIONS, FRIENDSHIPS, USER_REPORTS & REALTIME PUBLICATION
-- ---------------------------------------------------------------------
do $$
begin
  create type public.friendship_status as enum ('pending', 'accepted', 'declined');
exception when duplicate_object then null;
end $$;

create table if not exists public.friendships (
  id            uuid primary key default gen_random_uuid(),
  requester_id  uuid not null references public.profiles (id) on delete cascade,
  addressee_id  uuid not null references public.profiles (id) on delete cascade,
  status        public.friendship_status not null default 'pending',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  constraint friendships_no_self_friendship check (requester_id <> addressee_id),
  constraint friendships_unique_pair unique (requester_id, addressee_id)
);

create index if not exists friendships_requester_idx on public.friendships (requester_id, status);
create index if not exists friendships_addressee_idx on public.friendships (addressee_id, status);

drop trigger if exists friendships_set_updated_at on public.friendships;
create trigger friendships_set_updated_at
  before update on public.friendships
  for each row execute function public.set_updated_at();

alter table public.friendships enable row level security;
grant all on public.friendships to postgres, service_role;
grant select, insert, update, delete on public.friendships to authenticated;

drop policy if exists "friendships_select_own" on public.friendships;
create policy "friendships_select_own"
  on public.friendships for select
  to authenticated
  using ((select auth.uid()) = requester_id or (select auth.uid()) = addressee_id);

drop policy if exists "friendships_delete_involved" on public.friendships;
create policy "friendships_delete_involved"
  on public.friendships for delete
  to authenticated
  using ((select auth.uid()) = requester_id or (select auth.uid()) = addressee_id);

create table if not exists public.user_reports (
  id                uuid primary key default gen_random_uuid(),
  reporter_id       uuid references public.profiles (id) on delete set null,
  reported_id       uuid references public.profiles (id) on delete set null,
  conversation_id   uuid references public.conversations (id) on delete set null,
  category          text not null check (category in ('harassment', 'threats', 'spam_scam', 'impersonation', 'other')),
  details           text,
  evidence_snapshot text,
  status            text not null default 'pending' check (status in ('pending', 'reviewed', 'dismissed')),
  created_at        timestamptz not null default now(),
  constraint user_reports_distinct_parties_check
    check (reporter_id is null or reported_id is null or reporter_id <> reported_id)
);

create index if not exists user_reports_reported_idx on public.user_reports (reported_id, created_at desc);
create index if not exists user_reports_status_idx on public.user_reports (status, created_at desc);

alter table public.user_reports enable row level security;
grant all on public.user_reports to postgres, service_role;
grant select, insert, update on public.user_reports to authenticated;

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

do $$
begin
  if to_regclass('public.poll_options') is not null then
    drop policy if exists "Authenticated users can insert poll options" on public.poll_options;
    drop policy if exists "poll_options_insert_own_post" on public.poll_options;
    create policy "poll_options_insert_own_post"
      on public.poll_options for insert
      to authenticated
      with check (
        exists (
          select 1
          from public.polls p
          join public.posts po on po.id = p.post_id
          where p.id = poll_options.poll_id
            and po.user_id = (select auth.uid())
        )
      );
  end if;

  if to_regclass('public.friendships') is not null then
    drop policy if exists "friendships_insert_requester" on public.friendships;
    create policy "friendships_insert_requester"
      on public.friendships for insert
      to authenticated
      with check (
        (select auth.uid()) = requester_id
        and requester_id <> addressee_id
        and status = 'pending'
        and not public.is_user_banned((select auth.uid()))
      );

    drop policy if exists "friendships_update_addressee" on public.friendships;
    create policy "friendships_update_addressee"
      on public.friendships for update
      to authenticated
      using (
        (select auth.uid()) = addressee_id
        and status = 'pending'
      )
      with check (
        (select auth.uid()) = addressee_id
        and status in ('accepted', 'declined')
      );

    if not exists (
      select 1
      from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = 'friendships'
    ) then
      alter publication supabase_realtime add table public.friendships;
    end if;
  end if;
end $$;

-- ---------------------------------------------------------------------
-- 5. DIRECT MESSAGES: FRIENDSHIP/BAN CHECK & SOFT-DELETE RPC
-- ---------------------------------------------------------------------
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
  if public.is_user_banned(v_me) or public.is_user_banned(p_other_user) then
    raise exception 'not allowed';
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

  select id into v_id from public.conversations where direct_key = v_key;
  if v_id is not null then
    return v_id;
  end if;

  if not exists (
    select 1 from public.friendships f
     where f.status = 'accepted'
       and (
         (f.requester_id = v_me and f.addressee_id = p_other_user)
         or (f.requester_id = p_other_user and f.addressee_id = v_me)
       )
  ) then
    raise exception 'friendship required to start conversation';
  end if;

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

create or replace function public.soft_delete_direct_message(p_message_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_me uuid := auth.uid();
begin
  if v_me is null then
    raise exception 'not authenticated';
  end if;

  update public.messages
     set deleted_at = now()
   where id = p_message_id
     and sender_id = v_me
     and deleted_at is null;

  return found;
end;
$$;

revoke all on function public.soft_delete_direct_message(uuid) from public, anon;
grant execute on function public.soft_delete_direct_message(uuid) to authenticated;

-- ---------------------------------------------------------------------
-- 6. POSTS, POST_LIKES & PROFILES ANON GRANT
-- ---------------------------------------------------------------------
drop policy if exists "posts_select_admin" on public.posts;
create policy "posts_select_admin"
  on public.posts for select
  to authenticated
  using (public.is_admin());

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

  if old.deleted_at is not null and new.deleted_at is null then
    raise exception 'permission denied: cannot restore deleted post';
  end if;

  return new;
end;
$$;

drop trigger if exists posts_protect_moderation_columns on public.posts;
create trigger posts_protect_moderation_columns
  before update on public.posts
  for each row execute function public.protect_post_moderation_columns();

grant select (is_banned) on public.profiles to anon;

create table if not exists public.post_likes (
  post_id    uuid not null references public.posts (id) on delete cascade,
  user_id    uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

create index if not exists post_likes_user_idx
  on public.post_likes (user_id, created_at desc);

alter table public.post_likes enable row level security;

drop policy if exists "post_likes_select_all" on public.post_likes;
create policy "post_likes_select_all"
  on public.post_likes for select
  to anon, authenticated
  using (true);

drop policy if exists "post_likes_insert_own" on public.post_likes;
create policy "post_likes_insert_own"
  on public.post_likes for insert
  to authenticated
  with check (
    (select auth.uid()) = user_id
    and not public.is_user_banned((select auth.uid()))
  );

drop policy if exists "post_likes_delete_own" on public.post_likes;
create policy "post_likes_delete_own"
  on public.post_likes for delete
  to authenticated
  using ((select auth.uid()) = user_id);

grant all on public.post_likes to postgres, service_role;
grant select on public.post_likes to anon, authenticated;
grant insert, delete on public.post_likes to authenticated;

-- ---------------------------------------------------------------------
-- 7. LA GRADA & AGGREGATION RPCS (AVOIDING 42501 & 1000-ROW TRUNCATION)
-- ---------------------------------------------------------------------
create or replace function public.cast_match_mvp_vote(p_match_id text, p_player_id text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_me uuid := auth.uid();
begin
  if v_me is null then
    raise exception 'not authenticated';
  end if;
  if public.is_user_banned(v_me) then
    raise exception 'user is banned';
  end if;

  insert into public.match_mvp_votes (match_id, user_id, player_id)
  values (p_match_id, v_me, p_player_id)
  on conflict (match_id, user_id)
  do update set player_id = excluded.player_id, updated_at = now();
end;
$$;

revoke all on function public.cast_match_mvp_vote(text, text) from public, anon;
grant execute on function public.cast_match_mvp_vote(text, text) to authenticated;

create or replace function public.upsert_match_player_rating(
  p_match_id text,
  p_target_id text,
  p_rating smallint
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_me uuid := auth.uid();
begin
  if v_me is null then
    raise exception 'not authenticated';
  end if;
  if public.is_user_banned(v_me) then
    raise exception 'user is banned';
  end if;
  if p_rating < 0 or p_rating > 10 then
    raise exception 'invalid rating';
  end if;

  insert into public.match_player_ratings (match_id, user_id, target_id, rating)
  values (p_match_id, v_me, p_target_id, p_rating)
  on conflict (match_id, user_id, target_id)
  do update set rating = excluded.rating, updated_at = now();
end;
$$;

revoke all on function public.upsert_match_player_rating(text, text, smallint) from public, anon;
grant execute on function public.upsert_match_player_rating(text, text, smallint) to authenticated;

create or replace function public.get_match_mvp_summary(p_match_id text)
returns table (
  player_id text,
  votes bigint
)
language sql
stable
security definer
set search_path = ''
as $$
  select m.player_id, count(*)::bigint as votes
  from public.match_mvp_votes m
  where m.match_id = p_match_id
  group by m.player_id
  order by votes desc;
$$;

revoke all on function public.get_match_mvp_summary(text) from public;
grant execute on function public.get_match_mvp_summary(text) to anon, authenticated, service_role;

create or replace function public.get_match_player_ratings_summary(p_match_id text)
returns table (
  target_id text,
  avg_rating numeric,
  votes bigint
)
language sql
stable
security definer
set search_path = ''
as $$
  select r.target_id, round(avg(r.rating)::numeric, 2) as avg_rating, count(*)::bigint as votes
  from public.match_player_ratings r
  where r.match_id = p_match_id
  group by r.target_id;
$$;

revoke all on function public.get_match_player_ratings_summary(text) from public;
grant execute on function public.get_match_player_ratings_summary(text) to anon, authenticated, service_role;

create or replace function public.get_porra_leaderboard_stats(p_limit integer default 500)
returns table (
  user_id uuid,
  username text,
  display_name text,
  points integer,
  predictions_count bigint,
  exact_hits bigint
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    p.id as user_id,
    p.username::text as username,
    p.display_name,
    p.points,
    count(pr.id)::bigint as predictions_count,
    count(pr.id) filter (where pr.points_awarded >= 3)::bigint as exact_hits
  from public.profiles p
  left join public.predictions pr on pr.user_id = p.id
  where p.is_banned = false
  group by p.id, p.username, p.display_name, p.points
  order by p.points desc, exact_hits desc, p.username asc
  limit greatest(1, least(coalesce(p_limit, 500), 1000));
$$;

revoke all on function public.get_porra_leaderboard_stats(integer) from public;
grant execute on function public.get_porra_leaderboard_stats(integer) to anon, authenticated, service_role;

create or replace function public.get_admin_telemetry_summary(p_days integer default 30)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_days integer := greatest(1, least(coalesce(p_days, 30), 365));
  v_since timestamptz := now() - make_interval(days => v_days);
  v_result jsonb;
begin
  if current_setting('request.jwt.claim.role', true) is distinct from 'service_role'
     and not public.is_admin() then
    raise exception 'permission denied: admin role required';
  end if;

  select jsonb_build_object(
    'total_visits', (select count(*) from public.site_visits where created_at >= v_since),
    'pwa_visits', (select count(*) from public.site_visits where created_at >= v_since and is_pwa = true),
    'avg_duration_seconds', (select coalesce(round(avg(duration_seconds)), 0) from public.site_visits where created_at >= v_since),
    'unique_sessions', (select count(distinct session_id) from public.site_visits where created_at >= v_since and session_id is not null),
    'by_device', coalesce((
      select jsonb_agg(row_to_json(d)) from (
        select device_type, count(*)::bigint as visits
        from public.site_visits
        where created_at >= v_since
        group by device_type
        order by visits desc
      ) d
    ), '[]'::jsonb),
    'top_paths', coalesce((
      select jsonb_agg(row_to_json(p)) from (
        select pathname, count(*)::bigint as visits
        from public.site_visits
        where created_at >= v_since
        group by pathname
        order by visits desc
        limit 20
      ) p
    ), '[]'::jsonb),
    'by_province', coalesce((
      select jsonb_agg(row_to_json(pr)) from (
        select province, count(*)::bigint as visits
        from public.site_visits
        where created_at >= v_since
        group by province
        order by visits desc
        limit 20
      ) pr
    ), '[]'::jsonb),
    'by_day', coalesce((
      select jsonb_agg(row_to_json(dy)) from (
        select date_trunc('day', created_at)::date::text as day, count(*)::bigint as visits
        from public.site_visits
        where created_at >= v_since
        group by date_trunc('day', created_at)
        order by day desc
      ) dy
    ), '[]'::jsonb)
  ) into v_result;

  return v_result;
end;
$$;

revoke all on function public.get_admin_telemetry_summary(integer) from public, anon;
grant execute on function public.get_admin_telemetry_summary(integer) to authenticated, service_role;

-- ---------------------------------------------------------------------
-- 8. CLOSE ANON ENUMERATION ORACLE ON IS_ADMIN & IS_USER_BANNED
-- ---------------------------------------------------------------------
revoke all on function public.is_admin(uuid) from public, anon;
grant execute on function public.is_admin(uuid) to authenticated, service_role;

revoke all on function public.is_user_banned(uuid) from public, anon;
grant execute on function public.is_user_banned(uuid) to authenticated, service_role;

-- ---------------------------------------------------------------------
-- 9. LEGAL CUSTODY ON ACCOUNT DELETION & HANDLE_NEW_USER CITEXT FIX
-- ---------------------------------------------------------------------
do $$
begin
  if to_regclass('public.admin_audit_logs') is not null then
    alter table public.admin_audit_logs
      alter column admin_id drop not null,
      drop constraint if exists admin_audit_logs_admin_id_fkey,
      add constraint admin_audit_logs_admin_id_fkey
        foreign key (admin_id) references auth.users (id) on delete set null;
  end if;

  if to_regclass('public.user_reports') is not null then
    alter table public.user_reports
      alter column reporter_id drop not null,
      alter column reported_id drop not null,
      drop constraint if exists user_reports_reporter_id_fkey,
      drop constraint if exists user_reports_reported_id_fkey,
      drop constraint if exists user_reports_check,
      drop constraint if exists user_reports_distinct_parties_check,
      add constraint user_reports_reporter_id_fkey
        foreign key (reporter_id) references public.profiles (id) on delete set null,
      add constraint user_reports_reported_id_fkey
        foreign key (reported_id) references public.profiles (id) on delete set null,
      add constraint user_reports_distinct_parties_check
        check (reporter_id is null or reported_id is null or reporter_id <> reported_id);
  end if;

  if to_regclass('public.blocked_post_attempts') is not null then
    alter table public.blocked_post_attempts
      alter column user_id drop not null,
      drop constraint if exists blocked_post_attempts_user_id_fkey,
      add constraint blocked_post_attempts_user_id_fkey
        foreign key (user_id) references public.profiles (id) on delete set null;
  end if;

  if to_regclass('public.messages') is not null then
    alter table public.messages
      alter column sender_id drop not null,
      drop constraint if exists messages_sender_id_fkey,
      add constraint messages_sender_id_fkey
        foreign key (sender_id) references public.profiles (id) on delete set null;
  end if;
end $$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_raw_username text;
  v_clean_username text;
  v_final_username text;
  v_suffix int := 0;
begin
  v_raw_username := new.raw_user_meta_data->>'username';
  if v_raw_username is null or length(trim(v_raw_username)) = 0 then
    v_raw_username := split_part(split_part(coalesce(new.email, 'sportinguista'), '@', 1), '+', 1);
  end if;

  v_clean_username := lower(regexp_replace(v_raw_username, '[^a-zA-Z0-9_]', '_', 'g'));
  v_clean_username := regexp_replace(v_clean_username, '_+', '_', 'g');
  v_clean_username := trim(both '_' from v_clean_username);

  if length(v_clean_username) = 0 then
    v_clean_username := 'sportinguista';
  elsif length(v_clean_username) < 3 then
    v_clean_username := rpad(v_clean_username, 3, '0');
  end if;

  if length(v_clean_username) > 20 then
    v_clean_username := substr(v_clean_username, 1, 20);
  end if;

  v_final_username := v_clean_username;
  while exists (select 1 from public.profiles where lower(username::text) = v_final_username) loop
    v_suffix := v_suffix + 1;
    v_final_username := substr(v_clean_username, 1, 20 - length('_' || v_suffix::text)) || '_' || v_suffix::text;
  end loop;

  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    v_final_username,
    coalesce(new.raw_user_meta_data->>'display_name', v_final_username)
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

-- ---------------------------------------------------------------------
-- 10. STORAGE BUCKET HARDENING (AVATARS: 2 MB & ALLOWED IMAGE MIMES)
-- ---------------------------------------------------------------------
update storage.buckets
   set file_size_limit = 2097152,
       allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp']
 where id = 'avatars';

commit;
