-- =====================================================================
-- CARDS, PACKS AND CARD DUELS SCHEMA (Mareona Historical Collection)
-- =====================================================================

-- Enums
create type public.card_position as enum (
  'goalkeeper', 'defender', 'midfielder', 'forward'
);

create type public.card_decade as enum (
  '1920s', '1930s', '1940s', '1950s', '1960s',
  '1970s', '1980s', '1990s', '2000s', '2010s', '2020s'
);

create type public.card_duel_mode as enum (
  'quick_3', 'lineup_11'
);

create type public.card_duel_status as enum (
  'waiting', 'in_progress', 'finished', 'abandoned'
);

-- =====================================================================
-- 1. CARDS (Catálogo maestro de cromos históricos)
-- =====================================================================
create table public.cards (
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

create index cards_decade_idx on public.cards (decade);
create index cards_position_idx on public.cards (position);
create index cards_ovr_idx on public.cards (ovr desc);

create trigger cards_set_updated_at
  before update on public.cards
  for each row execute function public.set_updated_at();

alter table public.cards enable row level security;

create policy "cards_read_all"
  on public.cards for select
  using (true);

-- =====================================================================
-- 2. USER_CARDS (Inventario de cromos del aficionado y repetidos)
-- =====================================================================
create table public.user_cards (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles (id) on delete cascade,
  card_id       uuid not null references public.cards (id) on delete cascade,
  quantity      integer not null default 1 check (quantity >= 1),
  acquired_at   timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  constraint user_cards_unique_per_user unique (user_id, card_id)
);

create index user_cards_user_idx on public.user_cards (user_id);
create index user_cards_card_idx on public.user_cards (card_id);

create trigger user_cards_set_updated_at
  before update on public.user_cards
  for each row execute function public.set_updated_at();

alter table public.user_cards enable row level security;

-- Los usuarios pueden ver la colección de otros usuarios (para ver álbum e intercambiar)
create policy "user_cards_select"
  on public.user_cards for select
  using (true);

create policy "user_cards_owner_manage"
  on public.user_cards for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- =====================================================================
-- 3. USER_PACKS (Sobres de cromos en inventario)
-- =====================================================================
create table public.user_packs (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles (id) on delete cascade,
  pack_type     text not null default 'standard' check (pack_type in ('standard', 'daily', 'streak', 'prediction_reward')),
  card_count    smallint not null default 5 check (card_count between 1 and 11),
  is_opened     boolean not null default false,
  opened_at     timestamptz,
  created_at    timestamptz not null default now()
);

create index user_packs_user_unopened_idx on public.user_packs (user_id) where not is_opened;

alter table public.user_packs enable row level security;

create policy "user_packs_owner_manage"
  on public.user_packs for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- =====================================================================
-- 4. CARD_DUELS (Partidas de Super-Trunfo y Duelo de Once Inicial)
-- =====================================================================
create table public.card_duels (
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

create index card_duels_host_idx on public.card_duels (host_user_id, status);
create index card_duels_guest_idx on public.card_duels (guest_user_id, status);

create trigger card_duels_set_updated_at
  before update on public.card_duels
  for each row execute function public.set_updated_at();

alter table public.card_duels enable row level security;

create policy "card_duels_participants"
  on public.card_duels for all
  using (
    auth.uid() = host_user_id or
    auth.uid() = guest_user_id or
    guest_user_id is null
  )
  with check (
    auth.uid() = host_user_id or
    auth.uid() = guest_user_id
  );

-- =====================================================================
-- 5. RPC FUNCTION: Apertura atómica de sobre (open_card_pack)
-- =====================================================================
create or replace function public.open_card_pack(
  p_pack_id uuid,
  p_user_id uuid
)
returns table (
  card_id uuid,
  slug text,
  known_as text,
  position public.card_position,
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
begin
  -- 1. Validar propiedad y estado del sobre
  select * into v_pack
  from public.user_packs
  where id = p_pack_id and user_id = p_user_id and not is_opened
  for update;

  if not found then
    raise exception 'Pack not found, already opened or not owned by user';
  end if;

  -- 2. Marcar sobre como abierto
  update public.user_packs
  set is_opened = true,
      opened_at = now()
  where id = p_pack_id;

  -- 3. Seleccionar N cartas aleatorias del catálogo activo (sin trampa, probabilidad uniforme)
  for v_chosen_card in (
    select c.id, c.slug, c.known_as, c.position, c.decade, c.photo_url, c.ovr
    from public.cards c
    where c.is_active
    order by random()
    limit v_pack.card_count
  ) loop
    -- Comprobar si ya existe en la colección del aficionado
    select exists (
      select 1 from public.user_cards
      where user_id = p_user_id and public.user_cards.card_id = v_chosen_card.id
    ) into v_already_owned;

    -- Upsert en inventario
    insert into public.user_cards (user_id, card_id, quantity)
    values (p_user_id, v_chosen_card.id, 1)
    on conflict (user_id, card_id)
    do update set quantity = public.user_cards.quantity + 1, updated_at = now();

    -- Devolver datos para la animación en el cliente
    card_id  := v_chosen_card.id;
    slug     := v_chosen_card.slug;
    known_as := v_chosen_card.known_as;
    position := v_chosen_card.position;
    decade   := v_chosen_card.decade;
    photo_url:= v_chosen_card.photo_url;
    ovr      := v_chosen_card.ovr;
    is_new   := not v_already_owned;
    return next;
  end loop;
end;
$$;
