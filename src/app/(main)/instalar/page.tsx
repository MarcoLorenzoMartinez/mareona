import type { Metadata } from "next";
import { InstallPanel } from "@/components/pwa/install-panel";

export const metadata: Metadata = {
  title: "Instalar la app",
  description: "Instala Mareona en tu móvil: acceso directo, pantalla completa y juegos sin conexión.",
};

const BENEFITS = [
  "Acceso directo desde la pantalla de inicio",
  "Pantalla completa, sin barra del navegador",
  "Juegos y archivo histórico sin conexión",
] as const;

export default function InstalarPage() {
  return (
    <div className="mx-auto w-full max-w-lg space-y-6 py-2 md:py-4">
      <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)] md:text-3xl">
        Instalar Mareona
      </h1>
      <InstallPanel />
      <ul className="space-y-2 text-sm text-[var(--muted-foreground)]">
        {BENEFITS.map((benefit) => (
          <li key={benefit} className="flex items-center gap-2.5">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--primary)]" aria-hidden="true" />
            {benefit}
          </li>
        ))}
      </ul>
    </div>
  );
}
