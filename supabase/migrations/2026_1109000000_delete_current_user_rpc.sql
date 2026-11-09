-- =====================================================================
-- MIGRATION: Security Definer RPC for Self-Account Deletion (Cancel Registration)
-- =====================================================================

create or replace function public.delete_current_user()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid;
begin
  v_user_id := auth.uid();
  if v_user_id is not null then
    delete from auth.users where id = v_user_id;
  end if;
end;
$$;

grant execute on function public.delete_current_user() to authenticated;
