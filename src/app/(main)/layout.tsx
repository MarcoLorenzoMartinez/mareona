import { MainNav } from "@/components/layout/main-nav";

/**
 * Main application shell wrapping primary authenticated/public vertical areas.
 * Provides accessible skip-navigation link and offsets for mobile bottom navigation.
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

      {/* Main content landmark with bottom padding to avoid mobile nav overlap */}
      <main
        id="main-content"
        tabIndex={-1}
        className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 pt-4 pb-24 md:px-6 md:py-8 focus:outline-none"
      >
        {children}
      </main>
    </div>
  );
}
