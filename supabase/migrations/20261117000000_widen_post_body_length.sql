-- =====================================================================
-- POSTS: WIDEN BODY CHECK TO ALLOW ATTACHED TACTICAL LINEUPS
-- =====================================================================
--
-- Widens public.posts body length constraint from 500 to 2000 chars.
-- This guarantees users retain their full 500 characters of written opinion
-- without attached interactive lineup tags (<!--once:...-->) eating into their quota.

alter table public.posts
  drop constraint if exists posts_body_check;

alter table public.posts
  add constraint posts_body_check
  check (char_length(btrim(body)) between 1 and 2000);
