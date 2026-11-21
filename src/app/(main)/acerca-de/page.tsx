import type { Metadata } from "next";
import Link from "next/link";
import { LegalDocument, type LegalSection } from "@/components/legal/legal-document";
import {
  LegalList,
  LegalMail,
  LegalP,
  LegalStrong,
} from "@/components/legal/legal-elements";
import { LEGAL_OWNER_LOCATION, LEGAL_OWNER_NAME } from "@/lib/legal/constants";

export const metadata: Metadata = {
  title: "Acerca de Mareona",
  description:
    "Qué es Mareona, su independencia respecto al Real Sporting de Gijón y LaLiga, estándares técnicos y vías de colaboración.",
};

const INLINE_LINK =
  "font-medium text-[var(--primary-strong)] underline underline-offset-2 hover:text-[var(--primary)]";

const SECTIONS: readonly LegalSection[] = [
  {
    id: "proyecto",
    title: "El proyecto",
    content: (
      <>
        <LegalP>
          <LegalStrong>Mareona</LegalStrong> es una plataforma web y aplicación progresiva (PWA)
          independiente dedicada a la afición del Real Sporting. Reúne seguimiento de la temporada,
          archivo histórico, espacio comunitario moderado y juegos diarios sobre la historia del club.
        </LegalP>
        <LegalP>
          Está diseñada y desarrollada por <LegalStrong>{LEGAL_OWNER_NAME}</LegalStrong> (
          {LEGAL_OWNER_LOCATION}) como iniciativa comunitaria sin ánimo de lucro, gratuita y sin
          publicidad comercial.
        </LegalP>
      </>
    ),
  },
  {
    id: "independencia",
    title: "Independencia y uso de activos",
    content: (
      <>
        <LegalP>
          <LegalStrong>
            Mareona no es un sitio oficial ni cuenta con patrocinio, respaldo o afiliación con el
            Real Sporting de Gijón, S.A.D., LaLiga ni la RFEF.
          </LegalStrong>
        </LegalP>
        <LegalP>
          El nombre del club, los escudos, las fotografías de futbolistas y demás signos distintivos
          pertenecen a sus respectivos titulares legales y se utilizan únicamente con fines
          informativos, históricos y divulgativos. La plataforma cuenta con un mecanismo técnico para
          sustituir de inmediato los activos de terceros por marcadores neutros y atiende cualquier
          solicitud de retirada en un plazo máximo de 48 horas a través de <LegalMail />.
        </LegalP>
      </>
    ),
  },
  {
    id: "estandares",
    title: "Estándares técnicos y privacidad",
    content: (
      <LegalList>
        <li>
          <LegalStrong>Accesibilidad WCAG 2.2 AA:</LegalStrong> navegación completa por teclado,
          contraste verificado y diseño optimizado para uso en móvil.
        </li>
        <li>
          <LegalStrong>Resiliencia sin conexión:</LegalStrong> PWA instalable con soporte offline
          para juegos y archivo histórico en días de partido en El Molinón.
        </li>
        <li>
          <LegalStrong>Privacidad y seguridad:</LegalStrong> sin cookies publicitarias ni rastreadores
          de terceros, control de acceso en base de datos (RLS) y cumplimiento del RGPD.
        </li>
      </LegalList>
    ),
  },
  {
    id: "colaboracion",
    title: "Colaboración y contacto",
    content: (
      <>
        <LegalP>
          Mareona está abierta a explorar sinergias o colaboraciones institucionales, divulgativas o
          de experiencia de aficionado con el club, peñas sportinguistas y entidades locales. Para
          cualquier propuesta o consulta, escribe a <LegalMail />.
        </LegalP>
        <LegalP>
          Puedes consultar toda la documentación legal en el{" "}
          <Link href="/aviso-legal" className={INLINE_LINK}>
            Aviso legal
          </Link>
          , la{" "}
          <Link href="/privacidad" className={INLINE_LINK}>
            Política de privacidad
          </Link>{" "}
          y los{" "}
          <Link href="/terminos" className={INLINE_LINK}>
            Términos de uso
          </Link>
          .
        </LegalP>
      </>
    ),
  },
];

export default function AcercaDePage() {
  return <LegalDocument title="Acerca de Mareona" sections={SECTIONS} />;
}
