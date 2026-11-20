import Link from "next/link";
import { InstallAction } from "@/components/pwa/install-action";
import { CONTACT_EMAIL, COPYRIGHT_YEAR } from "@/lib/legal/constants";

const LEGAL_LINKS = [
  { href: "/aviso-legal", label: "Aviso legal" },
  { href: "/privacidad", label: "Privacidad" },
  { href: "/terminos", label: "Términos" },
  { href: "/cookies", label: "Cookies" },
] as const;

const LINK_CLASS =
  "inline-flex min-h-11 items-center rounded-sm text-sm text-[var(--muted-foreground)] transition-colors duration-150 hover:text-[var(--primary)] active:text-[var(--primary-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 md:min-h-9";

/**
 * Global footer: legal navigation, support contact and the independence
 * disclaimer required by the brand rules.
 */
export function Footer() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--background)] pb-24 md:pb-0">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-1 px-4 py-4 md:gap-2 md:px-6 md:py-4">
        <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between md:gap-6">
          <span className="text-sm font-black tracking-wider text-[var(--primary)] uppercase">
            Mareona
          </span>

          <nav aria-label="Información legal">
            <ul className="flex flex-wrap items-center gap-x-5">
              {LEGAL_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={LINK_CLASS}>
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <a href={`mailto:${CONTACT_EMAIL}`} className={LINK_CLASS}>
                  Contacto
                </a>
              </li>
              <li>
                <InstallAction label="Instalar app" className={LINK_CLASS} />
              </li>
            </ul>
          </nav>
        </div>

        <p className="border-t border-[var(--border)] pt-3 text-xs leading-relaxed text-[var(--muted-foreground)]">
          <span className="tabular-nums">© {COPYRIGHT_YEAR}</span> Mareona. Proyecto independiente
          creado por aficionados, sin vinculación oficial con el Real Sporting de Gijón, S.A.D.
        </p>
      </div>
    </footer>
  );
}
