import { Suspense, type ReactNode } from "react";
import Link from "next/link";
import { assertAdmin } from "@/lib/admin/guard";
import { UserNav } from "@/components/auth/user-nav";
import { AdminNav } from "./admin-nav";

interface AdminLayoutProps {
  readonly children: ReactNode;
}

async function AdminProtectedShell({ children }: { readonly children: ReactNode }) {
  await assertAdmin();

  return (
    <div className="min-h-screen bg-white text-[var(--foreground)]">
      <header className="sticky top-0 z-40 w-full border-b border-[var(--primary-strong)] bg-[var(--primary)] text-white shadow-xs">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link
            href="/admin"
            className="flex items-center gap-2.5 rounded-md p-1 text-white transition-opacity hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--primary)]"
            aria-label="Panel de administración de Mareona"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png"
              alt="Mareona Logo"
              width={32}
              height={32}
              className="h-8 w-8 rounded-sm object-contain"
            />
            <div className="flex flex-col">
              <span className="text-base font-black tracking-wider uppercase leading-none text-white">
                Mareona
              </span>
              <span className="text-[10px] font-semibold tracking-widest text-white/80 uppercase mt-0.5">
                Administración
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold text-white/85 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <span aria-hidden="true">&larr;</span>
              <span className="hidden sm:inline">Volver a la web</span>
              <span className="sm:hidden">Web</span>
            </Link>
            <UserNav />
          </div>
        </div>
      </header>

      <AdminNav />

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        {children}
      </main>
    </div>
  );
}

/**
 * Administrative Layout for Mareona.
 * Protected by server-side Zero-Trust guard (`assertAdmin`). Wrapped in a Suspense
 * boundary to support Next.js partial prerendering while enforcing runtime auth validation.
 */
export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white">
          <header className="h-16 w-full border-b border-[var(--primary-strong)] bg-[var(--primary)]" />
          <div className="mx-auto max-w-6xl p-6">
            <div className="h-8 w-48 animate-pulse rounded bg-neutral-100" />
          </div>
        </div>
      }
    >
      <AdminProtectedShell>{children}</AdminProtectedShell>
    </Suspense>
  );
}
