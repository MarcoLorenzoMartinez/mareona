import type { Metadata } from "next";
import Link from "next/link";
import {
  OFFLINE_ARCHIVE_LINKS,
  OFFLINE_GAME_LINKS,
  type OfflineLink,
} from "@/lib/pwa/offline-routes";

export const metadata: Metadata = {
  title: "Sin conexión",
  robots: { index: false },
};

const LINK_CLASS =
  "flex min-h-11 items-center justify-between rounded-lg border border-[var(--border)] bg-white px-4 text-sm font-semibold text-[var(--foreground)] transition-colors duration-150 hover:border-[var(--primary)] active:bg-[var(--surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2";

function LinkGroup({ title, links }: { readonly title: string; readonly links: readonly OfflineLink[] }) {
  return (
    <section aria-labelledby={`offline-${title}`} className="space-y-2">
      <h2 id={`offline-${title}`} className="text-xs font-bold tracking-wider text-[var(--muted-foreground)] uppercase">
        {title}
      </h2>
      <ul className="grid gap-2 sm:grid-cols-2">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className={LINK_CLASS}>
              {link.label}
              <span aria-hidden="true" className="text-[var(--muted-foreground)]">→</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Fallback served by the service worker when a page is not available offline. */
export default function OfflinePage() {
  return (
    <div className="mx-auto w-full max-w-xl space-y-8 py-2 md:py-4">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)] md:text-3xl">
          Sin conexión
        </h1>
        <p className="text-sm text-[var(--muted-foreground)]">
          No tienes conexión, mientras tanto puedes visitar las siguientes secciones:
        </p>
      </div>
      <LinkGroup title="Histórico" links={OFFLINE_ARCHIVE_LINKS} />
      <LinkGroup title="Juegos" links={OFFLINE_GAME_LINKS} />
    </div>
  );
}
