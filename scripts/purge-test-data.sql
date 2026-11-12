-- =====================================================================================
-- MAREONA: SCRIPT DE PURGA DEFINITIVA DE DATOS DE PRUEBA PREVIO A SALIDA A PRODUCCIÓN
-- =====================================================================================
-- INSTRUCCIONES:
-- 1. Abre tu panel de Supabase: https://supabase.com/dashboard/project/_/sql
-- 2. Copia y pega el contenido completo de este archivo en una nueva consulta SQL.
-- 3. Pulsa "Run" para ejecutar la limpieza.
--
-- GARANTÍA:
-- • Este script conserva 100% intacta la cuenta oficial: 'mareonasportinguista@gmail.com'
-- • Asigna y asegura el rol 'admin' a dicha cuenta oficial.
-- • Vacía todas las publicaciones, votos, visitas, reportes, porras y comentarios de prueba.
-- =====================================================================================

BEGIN;

-- 1. Vaciar todas las tablas de interacción, mensajes y actividad de desarrollo
TRUNCATE TABLE public.admin_audit_logs CASCADE;
TRUNCATE TABLE public.blocked_post_attempts CASCADE;
TRUNCATE TABLE public.site_visits CASCADE;
TRUNCATE TABLE public.system_announcements CASCADE;
TRUNCATE TABLE public.user_reports CASCADE;
TRUNCATE TABLE public.user_blocks CASCADE;
TRUNCATE TABLE public.direct_messages CASCADE;
TRUNCATE TABLE public.direct_conversations CASCADE;
TRUNCATE TABLE public.friendships CASCADE;
TRUNCATE TABLE public.poll_votes CASCADE;
TRUNCATE TABLE public.poll_options CASCADE;
TRUNCATE TABLE public.polls CASCADE;
TRUNCATE TABLE public.post_likes CASCADE;
TRUNCATE TABLE public.posts CASCADE;
TRUNCATE TABLE public.predictions CASCADE;
TRUNCATE TABLE public.user_cards CASCADE;
TRUNCATE TABLE public.card_packs CASCADE;

-- 2. Eliminar todas las cuentas de usuario de prueba excepto el administrador oficial
-- Nota: La clave foránea ON DELETE CASCADE elimina automáticamente sus filas en public.profiles y public.user_roles.
DELETE FROM auth.users 
WHERE lower(email) <> 'mareonasportinguista@gmail.com';

-- 3. Asegurar que la cuenta oficial tenga rol de Administrador ('admin')
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users
WHERE lower(email) = 'mareonasportinguista@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

COMMIT;

-- 4. Comprobación final de verificación (debe mostrar 1 único usuario: el administrador)
SELECT 
  u.id,
  u.email,
  p.username,
  p.display_name,
  r.role,
  u.created_at
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
LEFT JOIN public.user_roles r ON r.user_id = u.id;
