import type { Metadata } from "next";
import Link from "next/link";
import { LegalDocument, type LegalSection } from "@/components/legal/legal-document";
import { LegalList, LegalP, LegalStrong, LegalTable } from "@/components/legal/legal-elements";

export const metadata: Metadata = {
  title: "Política de cookies",
  description: "Cookies y almacenamiento local que utiliza Mareona.",
};

const SECTIONS: readonly LegalSection[] = [
  {
    id: "resumen",
    title: "Qué utilizamos",
    content: (
      <LegalP>
        Mareona solo utiliza cookies y almacenamiento local <LegalStrong>técnicos</LegalStrong>,
        necesarios para mantener tu sesión y guardar tu progreso. No empleamos cookies
        publicitarias, de analítica de terceros ni de seguimiento, por lo que están exentas de
        consentimiento (art. 22.2 LSSI) y no mostramos banner de cookies.
      </LegalP>
    ),
  },
  {
    id: "cookies",
    title: "Cookies",
    content: (
      <LegalTable
        caption="Cookies utilizadas por Mareona"
        headers={["Cookie", "Finalidad", "Duración"]}
        rows={[
          [
            "sb-…-auth-token",
            "Mantiene tu sesión iniciada de forma segura (propia, gestionada por Supabase).",
            "Persistente; se renueva mientras usas la sesión.",
          ],
          [
            "sb-…-auth-token-code-verifier",
            "Valida el inicio de sesión con Google y evita su suplantación.",
            "Temporal; se elimina al completar el inicio de sesión.",
          ],
        ]}
      />
    ),
  },
  {
    id: "almacenamiento-local",
    title: "Almacenamiento local",
    content: (
      <>
        <LegalP>
          Guardamos en tu dispositivo, bajo claves que empiezan por <LegalStrong>mareona_</LegalStrong>,
          datos que no se envían a ningún tercero:
        </LegalP>
        <LegalList>
          <li>Progreso y estadísticas de Wordle, ¿Quién es?, Pregunta del día y ¿Más o Menos?.</li>
          <li>Tus votos y valoraciones en partidos, encuestas y porra.</li>
          <li>Sobres y cromos de tu colección.</li>
        </LegalList>
      </>
    ),
  },
  {
    id: "terceros",
    title: "Terceros",
    content: (
      <LegalP>
        Al iniciar sesión, Google puede utilizar sus propias cookies en su dominio, sujetas a su
        política. Mareona no controla ese tratamiento.
      </LegalP>
    ),
  },
  {
    id: "gestion",
    title: "Cómo eliminarlas",
    content: (
      <>
        <LegalP>
          Puedes borrar las cookies y los datos del sitio desde los ajustes de tu navegador. Si
          eliminas la cookie de sesión tendrás que volver a iniciar sesión; si borras el
          almacenamiento local perderás el progreso guardado en ese dispositivo.
        </LegalP>
        <LegalP>
          Si incorporamos nuevas tecnologías de almacenamiento, actualizaremos esta página. Más
          información sobre tus datos en la{" "}
          <Link
            href="/privacidad"
            className="font-medium text-[var(--primary-strong)] underline underline-offset-2 hover:text-[var(--primary)]"
          >
            Política de privacidad
          </Link>
          .
        </LegalP>
      </>
    ),
  },
];

export default function CookiesPage() {
  return <LegalDocument title="Política de cookies" sections={SECTIONS} />;
}
