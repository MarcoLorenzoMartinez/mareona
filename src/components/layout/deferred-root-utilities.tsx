// Client: Diferimiento de utilidades no críticas (SW, telemetría, toasts y sync offline) tras hidratación
"use client";

import dynamic from "next/dynamic";

const ToastContainer = dynamic(
  () => import("@/components/ui/toast-container").then((m) => m.ToastContainer),
  { ssr: false }
);
const OfflineSyncListener = dynamic(
  () => import("@/components/pwa/offline-sync-listener").then((m) => m.OfflineSyncListener),
  { ssr: false }
);
const OfflineTransitionListener = dynamic(
  () =>
    import("@/components/pwa/offline-transition-listener").then(
      (m) => m.OfflineTransitionListener
    ),
  { ssr: false }
);
const ServiceWorkerRegister = dynamic(
  () =>
    import("@/components/pwa/service-worker-register").then(
      (m) => m.ServiceWorkerRegister
    ),
  { ssr: false }
);
const TelemetryBeacon = dynamic(
  () => import("@/components/telemetry/telemetry-beacon").then((m) => m.TelemetryBeacon),
  { ssr: false }
);

/**
 * Code-splits non-visual background utilities from the critical root bundle
 * without changing user-visible layout or behavior.
 */
export function DeferredRootUtilities() {
  return (
    <>
      <OfflineSyncListener />
      <OfflineTransitionListener />
      <TelemetryBeacon />
      <ToastContainer />
      <ServiceWorkerRegister />
    </>
  );
}
