-- Moderation outcome per post. Rejected posts are never stored, so only these two states exist.
alter table public.posts
  add column moderation_status text not null default 'approved'
    check (moderation_status in ('approved', 'flagged')),
  add column moderation_reason text;

create index posts_flagged_idx on public.posts (created_at desc)
  where moderation_status = 'flagged';

-- Authenticated users already only have UPDATE on (body, deleted_at), so they cannot
-- clear a flag from the client; only server-side/service-role tooling can review it.
