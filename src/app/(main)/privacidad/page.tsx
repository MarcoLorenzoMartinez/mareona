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
        El responsable de los datos es el equipo promotor de Mareona. Para cualquier cuestión sobre
        privacidad puedes escribir a <LegalMail />.
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
              "Tu cuenta de Google al iniciar sesión",
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
              "Intentos de publicación bloqueados, sanciones y acciones de moderación",
              "Sistema de moderación",
              "Mantener un entorno respetuoso y seguro.",
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
          6.1.b RGPD): cuenta, perfil, juegos, porra y tertulia.
        </li>
        <li>
          <LegalStrong>Interés legítimo</LegalStrong> (art. 6.1.f RGPD): seguridad, prevención de
          abusos y moderación.
        </li>
      </LegalList>
    ),
  },
  {
    id: "destinatarios",
    title: "Destinatarios y proveedores",
    content: (
      <>
        <LegalP>No vendemos tus datos ni los usamos para publicidad. Recurrimos a estos proveedores:</LegalP>
        <LegalList>
          <li>
            <LegalStrong>Supabase:</LegalStrong> base de datos, autenticación y almacenamiento de
            avatares.
          </li>
          <li>
            <LegalStrong>Vercel:</LegalStrong> alojamiento de la web.
          </li>
          <li>
            <LegalStrong>Google:</LegalStrong> inicio de sesión mediante Google OAuth.
          </li>
        </LegalList>
        <LegalP>
          Algunos de ellos pueden tratar datos fuera del Espacio Económico Europeo, con las
          garantías previstas por el RGPD (decisiones de adecuación o cláusulas contractuales tipo).
          Tu nombre visible, apodo, avatar, puntos y publicaciones son visibles para otros
          usuarios.
        </LegalP>
      </>
    ),
  },
  {
    id: "conservacion",
    title: "Conservación",
    content: (
      <LegalP>
        Conservamos tus datos mientras mantengas la cuenta. Al eliminarla se suprimen tus datos sin
        demora indebida; las copias de seguridad se sobrescriben en su ciclo ordinario de rotación.
      </LegalP>
    ),
  },
  {
    id: "derechos",
    title: "Tus derechos",
    content: (
      <>
        <LegalP>
          Puedes ejercer los derechos de acceso, rectificación, supresión, oposición, limitación y
          portabilidad:
        </LegalP>
        <LegalList>
          <li>
            <LegalStrong>Rectificación:</LegalStrong> edita tu perfil desde{" "}
            <Link href="/perfil" className={INLINE_LINK}>
              Perfil
            </Link>
            .
          </li>
          <li>
            <LegalStrong>Supresión:</LegalStrong> usa «Eliminar mi cuenta y mis datos» en la edición
            de tu perfil. Es inmediato e irreversible.
          </li>
          <li>
            <LegalStrong>Resto de derechos:</LegalStrong> escribe a <LegalMail />. Responderemos en
            el plazo máximo de un mes.
          </li>
        </LegalList>
        <LegalP>
          Si consideras que tus derechos no han sido atendidos, puedes reclamar ante la Agencia
          Española de Protección de Datos (aepd.es).
        </LegalP>
      </>
    ),
  },
  {
    id: "menores",
    title: "Menores de edad",
    content: (
      <LegalP>
        Conforme al artículo 7 de la LOPDGDD, Mareona está destinada a personas mayores de 14
        años. Si se detecta una cuenta perteneciente a un menor de dicha edad sin la debida
        autorización parental, se procederá a su supresión.
      </LegalP>
    ),
  },
  {
    id: "seguridad",
    title: "Seguridad y cambios",
    content: (
      <>
        <LegalP>
          Aplicamos cifrado en tránsito y control de acceso por usuario en la base de datos para
          proteger tu información.
        </LegalP>
        <LegalP>
          Si modificamos esta política, actualizaremos la fecha que figura al inicio de la página.
          El uso de cookies y almacenamiento local se detalla en la{" "}
          <Link href="/cookies" className={INLINE_LINK}>
            Política de cookies
          </Link>
          .
        </LegalP>
      </>
    ),
  },
];

export default function PrivacidadPage() {
  return <LegalDocument title="Política de privacidad" sections={SECTIONS} />;
}
