-- Optional reference to Mareona data (team stat, player, match, historical match) quoted in a post.
-- Only the reference is stored; display data is resolved server-side from the sports caches.
alter table public.posts
  add column attachment jsonb
    check (attachment is null or (jsonb_typeof(attachment) = 'object' and attachment ? 'type'));
