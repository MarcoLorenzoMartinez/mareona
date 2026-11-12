import { Suspense } from "react";
import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { TopProgressBar } from "@/components/layout/top-progress-bar";
import { GlobalAnnouncementBanner } from "@/components/layout/global-announcement-banner";
import { AuthProvider } from "@/context/auth-context";
import { AuthModal } from "@/components/auth/auth-modal";
import { ToastContainer } from "@/components/ui/toast-container";
import { PwaInstallProvider } from "@/components/pwa/pwa-install-provider";
import { OfflineBanner } from "@/components/pwa/offline-banner";
import { OfflineSyncListener } from "@/components/pwa/offline-sync-listener";
import { ServiceWorkerRegister } from "@/components/pwa/service-worker-register";
import { TelemetryBeacon } from "@/components/telemetry/telemetry-beacon";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://mareona.es";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "Mareona — La grada digital del Real Sporting",
    template: "%s — Mareona",
  },
  description:
    "Hub comunitario, red social y plataforma de datos para los aficionados del Real Sporting de Gijón.",
  openGraph: {
    title: "Mareona — La grada digital del Real Sporting",
    description:
      "Partidos en directo, clasificación, porras, juegos diarios y archivo histórico del Real Sporting.",
    url: "/",
    siteName: "Mareona",
    locale: "es_ES",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mareona — La grada digital del Real Sporting",
    description:
      "Partidos en directo, clasificación, porras, juegos diarios y archivo histórico del Real Sporting.",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/favicon.ico" },
    ],
    apple: { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
  },
  appleWebApp: {
    capable: true,
    title: "Mareona",
    // "default" keeps the status bar opaque: the app headers do not yet pad for the notch.
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#e2001a",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="es"
      suppressHydrationWarning
      className={`${geistSans.variable} h-full antialiased`}
    >
      <body
        suppressHydrationWarning
        className="min-h-full flex flex-col bg-[var(--background)] text-[var(--foreground)]"
      >
        <PwaInstallProvider>
          <AuthProvider>
            <TopProgressBar />
            <Suspense fallback={null}>
              <GlobalAnnouncementBanner />
            </Suspense>
            <OfflineBanner />
            <OfflineSyncListener />
            <Suspense fallback={null}>
              <TelemetryBeacon />
            </Suspense>
            <AuthModal />
            {children}
            <ToastContainer />
          </AuthProvider>
          <ServiceWorkerRegister />
        </PwaInstallProvider>
      </body>
    </html>
  );
}
