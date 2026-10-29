-- =====================================================================
-- PACK INVENTORY TIERS & BALANCED OPENING ALGORITHM
-- =====================================================================

-- 1. Actualizar check constraint de user_packs para incluir los 3 tiers canónicos
alter table public.user_packs
  drop constraint if exists user_packs_pack_type_check;

alter table public.user_packs
  add constraint user_packs_pack_type_check
  check (pack_type in (
    'aficionado', 'rojiblanco', 'leyenda',
    'standard', 'daily', 'streak', 'prediction_reward'
  ));

-- 2. Actualizar función RPC open_card_pack con garantías por tier y protección antirrepetición
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
  v_guaranteed_legend_id uuid;
  v_guaranteed_quality_id uuid;
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

  -- 3. Manejo de garantías según tier
  if v_pack.pack_type = 'leyenda' then
    -- Priorizar leyenda (OVR >= 82) que el usuario NO tenga
    select c.id into v_guaranteed_legend_id
    from public.cards c
    where c.is_active and c.ovr >= 82
      and not exists (
        select 1 from public.user_cards uc
        where uc.user_id = p_user_id and uc.card_id = c.id
      )
    order by random()
    limit 1;

    -- Si ya tiene todas las leyendas, elegir cualquiera con OVR >= 82
    if v_guaranteed_legend_id is null then
      select c.id into v_guaranteed_legend_id
      from public.cards c
      where c.is_active and c.ovr >= 82
      order by random()
      limit 1;
    end if;

  elsif v_pack.pack_type = 'rojiblanco' then
    -- Garantizar al menos una carta con OVR >= 75
    select c.id into v_guaranteed_quality_id
    from public.cards c
    where c.is_active and c.ovr >= 75
    order by random()
    limit 1;
  end if;

  -- 4. Seleccionar cartas asegurando la garantía si aplica
  for v_chosen_card in (
    with selected as (
      -- Carta garantizada (si aplica)
      select c.id, c.slug, c.known_as, c.position, c.decade, c.photo_url, c.ovr, 1 as priority
      from public.cards c
      where c.id in (coalesce(v_guaranteed_legend_id, '00000000-0000-0000-0000-000000000000'::uuid),
                     coalesce(v_guaranteed_quality_id, '00000000-0000-0000-0000-000000000000'::uuid))
      union all
      -- Cartas restantes hasta completar el card_count
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
    select distinct on (id) id, slug, known_as, position, decade, photo_url, ovr
    from selected
    order by id, priority asc
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
