import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { TopProgressBar } from "@/components/layout/top-progress-bar";
import { AuthProvider } from "@/context/auth-context";
import { AuthModal } from "@/components/auth/auth-modal";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mareona — Real Sporting de Gijón",
  description:
    "Hub comunitario, red social y plataforma de datos para los aficionados del Real Sporting de Gijón.",
  icons: {
    icon: [
      { url: "/logo.png", type: "image/png" },
      { url: "/logo.svg", type: "image/svg+xml" },
    ],
    apple: "/logo.png",
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body
        suppressHydrationWarning
        className="min-h-full flex flex-col bg-[var(--background)] text-[var(--foreground)]"
      >
        <AuthProvider>
          <TopProgressBar />
          <AuthModal />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
