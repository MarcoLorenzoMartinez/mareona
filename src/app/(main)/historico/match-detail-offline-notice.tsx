// Client: Vista de aviso y reintento cuando no hay conexión para descargar el acta oficial
"use client";

interface MatchDetailOfflineNoticeProps {
  readonly onRetry: () => void;
}

/**
 * Accessible offline state notice displayed within the match detail modal
 * when the official match report cannot be downloaded over the network.
 *
 * @param onRetry Callback triggered when user taps the retry button.
 */
export function MatchDetailOfflineNotice({ onRetry }: MatchDetailOfflineNoticeProps) {
  return (
    <div className="py-10 px-4 text-center">
      <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 text-neutral-500">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5"
          aria-hidden="true"
        >
          <line x1="1" y1="1" x2="23" y2="23" />
          <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
          <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
          <path d="M10.71 5.05A16 16 0 0 1 22.58 9" />
          <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
          <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
          <line x1="12" y1="20" x2="12.01" y2="20" />
        </svg>
      </div>
      <p className="text-xs text-[var(--foreground)] font-semibold mb-1">
        Acta no disponible sin conexión
      </p>
      <p className="text-xs text-[var(--foreground-muted)] max-w-sm mx-auto mb-4">
        Las actas oficiales completas requieren conexión activa a internet. Comprueba tu red y vuelve a intentarlo.
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex items-center justify-center px-4 py-2 min-h-[44px] rounded-full text-xs font-semibold bg-[var(--primary)] text-white hover:opacity-95 transition-opacity cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
      >
        Reintentar carga
      </button>
    </div>
  );
}
