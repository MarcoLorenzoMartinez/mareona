-- =====================================================================================
-- MAREONA: SCRIPT DE PURGA DEFINITIVA DE DATOS DE PRUEBA PREVIO A SALIDA A PRODUCCIÓN
-- =====================================================================================
-- Este script es 100% resiliente: comprueba la existencia de cada tabla antes de truncarla
-- para evitar errores 42P01 si alguna migración opcional aún no se ha ejecutado en Supabase.
-- =====================================================================================

DO $$ 
DECLARE 
  tbl text;
  target_tables text[] := ARRAY[
    'admin_audit_logs',
    'blocked_post_attempts',
    'site_visits',
    'system_announcements',
    'user_reports',
    'user_blocks',
    'direct_messages',
    'direct_conversations',
    'friendships',
    'poll_votes',
    'poll_options',
    'polls',
    'post_likes',
    'posts',
    'predictions',
    'user_cards',
    'card_packs'
  ];
BEGIN 
  -- 1. Vaciar dinámicamente solo las tablas que existan en el esquema public
  FOREACH tbl IN ARRAY target_tables 
  LOOP 
    IF EXISTS (
      SELECT 1 
      FROM pg_tables 
      WHERE schemaname = 'public' AND tablename = tbl
    ) THEN 
      EXECUTE 'TRUNCATE TABLE public.' || quote_ident(tbl) || ' CASCADE';
      RAISE NOTICE 'Tabla vaciada con éxito: %', tbl;
    END IF; 
  END LOOP; 

  -- 2. Eliminar usuarios de prueba excepto el administrador oficial
  -- El borrado en cascada (CASCADE) limpiará automáticamente profiles y roles asociados
  DELETE FROM auth.users 
  WHERE lower(email) <> 'mareonasportinguista@gmail.com';

  -- 3. Asegurar que la cuenta oficial tenga rol 'admin' si la tabla user_roles existe
  IF EXISTS (
    SELECT 1 
    FROM pg_tables 
    WHERE schemaname = 'public' AND tablename = 'user_roles'
  ) THEN
    INSERT INTO public.user_roles (user_id, role)
    SELECT id, 'admin'
    FROM auth.users
    WHERE lower(email) = 'mareonasportinguista@gmail.com'
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
END $$;

-- 4. Comprobación de verificación: muestra la cuenta del administrador oficial
SELECT 
  u.id,
  u.email,
  p.username,
  p.display_name,
  u.created_at
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id;
