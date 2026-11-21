-- =====================================================================
-- FRIENDSHIPS TABLE & RLS
-- Sistema de amistad entre aficionados para filtrar la tertulia social
-- =====================================================================

create type public.friendship_status as enum (
  'pending', 'accepted', 'declined'
);

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

create index if not exists friendships_requester_idx
  on public.friendships (requester_id, status);

create index if not exists friendships_addressee_idx
  on public.friendships (addressee_id, status);

create trigger friendships_set_updated_at
  before update on public.friendships
  for each row execute function public.set_updated_at();

-- RLS
alter table public.friendships enable row level security;

-- Los usuarios pueden leer relaciones donde participen como remitente o destinatario
create policy "friendships_select_own"
  on public.friendships for select
  using (
    auth.uid() = requester_id or auth.uid() = addressee_id
  );

-- Solo el usuario autenticado puede solicitar amistad a otro perfil
create policy "friendships_insert_requester"
  on public.friendships for insert
  with check (
    auth.uid() = requester_id
  );

-- Solo el destinatario puede responder a la solicitud (aceptar / rechazar)
create policy "friendships_update_addressee"
  on public.friendships for update
  using (
    auth.uid() = addressee_id
  )
  with check (
    auth.uid() = addressee_id
  );

-- Cualquiera de los dos involucrados puede cancelar solicitud o eliminar amistad
create policy "friendships_delete_involved"
  on public.friendships for delete
  using (
    auth.uid() = requester_id or auth.uid() = addressee_id
  );
