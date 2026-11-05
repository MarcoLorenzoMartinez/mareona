-- Migration: Polls and poll votes for social posts
-- Enables interactive fan surveys with single vote per user guarantee and strict RLS

create table if not exists public.polls (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references public.posts(id) on delete cascade not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.poll_options (
  id uuid primary key default gen_random_uuid(),
  poll_id uuid references public.polls(id) on delete cascade not null,
  label text not null,
  position smallint not null default 0
);

create table if not exists public.poll_votes (
  id uuid primary key default gen_random_uuid(),
  poll_id uuid references public.polls(id) on delete cascade not null,
  option_id uuid references public.poll_options(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamptz not null default now(),
  constraint unique_user_poll_vote unique (poll_id, user_id)
);

-- Indexes for fast querying
create index if not exists idx_polls_post_id on public.polls (post_id);
create index if not exists idx_poll_options_poll_id on public.poll_options (poll_id, position);
create index if not exists idx_poll_votes_poll_id on public.poll_votes (poll_id);
create index if not exists idx_poll_votes_user_id on public.poll_votes (user_id);

-- RLS
alter table public.polls enable row level security;
alter table public.poll_options enable row level security;
alter table public.poll_votes enable row level security;

-- Polls policies
create policy "Polls are viewable by all"
  on public.polls for select
  using (true);

create policy "Authenticated users can create polls for their posts"
  on public.polls for insert
  to authenticated
  with check (
    exists (
      select 1 from public.posts
      where posts.id = polls.post_id
      and posts.user_id = auth.uid()
    )
  );

-- Poll options policies
create policy "Poll options are viewable by all"
  on public.poll_options for select
  using (true);

create policy "Authenticated users can insert poll options"
  on public.poll_options for insert
  to authenticated
  with check (true);

-- Poll votes policies
create policy "Poll votes are viewable by all"
  on public.poll_votes for select
  using (true);

create policy "Authenticated users can cast their own poll vote"
  on public.poll_votes for insert
  to authenticated
  with check (auth.uid() = user_id);
