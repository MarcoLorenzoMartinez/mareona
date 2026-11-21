# Configuración del acceso con Google

Mareona abre la ventana de Google directamente desde la web (Google Identity Services), de modo que Google muestra `mareona.vercel.app` en lugar del dominio de Supabase. El resultado se canjea por una sesión de Supabase mediante `signInWithIdToken`.

## 1. Google Cloud Console

En **APIs y servicios → Credenciales → ID de cliente OAuth (tipo «Aplicación web»)**, añade en **Orígenes de JavaScript autorizados**:

- `https://mareona.vercel.app`
- `http://localhost:3000` (desarrollo)

Mantén el URI de redireccionamiento de Supabase (`https://<proyecto>.supabase.co/auth/v1/callback`): sigue usándose en la app instalada como PWA.

## 2. Supabase

En **Authentication → Providers → Google**, el ID de cliente debe ser el mismo que usa la web. No actives «Skip nonce checks»: la app envía un nonce por intento.

## 3. Variable de entorno

Define `NEXT_PUBLIC_GOOGLE_CLIENT_ID` con el ID de cliente (no es un secreto) en Vercel y en `.env.local`. Sin ella, la app usa el flujo clásico por redirección.

## Comportamiento

| Contexto | Flujo |
| :--- | :--- |
| Navegador con la variable definida | Ventana emergente de Google; el usuario no abandona la página |
| App instalada (PWA) | Redirección vía Supabase, conserva el retorno a `source=pwa` |
| Sin variable o script de Google bloqueado | Redirección vía Supabase |
