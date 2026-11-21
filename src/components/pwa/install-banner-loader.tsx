// Client: Carga diferida del aviso móvil de instalación PWA
"use client";

import dynamic from "next/dynamic";

const LazyInstallBanner = dynamic(
  () => import("./install-banner").then((m) => m.InstallBanner),
  { ssr: false }
);

/**
 * Loads the PWA install banner lazily on client without adding weight to the initial shell bundle.
 */
export function InstallBannerLoader() {
  return <LazyInstallBanner />;
}
