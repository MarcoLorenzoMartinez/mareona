-- =====================================================================
-- V1.0 AUDIT HARDENING: ACCOUNT STATE PRIVACY, PORRA LOCK & RATINGS FIX
-- =====================================================================
-- Forward-only, non-destructive migration safe to apply via Supabase SQL Editor:
-- 1. Adds `storage_entries` jsonb to `public.user_account_state` so game
--    progress is persisted directly on the private RLS-protected table.
-- 2. Backfills any `user_account_state:<uuid>` snapshots stored in
--    `public.external_api_cache` and removes private keys from public cache.
-- 3. Revokes direct client INSERT/UPDATE/DELETE on `public.user_account_state`
--    and `public.predictions` so only authoritative Server Actions (`service_role`)
--    can mutate album balances, missions, game progress, and Porra picks.
-- 4. Excludes N/C (rating = 0) entries from `get_match_player_ratings_summary`.
-- 5. Hydrates Google OAuth full_name/name and avatar_url in `handle_new_user`.

begin;

-- ---------------------------------------------------------------------
-- 1. PERSIST GAME PROGRESS ON USER_ACCOUNT_STATE & PURGE PUBLIC CACHE LEAK
-- ---------------------------------------------------------------------
alter table public.user_account_state
  add column if not exists storage_entries jsonb not null default '{}'::jsonb;

-- Safely migrate any snapshots previously buffered in external_api_cache
do $$
begin
  if to_regclass('public.external_api_cache') is not null then
    insert into public.user_account_state (
      user_id,
      cards,
      packs,
      missions,
      storage_entries,
      has_activity,
      revision,
      updated_at
    )
    select
      p.id,
      coalesce(c.payload->'cards', '{}'::jsonb),
      coalesce(c.payload->'packs', '{"aficionado":1,"rojiblanco":1,"leyenda":0}'::jsonb),
      coalesce(c.payload->'missions', '{}'::jsonb),
      coalesce(c.payload->'storageEntries', '{}'::jsonb),
      coalesce((c.payload->>'hasActivity')::boolean, false),
      greatest(1, coalesce((c.payload->>'revision')::integer, 1)),
      coalesce((c.payload->>'updatedAt')::timestamptz, c.fetched_at, now())
    from public.external_api_cache c
    join public.profiles p
      on c.cache_key = ('user_account_state:' || p.id::text)
    where jsonb_typeof(c.payload) = 'object'
    on conflict (user_id) do update
      set storage_entries = case
            when excluded.revision >= public.user_account_state.revision
                 and excluded.storage_entries <> '{}'::jsonb
              then excluded.storage_entries
            when public.user_account_state.storage_entries = '{}'::jsonb
              then excluded.storage_entries
            else public.user_account_state.storage_entries
          end,
          cards = case
            when excluded.revision > public.user_account_state.revision then excluded.cards
            else public.user_account_state.cards
          end,
          packs = case
            when excluded.revision > public.user_account_state.revision then excluded.packs
            else public.user_account_state.packs
          end,
          missions = case
            when excluded.revision > public.user_account_state.revision then excluded.missions
            else public.user_account_state.missions
          end,
          has_activity = public.user_account_state.has_activity or excluded.has_activity,
          revision = greatest(public.user_account_state.revision, excluded.revision),
          updated_at = greatest(public.user_account_state.updated_at, excluded.updated_at);

    delete from public.external_api_cache
     where cache_key like 'user_account_state:%';
  end if;
end $$;

-- Lock user_account_state mutations exclusively to service_role (Server Actions)
drop policy if exists "user_account_state_insert_own" on public.user_account_state;
drop policy if exists "user_account_state_update_own" on public.user_account_state;
revoke insert, update, delete on public.user_account_state from anon, authenticated;

-- ---------------------------------------------------------------------
-- 2. LOCK PREDICTIONS (LA PORRA) WRITES TO SERVER ACTIONS / SERVICE ROLE
-- ---------------------------------------------------------------------
drop policy if exists "predictions_insert_own" on public.predictions;
drop policy if exists "predictions_update_own" on public.predictions;
revoke insert, update, delete on public.predictions from anon, authenticated;

-- ---------------------------------------------------------------------
-- 3. EXCLUDE N/C (rating = 0) FROM MATCH PLAYER RATINGS AVERAGE
-- ---------------------------------------------------------------------
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
    and r.rating > 0
  group by r.target_id;
$$;

revoke all on function public.get_match_player_ratings_summary(text) from public;
grant execute on function public.get_match_player_ratings_summary(text) to anon, authenticated, service_role;

-- ---------------------------------------------------------------------
-- 4. HYDRATE GOOGLE OAUTH DISPLAY NAME & AVATAR IN HANDLE_NEW_USER
-- ---------------------------------------------------------------------
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
  v_display_name text;
  v_avatar_url text;
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

  v_display_name := coalesce(
    nullif(trim(new.raw_user_meta_data->>'display_name'), ''),
    nullif(trim(new.raw_user_meta_data->>'full_name'), ''),
    nullif(trim(new.raw_user_meta_data->>'name'), ''),
    v_final_username
  );

  v_avatar_url := nullif(
    trim(coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture')),
    ''
  );

  insert into public.profiles (id, username, display_name, avatar_url)
  values (
    new.id,
    v_final_username,
    v_display_name,
    v_avatar_url
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

commit;
