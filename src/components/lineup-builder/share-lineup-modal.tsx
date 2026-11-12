// Client: Modal selector de destino para compartir la alineación en Tertulia o Grada
"use client";

import { useRouter } from "next/navigation";
import { MessageSquare, Trophy, ChevronRight, X } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useModalA11y } from "@/lib/ui/use-modal-a11y";
import {
  saveLocalSharedLineup,
  type SharedLineupData,
} from "@/lib/lineup-builder/shared-lineup-codec";

interface ShareLineupModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly lineup: SharedLineupData;
  readonly nextMatchId?: string | null;
  readonly nextMatchOpponent?: string | null;
}

export function ShareLineupModal({
  isOpen,
  onClose,
  lineup,
  nextMatchId,
  nextMatchOpponent,
}: ShareLineupModalProps) {
  const router = useRouter();
  const { user, openAuthModal } = useAuth();
  const { handleBackdropClick } = useModalA11y({ isOpen, onClose });

  if (!isOpen) return null;

  const handleSelectDestination = (destination: "social" | "match") => {
    if (!user) {
      openAuthModal("signin");
      return;
    }

    saveLocalSharedLineup(lineup);
    onClose();

    if (destination === "social") {
      router.push("/social?adjuntarOnce=1");
    } else if (destination === "match" && nextMatchId) {
      router.push(`/temporada/partidos/${nextMatchId}?adjuntarOnce=1`);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-lineup-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={handleBackdropClick}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-2xl border border-[var(--border)] bg-white p-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150"
      >
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
          <div>
            <h2 id="share-lineup-title" className="text-base font-bold text-neutral-900">
              Compartir Mi Once
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Esquema {lineup.formationKey}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal"
            className="flex h-9 w-9 min-h-[44px] min-w-[44px] items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] -mr-2 cursor-pointer"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="mt-4 flex flex-col gap-2.5">
          <p className="text-xs font-semibold text-neutral-600 mb-1">
            ¿Dónde quieres debatir tu alineación?
          </p>

          {/* Opción 1: Tertulia Rojiblanca */}
          <button
            type="button"
            onClick={() => handleSelectDestination("social")}
            className="group flex items-center justify-between gap-3 rounded-xl border border-neutral-200 bg-white p-3.5 text-left transition-all hover:border-[#e2001a]/40 hover:bg-neutral-50/80 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e2001a] cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#e2001a]/10 text-[#e2001a]">
                <MessageSquare className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <span className="block text-sm font-bold text-neutral-900 group-hover:text-[#e2001a] transition-colors">
                  Tertulia Rojiblanca
                </span>
                <span className="block text-xs text-neutral-500">
                  Publicar en el feed de aficionados
                </span>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 shrink-0 text-neutral-400 group-hover:text-[#e2001a] group-hover:translate-x-0.5 transition-all" aria-hidden="true" />
          </button>

          {/* Opción 2: Grada de Partido (si hay partido próximo) */}
          {nextMatchId && (
            <button
              type="button"
              onClick={() => handleSelectDestination("match")}
              className="group flex items-center justify-between gap-3 rounded-xl border border-neutral-200 bg-white p-3.5 text-left transition-all hover:border-[#e2001a]/40 hover:bg-neutral-50/80 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e2001a] cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-neutral-700 group-hover:bg-[#e2001a]/10 group-hover:text-[#e2001a] transition-colors">
                  <Trophy className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <span className="block text-sm font-bold text-neutral-900 group-hover:text-[#e2001a] transition-colors">
                    Grada vs {nextMatchOpponent ?? "Rival"}
                  </span>
                  <span className="block text-xs text-neutral-500">
                    Comentar en el hilo del partido
                  </span>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-neutral-400 group-hover:text-[#e2001a] group-hover:translate-x-0.5 transition-all" aria-hidden="true" />
            </button>
          )}
        </div>

        <div className="mt-5 pt-3 border-t border-[var(--border)] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] rounded-full border border-neutral-300 px-4 py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] cursor-pointer"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
