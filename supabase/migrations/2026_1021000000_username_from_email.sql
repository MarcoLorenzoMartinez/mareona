-- =====================================================================
-- MIGRATION: Derivar apodo por defecto del correo electrónico y evitar colisiones
-- =====================================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_raw_username text;
  v_clean_username text;
  v_final_username text;
  v_suffix int := 0;
begin
  -- 1. Obtener apodo de metadatos o derivarlo de la parte local del correo
  v_raw_username := new.raw_user_meta_data->>'username';
  if v_raw_username is null or length(trim(v_raw_username)) = 0 then
    v_raw_username := split_part(split_part(coalesce(new.email, 'sportinguista'), '@', 1), '+', 1);
  end if;

  -- 2. Normalizar a minúsculas y sustituir caracteres especiales por guiones bajos
  v_clean_username := lower(regexp_replace(v_raw_username, '[^a-zA-Z0-9_]', '_', 'g'));
  v_clean_username := regexp_replace(v_clean_username, '_+', '_', 'g');
  v_clean_username := trim(both '_' from v_clean_username);

  -- 3. Respetar restricciones de longitud (3 a 20 caracteres)
  if length(v_clean_username) = 0 then
    v_clean_username := 'sportinguista';
  elsif length(v_clean_username) < 3 then
    v_clean_username := rpad(v_clean_username, 3, '0');
  end if;

  if length(v_clean_username) > 20 then
    v_clean_username := substr(v_clean_username, 1, 20);
  end if;

  -- 4. Bucle de resolución de colisiones: añade sufijo numérico si ya existe
  v_final_username := v_clean_username;
  while exists (select 1 from public.profiles where username = v_final_username) loop
    v_suffix := v_suffix + 1;
    v_final_username := substr(v_clean_username, 1, 20 - length('_' || v_suffix::text)) || '_' || v_suffix::text;
  end loop;

  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    v_final_username,
    coalesce(new.raw_user_meta_data->>'display_name', v_final_username)
  )
  on conflict (id) do nothing;

  return new;
end;
$$;
