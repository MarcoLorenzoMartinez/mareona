import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mi Perfil",
  robots: {
    index: false,
    follow: false,
  },
};

interface PerfilLayoutProps {
  readonly children: React.ReactNode;
}

export default function PerfilLayout({ children }: PerfilLayoutProps) {
  return <>{children}</>;
}
