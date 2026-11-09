-- =====================================================================
-- ADMIN ROLES, DISCIPLINE, AUDIT LOGS AND ANNOUNCEMENTS
-- =====================================================================

-- 1. Roles table for RBAC (Zero-Trust authorization)
create table public.user_roles (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  role        text not null check (role in ('admin', 'moderator')),
  created_at  timestamptz not null default now(),
  constraint user_roles_user_role_key unique (user_id, role)
);

create index user_roles_user_id_idx on public.user_roles (user_id);

alter table public.user_roles enable row level security;

-- 2. Security Definer helper to check if a user is an administrator
create or replace function public.is_admin(user_uuid uuid default auth.uid())
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = user_uuid
      and role = 'admin'
  );
$$;

grant execute on function public.is_admin(uuid) to anon, authenticated, service_role;

-- Policies for user_roles: only admins or service_role can query or mutate roles
create policy "user_roles_select_admin" on public.user_roles
  for select to authenticated
  using (public.is_admin());

create policy "user_roles_modify_service_role" on public.user_roles
  for all to service_role
  using (true)
  with check (true);

-- 3. Profile disciplinary flags (banned status)
alter table public.profiles
  add column if not exists is_banned boolean not null default false,
  add column if not exists banned_until timestamptz,
  add column if not exists banned_reason text;

create index if not exists profiles_banned_idx on public.profiles (is_banned)
  where is_banned;

-- 4. Immutable Admin Audit Logs
create table public.admin_audit_logs (
  id           uuid primary key default gen_random_uuid(),
  admin_id     uuid not null references auth.users (id) on delete restrict,
  action       text not null check (char_length(action) between 2 and 50),
  target_type  text not null check (target_type in ('user', 'post', 'cache', 'banner', 'system', 'poll')),
  target_id    text not null,
  metadata     jsonb not null default '{}'::jsonb,
  created_at   timestamptz not null default now()
);

create index admin_audit_logs_created_at_idx on public.admin_audit_logs (created_at desc);
create index admin_audit_logs_admin_id_idx on public.admin_audit_logs (admin_id, created_at desc);

alter table public.admin_audit_logs enable row level security;

-- Admins can view audit logs; only authenticated admins or service_role can append logs
create policy "admin_audit_logs_select" on public.admin_audit_logs
  for select to authenticated
  using (public.is_admin());

create policy "admin_audit_logs_insert" on public.admin_audit_logs
  for insert to authenticated
  with check (public.is_admin() and (select auth.uid()) = admin_id);

create policy "admin_audit_logs_service_role" on public.admin_audit_logs
  for all to service_role
  using (true)
  with check (true);

-- 5. System Announcements (Global Broadcast & Read-Only wall toggle)
create table public.system_announcements (
  id              uuid primary key default gen_random_uuid(),
  message         text not null check (char_length(message) between 1 and 300),
  type            text not null default 'info' check (type in ('info', 'warning', 'alert')),
  is_active       boolean not null default false,
  read_only_wall  boolean not null default false,
  created_by      uuid references auth.users (id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index system_announcements_active_idx on public.system_announcements (is_active)
  where is_active;

alter table public.system_announcements enable row level security;

create policy "system_announcements_select" on public.system_announcements
  for select to anon, authenticated
  using (is_active or public.is_admin());

create policy "system_announcements_modify" on public.system_announcements
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "system_announcements_service_role" on public.system_announcements
  for all to service_role
  using (true)
  with check (true);
