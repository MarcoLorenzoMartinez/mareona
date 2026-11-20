import type { Metadata } from "next";
import { getDictionary } from "@/i18n";

const dict = getDictionary();

export const metadata: Metadata = {
  title: dict.profile.metadata.title,
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
