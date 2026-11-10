// Client: Decide en el navegador entre prompt nativo, guía manual o enlace a /instalar
"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { usePwaInstall } from "./pwa-install-provider";
import { InstallGuideDialog } from "./install-guide-dialog";

interface InstallActionProps {
  readonly label: string;
  readonly className: string;
}

/**
 * Single-tap install entry point shared by the footer, banner and /instalar.
 * - Native prompt available: opens the browser install dialog directly.
 * - iOS, in-app or unsupported browsers: opens the manual guide.
 * - Installed app: renders nothing.
 * - Before hydration (or without JS): plain link to /instalar, so it never breaks.
 */
export function InstallAction({ label, className }: InstallActionProps) {
  const { platform, install } = usePwaInstall();
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const closeGuide = useCallback(() => setIsGuideOpen(false), []);

  if (platform === null) {
    return (
      <Link href="/instalar" className={className}>
        {label}
      </Link>
    );
  }
  if (platform === "installed") return null;

  const handleClick = platform === "native-prompt" ? install : () => setIsGuideOpen(true);

  return (
    <>
      <button type="button" onClick={handleClick} className={className}>
        {label}
      </button>
      {platform !== "native-prompt" && (
        <InstallGuideDialog isOpen={isGuideOpen} platform={platform} onClose={closeGuide} />
      )}
    </>
  );
}
