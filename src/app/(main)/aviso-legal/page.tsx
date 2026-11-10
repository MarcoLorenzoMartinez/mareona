import type { Metadata } from "next";
import Link from "next/link";
import { LegalDocument, type LegalSection } from "@/components/legal/legal-document";
import { LegalMail, LegalP, LegalStrong } from "@/components/legal/legal-elements";

export const metadata: Metadata = {
  title: "Aviso legal",
  description: "Titularidad, independencia respecto al club y condiciones de uso de Mareona.",
};

const SECTIONS: readonly LegalSection[] = [
  {
    id: "titular",
    title: "Titular y contacto",
    content: (
      <>
        <LegalP>
          Mareona es una iniciativa comunitaria de aficionados del Real Sporting que ofrece datos
          de la temporada, archivo histórico, juegos y una tertulia social. El acceso y el uso de
          la web son gratuitos.
        </LegalP>
        <LegalP>
          Para cualquier consulta, aviso legal o solicitud sobre contenidos, escribe a <LegalMail />.
        </LegalP>
      </>
    ),
  },
  {
    id: "independencia",
    title: "Independencia respecto al club",
    content: (
      <>
        <LegalP>
          <LegalStrong>
            Mareona es una plataforma independiente y comunitaria desarrollada por y para
            aficionados sportinguistas. No tiene vinculación oficial, comercial ni jurídica con el
            Real Sporting de Gijón, S.A.D.
          </LegalStrong>
        </LegalP>
        <LegalP>
          El nombre, el escudo y demás signos distintivos del club y del resto de equipos
          pertenecen a sus titulares y se muestran únicamente con fines informativos.
        </LegalP>
      </>
    ),
  },
  {
    id: "condiciones-de-uso",
    title: "Condiciones de uso",
    content: (
      <>
        <LegalP>
          El acceso a Mareona atribuye la condición de usuario y supone aceptar este aviso y los{" "}
          <Link href="/terminos" className="font-medium text-[var(--primary-strong)] underline underline-offset-2 hover:text-[var(--primary)]">
            Términos de uso
          </Link>
          . El usuario se compromete a utilizar la web conforme a la ley, a la buena fe y a estas
          condiciones.
        </LegalP>
        <LegalP>
          Los datos deportivos proceden de proveedores externos y pueden sufrir retrasos o errores.
          Mareona no garantiza su exactitud ni la disponibilidad ininterrumpida del servicio.
        </LegalP>
      </>
    ),
  },
  {
    id: "propiedad-intelectual",
    title: "Propiedad intelectual",
    content: (
      <>
        <LegalP>
          El código, el diseño y la selección y organización de los contenidos de Mareona son
          propiedad de sus creadores. No se permite su reproducción o explotación comercial sin
          autorización expresa.
        </LegalP>
        <LegalP>
          Si eres titular de derechos sobre alguna imagen, dato o contenido y consideras que no
          debería aparecer, escríbenos a <LegalMail /> indicando el contenido y la URL. Lo
          revisaremos y, cuando proceda, lo retiraremos sin demora.
        </LegalP>
      </>
    ),
  },
  {
    id: "contenido-de-usuarios",
    title: "Contenido de los usuarios",
    content: (
      <LegalP>
        Los mensajes y publicaciones de la tertulia son responsabilidad exclusiva de quien los
        escribe y no reflejan la opinión de Mareona. Al tener conocimiento de un contenido ilícito
        o contrario a las normas, se retirará con diligencia.
      </LegalP>
    ),
  },
  {
    id: "enlaces-externos",
    title: "Enlaces a terceros",
    content: (
      <LegalP>
        Mareona puede enlazar a sitios de terceros sobre cuyo contenido y políticas no tiene
        control ni asume responsabilidad.
      </LegalP>
    ),
  },
  {
    id: "legislacion",
    title: "Legislación y jurisdicción",
    content: (
      <LegalP>
        Este aviso se rige por la legislación española. Para cualquier controversia serán
        competentes los juzgados y tribunales que correspondan conforme a la normativa vigente,
        incluida la aplicable a consumidores y usuarios.
      </LegalP>
    ),
  },
];

export default function AvisoLegalPage() {
  return <LegalDocument title="Aviso legal" sections={SECTIONS} />;
}
