import { Suspense } from "react";
import { MainNav } from "@/components/layout/main-nav";
import { Footer } from "@/components/layout/footer";
import { InstallBanner } from "@/components/pwa/install-banner";

/**
 * Main application shell wrapping primary authenticated/public vertical areas.
 * Provides accessible skip-navigation link, global footer, and mobile navigation padding.
 */
export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col">
      {/* WCAG 2.2 AA Skip Link for keyboard navigation */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-md focus:bg-[var(--primary)] focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white focus:shadow-md focus:ring-2 focus:ring-[var(--primary-strong)] focus:ring-offset-2"
      >
        Saltar al contenido principal
      </a>

      {/* Dual navigation header and mobile bottom bar */}
      <MainNav />

      {/* Main content landmark */}
      <main
        id="main-content"
        tabIndex={-1}
        className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 pt-4 pb-12 md:px-6 md:py-6 focus:outline-none"
      >
        {children}
      </main>

      {/* Global corporate footer */}
      <Footer />

      <Suspense fallback={null}>
        <InstallBanner />
      </Suspense>
    </div>
  );
}
