-- =====================================================================
-- CARD MATCH SYNC: Idempotent tracking of finished Sporting matches
-- Ensures no official match (Liga or Copa) duplicates card PJ updates.
-- =====================================================================

create table public.card_match_sync (
  match_id            text primary key,
  competition         text not null,
  match_date          timestamptz not null,
  synced_card_slugs   text[] not null default '{}',
  processed_at        timestamptz not null default now()
);

create index card_match_sync_comp_idx on public.card_match_sync (competition);
create index card_match_sync_date_idx on public.card_match_sync (match_date desc);

alter table public.card_match_sync enable row level security;

-- All users can view synchronized matches (transparent historical ledger)
create policy "card_match_sync_read_all"
  on public.card_match_sync for select
  using (true);

-- System service execution policy
create policy "card_match_sync_service_manage"
  on public.card_match_sync for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');
