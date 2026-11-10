import type { Metadata } from "next";
import Link from "next/link";
import { LegalDocument, type LegalSection } from "@/components/legal/legal-document";
import { LegalList, LegalMail, LegalP, LegalStrong } from "@/components/legal/legal-elements";

export const metadata: Metadata = {
  title: "Términos de uso",
  description: "Normas de la tertulia, la porra y los juegos, y condiciones de uso de Mareona.",
};

const INLINE_LINK =
  "font-medium text-[var(--primary-strong)] underline underline-offset-2 hover:text-[var(--primary)]";

const SECTIONS: readonly LegalSection[] = [
  {
    id: "aceptacion",
    title: "Aceptación y cuenta",
    content: (
      <>
        <LegalP>
          Al crear una cuenta o usar Mareona aceptas estos términos. El acceso se realiza con tu
          cuenta de Google; debes tener al menos 14 años.
        </LegalP>
        <LegalP>
          Cada persona puede tener una cuenta y es responsable de la actividad realizada con ella.
        </LegalP>
      </>
    ),
  },
  {
    id: "normas",
    title: "Normas de la tertulia",
    content: (
      <>
        <LegalP>La rivalidad deportiva es bienvenida; la falta de respeto, no. Está prohibido publicar:</LegalP>
        <LegalList>
          <li>Insultos, acoso, amenazas o incitación a la violencia.</li>
          <li>Contenido racista, xenófobo, machista, homófobo o discriminatorio.</li>
          <li>Datos personales de terceros o contenido que vulnere su intimidad.</li>
          <li>Publicidad no autorizada, spam o contenido ilegal.</li>
          <li>Suplantación de identidad.</li>
        </LegalList>
      </>
    ),
  },
  {
    id: "moderacion",
    title: "Moderación",
    content: (
      <>
        <LegalP>
          Mareona combina un filtro automático de palabras con revisión manual. El equipo puede
          retirar contenido que incumpla estas normas y suspender cuentas de forma temporal o
          permanente según la gravedad.
        </LegalP>
        <LegalP>
          Si crees que una decisión de moderación es un error, escríbenos a <LegalMail /> y la
          revisaremos.
        </LegalP>
      </>
    ),
  },
  {
    id: "porra-y-juegos",
    title: "Porra y juegos",
    content: (
      <>
        <LegalP>
          La porra y los juegos diarios son recreativos. No hay dinero ni premios de valor
          económico en juego, y los puntos y cromos no tienen valor monetario ni son canjeables.
        </LegalP>
        <LegalList>
          <li>Los pronósticos se cierran antes del inicio del partido y no se pueden modificar después.</li>
          <li>Se prohíbe el uso de bots, scripts o cualquier método para alterar resultados o clasificaciones.</li>
          <li>
            Podemos corregir o anular puntuaciones obtenidas de forma fraudulenta o derivadas de un
            error en los datos del partido.
          </li>
        </LegalList>
      </>
    ),
  },
  {
    id: "contenido",
    title: "Tu contenido",
    content: (
      <LegalP>
        Conservas la titularidad de lo que publicas. Nos concedes una licencia gratuita y no
        exclusiva para mostrarlo dentro de Mareona mientras esté publicado. Eres responsable de que
        tu contenido no infrinja derechos de terceros.
      </LegalP>
    ),
  },
  {
    id: "datos-deportivos",
    title: "Datos deportivos",
    content: (
      <LegalP>
        Resultados, clasificaciones y estadísticas proceden de proveedores externos y tienen
        carácter informativo. Pueden contener retrasos o errores, y Mareona no garantiza su
        exactitud.
      </LegalP>
    ),
  },
  {
    id: "disponibilidad",
    title: "Disponibilidad y responsabilidad",
    content: (
      <LegalP>
        Mareona se ofrece «tal cual», sin garantía de disponibilidad continua. En la medida
        permitida por la ley, no respondemos de interrupciones del servicio ni de daños derivados
        del uso de la web, sin perjuicio de los derechos que te correspondan como consumidor.
      </LegalP>
    ),
  },
  {
    id: "baja",
    title: "Baja y suspensión",
    content: (
      <LegalP>
        Puedes eliminar tu cuenta cuando quieras desde la edición de tu{" "}
        <Link href="/perfil" className={INLINE_LINK}>
          perfil
        </Link>
        . Podemos suspender o cerrar cuentas que incumplan estos términos.
      </LegalP>
    ),
  },
  {
    id: "cambios",
    title: "Cambios y legislación",
    content: (
      <>
        <LegalP>
          Podemos actualizar estos términos; la fecha de la parte superior indica la última
          versión. Seguir usando la web implica aceptar los cambios.
        </LegalP>
        <LegalP>
          Se rigen por la <LegalStrong>legislación española</LegalStrong>. Consulta también el{" "}
          <Link href="/aviso-legal" className={INLINE_LINK}>
            Aviso legal
          </Link>{" "}
          y la{" "}
          <Link href="/privacidad" className={INLINE_LINK}>
            Política de privacidad
          </Link>
          .
        </LegalP>
      </>
    ),
  },
];

export default function TerminosPage() {
  return <LegalDocument title="Términos de uso" sections={SECTIONS} />;
}
