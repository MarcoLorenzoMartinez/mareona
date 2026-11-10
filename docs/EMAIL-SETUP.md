# Guía de Configuración de Correo Transaccional (Resend + Supabase)

Este documento detalla los pasos para conectar un servicio de correo profesional a Mareona, garantizando máxima entregabilidad (evitando la carpeta de spam), diseño corporativo rojiblanco y eliminando los límites estrictos de la capa gratuita por defecto de Supabase.

---

## 1. Conectar Resend a Supabase (3 minutos)

Resend ofrece **3.000 correos al mes gratis** (100 al día), sin necesidad de tarjeta de crédito y con reputación de entrega inmediata.

1. **Crear cuenta en Resend:**
   - Entra en [resend.com](https://resend.com) y pulsa **Get Started** (puedes iniciar sesión con Google o GitHub).
2. **Generar API Key:**
   - En el menú lateral de Resend, entra en **API Keys** y pulsa **Create API Key**.
   - Ponle de nombre `Mareona Supabase` y copia la clave generada (empieza por `re_...`).
3. **Introducir la configuración SMTP en Supabase:**
   - Entra en tu panel de Supabase: [Dashboard > Project Settings > Authentication > SMTP Settings](https://supabase.com/dashboard/project/icdjlwxxudyaexbmedfo/settings/auth).
   - Activa el interruptor **Enable Custom SMTP**.
   - Rellena exactamente los siguientes campos:
     - **Sender email:** `onboarding@resend.dev` *(o tu correo con dominio propio si tienes uno configurado en Resend)*.
     - **Sender name:** `Mareona · Real Sporting`
     - **Host:** `smtp.resend.com`
     - **Port:** `465` (con SSL) o `587` (con STARTTLS)
     - **Minimum time between emails:** `0`
     - **User:** `resend`
     - **Password:** *Pega tu API Key de Resend (`re_...`)*
   - Pulsa **Save**.

---

## 2. Aplicar las Plantillas HTML Oficiales de Mareona

Las plantillas oficiales diseñadas para Mareona se encuentran en la carpeta `supabase/email-templates/`:

1. **Confirmación de registro (`confirm-signup.html`):**
   - En Supabase: [Dashboard > Authentication > Email Templates > Confirm signup](https://supabase.com/dashboard/project/icdjlwxxudyaexbmedfo/auth/templates).
   - **Subject:** `¡Te damos la bienvenida a Mareona! Confirma tu cuenta`
   - **Body:** Copia todo el contenido del archivo [`supabase/email-templates/confirm-signup.html`](file:///c:/Users/marco/dev/mareona/supabase/email-templates/confirm-signup.html) y pégalo en el editor de código.
   - Pulsa **Save**.

2. **Recuperación de contraseña (`reset-password.html`):**
   - En Supabase: [Dashboard > Authentication > Email Templates > Reset password](https://supabase.com/dashboard/project/icdjlwxxudyaexbmedfo/auth/templates).
   - **Subject:** `Restablece tu contraseña de Mareona`
   - **Body:** Copia el contenido de [`supabase/email-templates/reset-password.html`](file:///c:/Users/marco/dev/mareona/supabase/email-templates/reset-password.html).
   - Pulsa **Save**.

3. **Magic Link (`magic-link.html`):**
   - En Supabase: [Dashboard > Authentication > Email Templates > Magic Link](https://supabase.com/dashboard/project/icdjlwxxudyaexbmedfo/auth/templates).
   - **Subject:** `Tu enlace de acceso directo a Mareona`
   - **Body:** Copia el contenido de [`supabase/email-templates/magic-link.html`](file:///c:/Users/marco/dev/mareona/supabase/email-templates/magic-link.html).
   - Pulsa **Save**.

---

## 3. Opciones Profesionales de Contingencia (Por si se agota Resend o hay problemas)

### Opción A: Registro "Zero-Friction" (Auto-activación inmediata)
* **Cómo funciona:** El usuario introduce correo y contraseña y **entra de inmediato a Mareona**, sin esperar ningún correo de confirmación.
* **Cómo se activa:** En [Supabase > Authentication > Providers > Email](https://supabase.com/dashboard/project/icdjlwxxudyaexbmedfo/auth/providers), desmarca la casilla **"Confirm email"** y pulsa Save.
* **Ventajas:**
  - Cero dependencias de cuotas de correo: nunca se agota nada.
  - Cero fricción de registro: el aficionado empieza a usar la app en 3 segundos.
  - Cero rebotes ni quejas de spam.
  - El código de la aplicación ya detecta automáticamente si esta opción está activa y permite el acceso directo al onboarding.

### Opción B: Proveedor de Respaldo Gratuito (Brevo / Sendinblue)
* Si en algún momento Resend se agota por un volumen muy alto de registros y no quieres pagar un plan mensual:
  - **Brevo:** Ofrece **300 correos al día gratis** (9.000 emails al mes).
  - Solo tienes que cambiar en Supabase el Host a `smtp-relay.brevo.com` y poner tu clave de Brevo. Tarda 1 minuto.

### Opción C: Acceso con Google (Google OAuth)
* Mareona ya incluye el botón **"Continuar con Google"**.
* Al autenticarse con Google, no se envía ningún email (Google ya certifica la identidad del aficionado), por lo que consume 0 cuota de correo.
