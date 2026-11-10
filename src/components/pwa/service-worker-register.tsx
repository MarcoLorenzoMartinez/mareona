// Client: Registro del Service Worker, solo posible en el navegador
"use client";

import { useEffect } from "react";

/**
 * Registers /sw.js in production only: a caching worker in `next dev` would
 * serve stale bundles and break hot reloading. Registration waits for `load`
 * so it never competes with the page's own resources.
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;

    const register = () => {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/", updateViaCache: "none" })
        .catch(() => undefined);
    };

    if (document.readyState === "complete") {
      register();
      return;
    }
    window.addEventListener("load", register, { once: true });
    return () => window.removeEventListener("load", register);
  }, []);

  return null;
}
