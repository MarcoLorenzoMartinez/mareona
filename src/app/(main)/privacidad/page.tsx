import type { Metadata } from "next";
import Link from "next/link";
import { LegalDocument, type LegalSection } from "@/components/legal/legal-document";
import {
  LegalList,
  LegalMail,
  LegalP,
  LegalStrong,
  LegalTable,
} from "@/components/legal/legal-elements";
import { LEGAL_OWNER_LOCATION, LEGAL_OWNER_NAME } from "@/lib/legal/constants";

export const metadata: Metadata = {
  title: "Política de privacidad",
  description: "Qué datos personales trata Mareona, para qué y cómo ejercer tus derechos.",
};

const INLINE_LINK =
  "font-medium text-[var(--primary-strong)] underline underline-offset-2 hover:text-[var(--primary)]";

const SECTIONS: readonly LegalSection[] = [
  {
    id: "responsable",
    title: "Responsable del tratamiento",
    content: (
      <LegalP>
        El responsable del tratamiento de los datos personales es{" "}
        <LegalStrong>{LEGAL_OWNER_NAME}</LegalStrong> ({LEGAL_OWNER_LOCATION}). Para cualquier
        cuestión sobre privacidad o ejercicio de derechos puedes escribir a <LegalMail />.
      </LegalP>
    ),
  },
  {
    id: "datos",
    title: "Datos que tratamos",
    content: (
      <>
        <LegalP>Solo tratamos los datos necesarios para que tengas cuenta y puedas participar.</LegalP>
        <LegalTable
          caption="Datos personales tratados por Mareona"
          headers={["Datos", "Origen", "Finalidad"]}
          rows={[
            [
              "Nombre, correo y avatar",
              "Tu cuenta de Google o registro con correo electrónico",
              "Crear y mantener tu cuenta y tu perfil.",
            ],
            [
              "Apodo, nombre visible y avatar",
              "Tú, al editar tu perfil",
              "Identificarte ante otros aficionados.",
            ],
            [
              "Pronósticos, puntos, cromos, votos, publicaciones, amistades y bloqueos",
              "Tu actividad en la web",
              "Prestar las funciones de juegos, porra y tertulia.",
            ],
            [
              "Mensajería privada entre amigos (chats 1:1)",
              "Tus conversaciones directas",
              "Comunicación privada entre usuarios con amistad mutua aceptada, sin inspección automatizada de contenido.",
            ],
            [
              "Denuncias de usuarios, intentos bloqueados en muro público y custodia legal",
              "Denuncias voluntarias y sistema de seguridad",
              "Atender denuncias por abusos y cumplir el deber de custodia legal ante requerimientos judiciales.",
            ],
            [
              "Dirección IP y datos técnicos de la conexión",
              "Servidores de alojamiento",
              "Seguridad y funcionamiento del servicio.",
            ],
          ]}
        />
      </>
    ),
  },
  {
    id: "base-juridica",
    title: "Base jurídica",
    content: (
      <LegalList>
        <li>
          <LegalStrong>Ejecución del servicio</LegalStrong> que solicitas al crear tu cuenta (art.
          6.1.b RGPD): cuenta, perfil, juegos, porra, tertulia y mensajería directa.
        </li>
        <li>
          <LegalStrong>Interés legítimo</LegalStrong> (art. 6.1.f RGPD): seguridad perimetral,
          bloqueos entre usuarios y tramitación de denuncias voluntarias.
        </li>
        <li>
          <LegalStrong>Obligación legal y custodia bloqueada</LegalStrong> (art. 6.1.c RGPD y art. 32
          LOPDGDD): conservación restringida de evidencias para su puesta a disposición exclusiva de
          jueces, tribunales, Ministerio Fiscal o Fuerzas y Cuerpos de Seguridad.
        </li>
      </LegalList>
    ),
  },
  {
    id: "destinatarios",
    title: "Destinatarios, confidencialidad y proveedores",
    content: (
      <>
        <LegalP>No vendemos tus datos ni los usamos para publicidad. Recurrimos a estos proveedores:</LegalP>
        <LegalList>
          <li><LegalStrong>Supabase:</LegalStrong> base de datos, autenticación y almacenamiento de avatares.</li>
          <li><LegalStrong>Vercel:</LegalStrong> alojamiento de la web y analítica técnica sin cookies ni perfilado individual.</li>
          <li><LegalStrong>Brevo:</LegalStrong> envío de correos transaccionales de verificación y recuperación de contraseña.</li>
          <li><LegalStrong>Groq:</LegalStrong> moderación automática preventiva del muro público (nunca de mensajes privados).</li>
          <li><LegalStrong>Google:</LegalStrong> inicio de sesión mediante Google OAuth (si eliges ese método).</li>
        </LegalList>
        <LegalP>
          Tu nombre visible, apodo, avatar, puntos y publicaciones son públicos. En cambio,{" "}
          <LegalStrong>Mareona no lee, inspecciona ni analiza de forma automatizada el contenido de
          tus conversaciones privadas entre amigos</LegalStrong>. Los mensajes directos están aislados
          en base de datos (Row Level Security) entre emisor y receptor, y solo se revisan si uno de
          los participantes decide denunciar expresamente la conversación por acoso o conducta ilícita,
          o si media un requerimiento judicial.
        </LegalP>
      </>
    ),
  },
  {
    id: "conservacion",
    title: "Conservación y bloqueo legal",
    content: (
      <LegalP>
        Conservamos tus datos mientras mantengas la cuenta. Cuando eliminas un mensaje privado
        enviado, deja de ser visible de inmediato para ambos participantes en el chat, pero el
        registro queda bloqueado en custodia técnica restringida (art. 32 LOPDGDD) con el único fin
        de impedir la destrucción de pruebas e investigar posibles delitos a requerimiento judicial.
        Al eliminar tu cuenta se suprimen tus datos en cascada sin demora indebida.
      </LegalP>
    ),
  },
  {
    id: "derechos",
    title: "Tus derechos",
    content: (
      <>
        <LegalP>Puedes ejercer los derechos de acceso, rectificación, supresión, oposición, limitación y portabilidad:</LegalP>
        <LegalList>
          <li>
            <LegalStrong>Rectificación y supresión de mensajes:</LegalStrong> edita tu{" "}
            <Link href="/perfil" className={INLINE_LINK}>Perfil</Link> o elimina tus propios mensajes enviados desde el chat.
          </li>
          <li>
            <LegalStrong>Supresión de cuenta:</LegalStrong> usa «Eliminar mi cuenta y mis datos» en tu perfil. Es inmediato e irreversible.
          </li>
          <li>
            <LegalStrong>Resto de derechos:</LegalStrong> escribe a <LegalMail />. Puedes reclamar ante la AEPD (aepd.es).
          </li>
        </LegalList>
      </>
    ),
  },
  {
    id: "menores",
    title: "Menores de edad",
    content: (
      <LegalP>
        Conforme al artículo 7 de la LOPDGDD, Mareona está destinada a mayores de 14 años. Si se
        detecta una cuenta de un menor de dicha edad sin autorización parental, será suprimida.
      </LegalP>
    ),
  },
  {
    id: "seguridad",
    title: "Seguridad y cambios",
    content: (
      <LegalP>
        Aplicamos cifrado en tránsito (TLS), cifrado en reposo y políticas de seguridad a nivel de
        fila (RLS). El uso de almacenamiento local se detalla en la{" "}
        <Link href="/cookies" className={INLINE_LINK}>Política de cookies</Link>.
      </LegalP>
    ),
  },
];

export default function PrivacidadPage() {
  return <LegalDocument title="Política de privacidad" sections={SECTIONS} />;
}
