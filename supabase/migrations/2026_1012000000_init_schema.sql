-- =====================================================================
-- EXTENSIONES Y TIPOS
-- =====================================================================
create extension if not exists "pgcrypto";
create extension if not exists "citext";

create type public.match_status as enum (
  'scheduled', 'live', 'finished', 'postponed', 'cancelled'
);

-- =====================================================================
-- TRIGGER COMÚN updated_at
-- =====================================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- =====================================================================
-- PROFILES (1:1 auth.users)
-- =====================================================================
create table public.profiles (
  id            uuid primary key references auth.users (id) on delete cascade,
  username      citext not null unique check (username ~ '^[a-zA-Z0-9_]{3,20}$'),
  display_name  text check (char_length(display_name) between 1 and 40),
  avatar_url    text,
  points        integer not null default 0 check (points >= 0),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index profiles_points_idx on public.profiles (points desc);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, username)
  values (
    new.id,
    'aficionado_' || substr(replace(new.id::text, '-', ''), 1, 8)
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =====================================================================
-- TEAMS
-- =====================================================================
create table public.teams (
  id            uuid primary key default gen_random_uuid(),
  external_id   text not null unique,
  name          text not null,
  short_name    text,
  crest_url     text,
  is_home_club  boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create unique index teams_single_home_club_idx
  on public.teams (is_home_club) where is_home_club;

create trigger teams_set_updated_at
  before update on public.teams
  for each row execute function public.set_updated_at();

-- =====================================================================
-- MATCHES
-- =====================================================================
create table public.matches (
  id            uuid primary key default gen_random_uuid(),
  external_id   text not null unique,
  competition   text not null,
  season        text not null,
  matchday      smallint check (matchday > 0),
  kickoff_at    timestamptz not null,
  status        public.match_status not null default 'scheduled',
  home_team_id  uuid not null references public.teams (id),
  away_team_id  uuid not null references public.teams (id),
  home_score    smallint check (home_score >= 0),
  away_score    smallint check (away_score >= 0),
  venue         text,
  lineups       jsonb,
  events        jsonb,
  synced_at     timestamptz not null default now(),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index matches_kickoff_idx on public.matches (kickoff_at);
create index matches_status_kickoff_idx on public.matches (status, kickoff_at);
create index matches_home_team_idx on public.matches (home_team_id);
create index matches_away_team_idx on public.matches (away_team_id);

create trigger matches_set_updated_at
  before update on public.matches
  for each row execute function public.set_updated_at();

-- =====================================================================
-- PLAYERS
-- =====================================================================
create table public.players (
  id              uuid primary key default gen_random_uuid(),
  external_id     text not null unique,
  team_id         uuid references public.teams (id) on delete set null,
  full_name       text not null,
  known_as        text,
  field_position  text check (field_position in ('goalkeeper', 'defender', 'midfielder', 'forward')),
  shirt_number    smallint check (shirt_number between 1 and 99),
  nationality     text,
  birth_date      date,
  photo_url       text,
  is_active       boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index players_team_active_idx on public.players (team_id) where is_active;

create trigger players_set_updated_at
  before update on public.players
  for each row execute function public.set_updated_at();

-- =====================================================================
-- STANDINGS
-- =====================================================================
create table public.standings (
  id              uuid primary key default gen_random_uuid(),
  competition     text not null,
  season          text not null,
  team_id         uuid not null references public.teams (id) on delete cascade,
  table_position  smallint not null check (table_position > 0),
  played          smallint not null default 0 check (played >= 0),
  won             smallint not null default 0 check (won >= 0),
  drawn           smallint not null default 0 check (drawn >= 0),
  lost            smallint not null default 0 check (lost >= 0),
  goals_for       smallint not null default 0 check (goals_for >= 0),
  goals_against   smallint not null default 0 check (goals_against >= 0),
  points          smallint not null default 0,
  synced_at       timestamptz not null default now(),
  constraint standings_one_row_per_team unique (competition, season, team_id)
);

create index standings_table_idx on public.standings (competition, season, table_position);

-- =====================================================================
-- EXTERNAL API CACHE
-- =====================================================================
create table public.external_api_cache (
  cache_key     text primary key,
  payload       jsonb not null,
  fetched_at    timestamptz not null default now(),
  expires_at    timestamptz not null
);

create index external_api_cache_expires_idx on public.external_api_cache (expires_at);

-- =====================================================================
-- PREDICTIONS (Porra)
-- =====================================================================
create table public.predictions (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references public.profiles (id) on delete cascade,
  match_id       uuid not null references public.matches (id) on delete cascade,
  home_score     smallint not null check (home_score between 0 and 20),
  away_score     smallint not null check (away_score between 0 and 20),
  points_awarded integer check (points_awarded >= 0),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  constraint predictions_one_per_user_match unique (user_id, match_id)
);

create index predictions_match_idx on public.predictions (match_id);
create index predictions_user_idx  on public.predictions (user_id, created_at desc);

create trigger predictions_set_updated_at
  before update on public.predictions
  for each row execute function public.set_updated_at();

-- =====================================================================
-- POSTS (Feed y chat general)
-- =====================================================================
create table public.posts (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles (id) on delete cascade,
  match_id    uuid references public.matches (id) on delete set null,
  parent_id   uuid references public.posts (id) on delete cascade,
  body        text not null check (char_length(btrim(body)) between 1 and 500),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  deleted_at  timestamptz
);

create index posts_feed_idx   on public.posts (created_at desc) where deleted_at is null;
create index posts_match_idx  on public.posts (match_id, created_at desc) where deleted_at is null;
create index posts_parent_idx on public.posts (parent_id) where parent_id is not null;
create index posts_user_idx   on public.posts (user_id, created_at desc);

create trigger posts_set_updated_at
  before update on public.posts
  for each row execute function public.set_updated_at();

-- =====================================================================
-- CHATS PRIVADOS Y BLOQUEOS
-- =====================================================================
create table public.conversations (
  id          uuid primary key default gen_random_uuid(),
  direct_key  text not null unique,
  created_at  timestamptz not null default now()
);

create table public.conversation_members (
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  user_id         uuid not null references public.profiles (id) on delete cascade,
  joined_at       timestamptz not null default now(),
  last_read_at    timestamptz,
  primary key (conversation_id, user_id)
);

create index conversation_members_user_idx on public.conversation_members (user_id);

create table public.messages (
  id               uuid primary key default gen_random_uuid(),
  conversation_id  uuid not null references public.conversations (id) on delete cascade,
  sender_id        uuid not null references public.profiles (id) on delete cascade,
  body             text not null check (char_length(btrim(body)) between 1 and 2000),
  created_at       timestamptz not null default now(),
  deleted_at       timestamptz
);

create index messages_conversation_idx on public.messages (conversation_id, created_at desc);

create table public.user_blocks (
  blocker_id  uuid not null references public.profiles (id) on delete cascade,
  blocked_id  uuid not null references public.profiles (id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (blocker_id, blocked_id),
  check (blocker_id <> blocked_id)
);

create or replace function public.is_conversation_member(p_conversation_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.conversation_members cm
     where cm.conversation_id = p_conversation_id
       and cm.user_id = (select auth.uid())
  );
$$;

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
          on b.blocker_id = other.user_id
         and b.blocked_id = (select auth.uid())
       where other.conversation_id = p_conversation_id
         and other.user_id <> (select auth.uid())
    );
$$;

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
     where blocker_id = p_other_user and blocked_id = v_me
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

revoke all on function public.is_conversation_member(uuid) from public, anon;
revoke all on function public.can_message_conversation(uuid) from public, anon;
revoke all on function public.get_or_create_direct_conversation(uuid) from public, anon;
grant execute on function public.is_conversation_member(uuid) to authenticated;
grant execute on function public.can_message_conversation(uuid) to authenticated;
grant execute on function public.get_or_create_direct_conversation(uuid) to authenticated;

alter publication supabase_realtime add table public.matches, public.posts, public.messages;

-- =====================================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================================
alter table public.profiles enable row level security;
alter table public.matches enable row level security;
alter table public.external_api_cache enable row level security;
alter table public.predictions enable row level security;
alter table public.posts enable row level security;
alter table public.teams enable row level security;
alter table public.players enable row level security;
alter table public.standings enable row level security;
alter table public.conversations enable row level security;
alter table public.conversation_members enable row level security;
alter table public.messages enable row level security;
alter table public.user_blocks enable row level security;

-- profiles
create policy "profiles_select_public" on public.profiles for select to anon, authenticated using (true);
create policy "profiles_update_own" on public.profiles for update to authenticated
  using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
revoke update on public.profiles from authenticated;
grant update (username, display_name, avatar_url) on public.profiles to authenticated;

-- matches, teams, players, standings
create policy "matches_select_public" on public.matches for select to anon, authenticated using (true);
create policy "teams_select_public" on public.teams for select to anon, authenticated using (true);
create policy "players_select_public" on public.players for select to anon, authenticated using (true);
create policy "standings_select_public" on public.standings for select to anon, authenticated using (true);

-- predictions
create policy "predictions_select_own_or_after_kickoff" on public.predictions for select to authenticated
  using (
    (select auth.uid()) = user_id
    or exists (select 1 from public.matches m where m.id = predictions.match_id and m.kickoff_at <= now())
  );

create policy "predictions_insert_own_before_kickoff" on public.predictions for insert to authenticated
  with check (
    (select auth.uid()) = user_id
    and points_awarded is null
    and exists (select 1 from public.matches m where m.id = predictions.match_id and m.status = 'scheduled' and m.kickoff_at > now())
  );

create policy "predictions_update_own_before_kickoff" on public.predictions for update to authenticated
  using (
    (select auth.uid()) = user_id
    and exists (select 1 from public.matches m where m.id = predictions.match_id and m.status = 'scheduled' and m.kickoff_at > now())
  )
  with check ((select auth.uid()) = user_id and points_awarded is null);

revoke update on public.predictions from authenticated;
grant update (home_score, away_score) on public.predictions to authenticated;

-- posts
create policy "posts_select_public_visible" on public.posts for select to anon, authenticated using (deleted_at is null);
create policy "posts_insert_own" on public.posts for insert to authenticated
  with check ((select auth.uid()) = user_id and deleted_at is null);
create policy "posts_update_own" on public.posts for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
revoke update on public.posts from authenticated;
grant update (body, deleted_at) on public.posts to authenticated;

-- direct messaging & blocks
create policy "conversations_select_member" on public.conversations for select to authenticated
  using (public.is_conversation_member(id));

create policy "conversation_members_select_member" on public.conversation_members for select to authenticated
  using (public.is_conversation_member(conversation_id));

create policy "conversation_members_update_own_read" on public.conversation_members for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
revoke update on public.conversation_members from authenticated;
grant update (last_read_at) on public.conversation_members to authenticated;

create policy "messages_select_member" on public.messages for select to authenticated
  using (public.is_conversation_member(conversation_id) and deleted_at is null);

create policy "messages_insert_member_not_blocked" on public.messages for insert to authenticated
  with check (
    (select auth.uid()) = sender_id
    and deleted_at is null
    and public.can_message_conversation(conversation_id)
  );

create policy "user_blocks_select_own" on public.user_blocks for select to authenticated using ((select auth.uid()) = blocker_id);
create policy "user_blocks_insert_own" on public.user_blocks for insert to authenticated with check ((select auth.uid()) = blocker_id);
create policy "user_blocks_delete_own" on public.user_blocks for delete to authenticated using ((select auth.uid()) = blocker_id);

-- =====================================================================
-- FUNCIÓN ATÓMICA DE LIQUIDACIÓN DE PUNTOS
-- =====================================================================
create or replace function public.apply_prediction_points(p_prediction_id uuid, p_points integer)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid;
  v_already integer;
begin
  select user_id, points_awarded into v_user_id, v_already
    from public.predictions where id = p_prediction_id for update;

  if not found then
    raise exception 'prediction % not found', p_prediction_id;
  end if;

  if v_already is not null then
    return;
  end if;

  update public.predictions set points_awarded = p_points where id = p_prediction_id;
  update public.profiles set points = points + p_points where id = v_user_id;
end;
$$;

revoke all on function public.apply_prediction_points(uuid, integer) from public, anon, authenticated;
grant execute on function public.apply_prediction_points(uuid, integer) to service_role;