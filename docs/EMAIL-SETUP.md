# Guía Definitiva de Correo Transaccional (Brevo + `mareonasportinguista@gmail.com` + Supabase)

Esta arquitectura combina **Supabase Auth** (seguridad, tokens y gestión de sesiones) con el relé SMTP profesional de **Brevo** (300 correos/día gratis, 9.000/mes, sin límite de 2 correos/hora y sin exigir Verificación en 2 pasos de Google).

> **Seguridad:** Ninguna clave SMTP se almacena en el código ni en variables de entorno de la web. La credencial vive cifrada exclusivamente dentro del servidor de autenticación de Supabase.

---

## Paso 1: Crear cuenta gratuita en Brevo y obtener la clave SMTP (2 minutos)

1. Entra en [brevo.com/es](https://www.brevo.com/es/) y pulsa **Regístrate gratis**.
2. Regístrate usando directamente el correo **`mareonasportinguista@gmail.com`**.
3. Abre la bandeja de entrada de `mareonasportinguista@gmail.com` en Gmail y pulsa el botón de **Confirmar mi dirección de correo** que te habrá enviado Brevo (al registrarte con ese correo, Brevo ya autoriza `mareonasportinguista@gmail.com` como remitente verificado).
4. Dentro del panel de Brevo, pulsa arriba a la derecha sobre el nombre de tu cuenta y entra en **SMTP y API** (o directamente en [app.brevo.com/settings/keys/smtp](https://app.brevo.com/settings/keys/smtp)).
5. Mantente en la pestaña **SMTP**:
   - Anota el valor que aparece en **Inicio de sesión** (tiene formato `7a8b9c...@smtp-brevo.com`).
   - Pulsa el botón **Generar una nueva clave SMTP**, ponle de nombre `Mareona Supabase` y **copia la clave generada** (guárdala un momento porque solo se muestra una vez).

---

## Paso 2: Conectar Brevo en el panel de Supabase (1 minuto)

1. Entra en tu panel de Supabase:
   `Project Settings > Authentication (SMTP Settings)` (`https://supabase.com/dashboard/project/<YOUR_SUPABASE_PROJECT_REF>/settings/auth`).
2. Baja hasta la sección **SMTP Settings** y activa el interruptor **Enable Custom SMTP**.
3. Rellena exactamente estos campos:
   - **Sender email:** `mareonasportinguista@gmail.com`
   - **Sender name:** `Mareona`
   - **Host:** `smtp-relay.brevo.com`
   - **Port number:** `587`
   - **Minimum interval per user:** `60` *(protección anti-abuso: impide que un bot pida más de 1 correo por minuto para la misma dirección)*
   - **Username:** *(Pega el "Inicio de sesión" de Brevo del Paso 1, ej. `xxxxx@smtp-brevo.com`)*
   - **Password:** *(Pega la Clave SMTP que generaste en Brevo en el Paso 1)*
4. Pulsa **Save**.

---

## Paso 3: Pegar las plantillas minimalistas de Mareona en Supabase (1 minuto)

1. En el panel de Supabase, entra en:
   `Authentication > Email Templates` (`https://supabase.com/dashboard/project/<YOUR_SUPABASE_PROJECT_REF>/auth/templates`).
2. En la pestaña **Confirm signup**:
   - **Subject heading:** `Confirma tu correo en Mareona`
   - **Message body (Source / Code):** Borra todo el texto que viene por defecto y pega íntegro el contenido de [`supabase/email-templates/confirm-signup.html`](../supabase/email-templates/confirm-signup.html).
   - Pulsa **Save**.
3. En la pestaña **Reset password**:
   - **Subject heading:** `Restablece tu contraseña en Mareona`
   - **Message body (Source / Code):** Pega íntegro el contenido de [`supabase/email-templates/reset-password.html`](../supabase/email-templates/reset-password.html).
   - Pulsa **Save**.
4. En la pestaña **Magic Link**:
   - **Subject heading:** `Acceso a Mareona`
   - **Message body (Source / Code):** Pega íntegro el contenido de [`supabase/email-templates/magic-link.html`](../supabase/email-templates/magic-link.html).
   - Pulsa **Save**.

---

## Paso 4: Verificar las URLs de redirección en Supabase (30 segundos)

1. En el panel de Supabase, entra en:
   `Authentication > URL Configuration` (`https://supabase.com/dashboard/project/<YOUR_SUPABASE_PROJECT_REF>/auth/url-configuration`).
2. Asegúrate de tener:
   - **Site URL:** La dirección principal de tu web en producción (`https://mareona.vercel.app`, **sin `/` al final**).
   - **Redirect URLs:** Añade únicamente rutas exactas autorizadas (evita comodines amplios):
     - `https://mareona.vercel.app/auth/callback`
     - `http://localhost:3000/auth/callback`
3. Pulsa **Save**.
