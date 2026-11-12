// Client: Encabezado con pestañas y botón de cierre para FriendsModal
"use client";

import { X } from "lucide-react";

interface FriendsModalHeaderProps {
  readonly tab: "friends" | "search";
  readonly friendsCount: number;
  readonly onTabChange: (tab: "friends" | "search") => void;
  readonly onClose: () => void;
}

export function FriendsModalHeader({
  tab,
  friendsCount,
  onTabChange,
  onClose,
}: FriendsModalHeaderProps) {
  return (
    <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onTabChange("friends")}
          className={`inline-flex min-h-[36px] items-center justify-center rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] cursor-pointer ${
            tab === "friends"
              ? "bg-[var(--primary)] text-white font-bold"
              : "text-neutral-600 hover:text-neutral-900"
          }`}
        >
          Mis Amigos ({friendsCount})
        </button>
        <button
          type="button"
          onClick={() => onTabChange("search")}
          className={`inline-flex min-h-[36px] items-center justify-center rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] cursor-pointer ${
            tab === "search"
              ? "bg-[var(--primary)] text-white font-bold"
              : "text-neutral-600 hover:text-neutral-900"
          }`}
        >
          Buscar Aficionados
        </button>
      </div>

      <button
        type="button"
        onClick={onClose}
        className="flex h-9 w-9 min-h-[44px] min-w-[44px] items-center justify-center rounded-full text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] cursor-pointer -mr-2"
        aria-label="Cerrar ventana"
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}
