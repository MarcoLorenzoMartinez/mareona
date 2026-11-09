import type { ReactNode } from "react";
import Link from "next/link";
import { assertAdmin } from "@/lib/admin/guard";
import { TeamCrest } from "@/components/media/team-crest";
import { AdminNav } from "./admin-nav";

interface AdminLayoutProps {
  readonly children: ReactNode;
}

/**
 * Administrative Layout for Mareona.
 * Protected by server-side Zero-Trust guard (`assertAdmin`). Unauthenticated or unauthorized
 * requests trigger a 404 response to keep administrative areas completely hidden.
 */
export default async function AdminLayout({ children }: AdminLayoutProps) {
  const { user } = await assertAdmin();

  return (
    <div className="min-h-screen bg-white text-[var(--foreground)]">
      <header className="border-b border-[var(--border)] bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)]"
              aria-label="Volver al inicio de Mareona"
            >
              <TeamCrest teamName="Real Sporting" isSporting size="md" crestUrl={null} />
              <div className="flex flex-col">
                <span className="text-base font-bold tracking-tight text-[var(--foreground)]">
                  Mareona Admin
                </span>
                <span className="text-xs text-[var(--muted-foreground)]">
                  Gestión y Moderación Oficial
                </span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <span
              className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-900"
              role="status"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-amber-600" aria-hidden="true" />
              Acceso Restringido
            </span>

            <span className="hidden text-xs text-[var(--muted-foreground)] sm:inline tabular-nums">
              {user.email}
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <AdminNav />
        <div className="mt-6">{children}</div>
      </main>
    </div>
  );
}
