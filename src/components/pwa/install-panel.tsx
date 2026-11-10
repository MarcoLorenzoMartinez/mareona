// Client: Estado de instalación y ruta dependen del navegador
"use client";

import Image from "next/image";
import { usePwaInstall } from "./pwa-install-provider";
import { InstallAction } from "./install-action";
import { InstallSteps } from "./install-steps";

/**
 * Body of /instalar. Mirrors the install state: native button, manual steps
 * for browsers without a prompt, or confirmation when already installed.
 */
export function InstallPanel() {
  const { platform } = usePwaInstall();

  return (
    <div className="flex items-start gap-4 rounded-xl border border-[var(--border)] bg-white p-5">
      <Image src="/icons/icon-192.png" alt="" width={56} height={56} className="h-14 w-14 shrink-0 rounded-xl" />
      <div className="min-w-0 flex-1 space-y-4" aria-live="polite">
        <p className="text-base font-bold text-[var(--foreground)]">Mareona</p>
        {platform === "installed" && (
          <p className="text-sm font-medium text-[var(--foreground)]">
            Ya tienes Mareona instalada en este dispositivo.
          </p>
        )}
        {platform === "native-prompt" && (
          <InstallAction
            label="Instalar app"
            className="inline-flex min-h-11 items-center rounded-full bg-[var(--primary)] px-6 text-sm font-bold text-white transition-transform duration-100 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2"
          />
        )}
        {(platform === "ios" || platform === "in-app" || platform === "manual") && (
          <InstallSteps platform={platform} />
        )}
      </div>
    </div>
  );
}
