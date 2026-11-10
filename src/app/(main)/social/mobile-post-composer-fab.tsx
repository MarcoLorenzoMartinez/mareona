// Client: Botón flotante móvil (FAB) para redactar en la tertulia
"use client";

import { Feather } from "lucide-react";

export function MobilePostComposerFab({ onClick }: { readonly onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Escribir publicación en la tertulia"
      className="fixed bottom-20 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--primary)] text-white shadow-xl transition-transform duration-150 active:scale-95 sm:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--primary)]"
    >
      <Feather className="h-6 w-6" aria-hidden="true" strokeWidth={2.2} />
    </button>
  );
}
