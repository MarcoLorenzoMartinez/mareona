// Client: Captura beforeinstallprompt y el modo standalone, solo disponibles en el navegador
"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { resolveInstallPlatform, type InstallPlatform } from "@/lib/pwa/install-platform";
import { toast } from "@/lib/ui/toast";

/** Chromium-only event, absent from lib.dom typings. */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

interface PwaInstallContextValue {
  /** Null until the first client render, so SSR and hydration markup match. */
  readonly platform: InstallPlatform | null;
  readonly install: () => Promise<void>;
}

const PwaInstallContext = createContext<PwaInstallContextValue>({
  platform: null,
  install: async () => undefined,
});

/**
 * Mounted at the root so the one-shot `beforeinstallprompt` event is never
 * missed, then shared with every install entry point (footer, banner, page).
 */
export function PwaInstallProvider({ children }: { readonly children: ReactNode }) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState<boolean | null>(null);

  useEffect(() => {
    const media = window.matchMedia("(display-mode: standalone)");
    const readStandalone = () =>
      setIsStandalone(
        media.matches || (navigator as Navigator & { standalone?: boolean }).standalone === true
      );
    const handlePrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };
    const handleInstalled = () => {
      setDeferredPrompt(null);
      setIsStandalone(true);
      toast.success("Mareona instalada");
    };

    readStandalone();
    media.addEventListener("change", readStandalone);
    window.addEventListener("beforeinstallprompt", handlePrompt);
    window.addEventListener("appinstalled", handleInstalled);
    return () => {
      media.removeEventListener("change", readStandalone);
      window.removeEventListener("beforeinstallprompt", handlePrompt);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  const install = useCallback(async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    // A deferred prompt is single-use: it must be discarded whatever the answer.
    setDeferredPrompt(null);
  }, [deferredPrompt]);

  const platform = useMemo<InstallPlatform | null>(() => {
    if (isStandalone === null) return null;
    return resolveInstallPlatform({
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      maxTouchPoints: navigator.maxTouchPoints,
      isStandalone,
      hasDeferredPrompt: deferredPrompt !== null,
    });
  }, [isStandalone, deferredPrompt]);

  const value = useMemo(() => ({ platform, install }), [platform, install]);

  return <PwaInstallContext.Provider value={value}>{children}</PwaInstallContext.Provider>;
}

export function usePwaInstall(): PwaInstallContextValue {
  return useContext(PwaInstallContext);
}
