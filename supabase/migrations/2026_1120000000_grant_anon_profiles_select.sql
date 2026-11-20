-- Migration: Allow anonymous read of public profile fields
-- Fixes 42501 permission denied when unauthenticated visitors view /social or match comments.

grant select (id, username, display_name, avatar_url, points, created_at)
  on public.profiles
  to anon;
