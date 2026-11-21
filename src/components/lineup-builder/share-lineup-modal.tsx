// Client: Modal selector de destino para compartir la alineación en Social o Partido
"use client";

import { useRouter } from "next/navigation";
import { X, MessageSquare } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useModalA11y } from "@/lib/ui/use-modal-a11y";
import { TeamCrest } from "@/components/media/team-crest";
import {
  saveLocalSharedLineup,
  type SharedLineupData,
} from "@/lib/lineup-builder/shared-lineup-codec";
import { getDictionary } from "@/i18n";

interface ShareLineupModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly lineup: SharedLineupData;
  readonly nextMatchId?: string | null;
  readonly nextMatchOpponent?: string | null;
  readonly nextMatchOpponentCrestUrl?: string | null;
}

export function ShareLineupModal({
  isOpen,
  onClose,
  lineup,
  nextMatchId,
  nextMatchOpponent,
  nextMatchOpponentCrestUrl,
}: ShareLineupModalProps) {
  const dict = getDictionary();
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
      router.push(`/temporada/partidos/${nextMatchId}?tab=grada&adjuntarOnce=1`);
    }
  };

  const matchLabel = nextMatchOpponent
    ? `${dict.lineupBuilder.shareModal.matchPrefix} ${nextMatchOpponent}`
    : dict.lineupBuilder.shareModal.nextMatchFallback;

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
        className="w-full max-w-sm rounded-2xl border border-[var(--border)] bg-white p-5 shadow-xl animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Cabecera limpia */}
        <div className="flex items-center justify-between">
          <h2 id="share-lineup-title" className="text-base font-bold text-neutral-900">
            {dict.lineupBuilder.shareModal.title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={dict.lineupBuilder.shareModal.closeAria}
            className="flex h-9 w-9 min-h-[44px] min-w-[44px] items-center justify-center rounded-full text-neutral-600 hover:bg-neutral-100 hover:text-neutral-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e2001a] cursor-pointer -mr-2"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {/* Destinos directos con iconos identificativos */}
        <div className="mt-4 flex flex-col gap-2.5">
          {/* Opción 1: Social con icono de conversación */}
          <button
            type="button"
            onClick={() => handleSelectDestination("social")}
            className="group flex items-center justify-between gap-3 rounded-xl border border-neutral-200/90 bg-white p-3.5 text-left transition-all duration-150 hover:border-[#e2001a]/50 hover:bg-neutral-50/60 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e2001a] cursor-pointer"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-8 w-11 shrink-0 items-center justify-center">
                <div className="flex h-7.5 w-7.5 items-center justify-center rounded-full bg-neutral-100 text-neutral-600 group-hover:bg-red-50 group-hover:text-[#e2001a] transition-colors">
                  <MessageSquare className="h-4 w-4" aria-hidden="true" />
                </div>
              </div>
              <span className="text-sm font-bold text-neutral-900 group-hover:text-[#e2001a] transition-colors truncate">
                {dict.lineupBuilder.shareModal.socialLabel}
              </span>
            </div>
            <span className="shrink-0 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs font-semibold text-neutral-700 group-hover:border-[#e2001a] group-hover:bg-[#e2001a] group-hover:text-white transition-all">
              {dict.lineupBuilder.shareModal.shareAction}
            </span>
          </button>

          {/* Opción 2: Partido con emparejamiento de escudos (Sporting vs Rival) */}
          {nextMatchId && (
            <button
              type="button"
              onClick={() => handleSelectDestination("match")}
              className="group flex items-center justify-between gap-3 rounded-xl border border-neutral-200/90 bg-white p-3.5 text-left transition-all duration-150 hover:border-[#e2001a]/50 hover:bg-neutral-50/60 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e2001a] cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-8 w-11 shrink-0 items-center justify-center">
                  <div className="flex items-center -space-x-1.5">
                    <div className="relative z-10 flex h-6 w-6 items-center justify-center rounded-full border border-white bg-white shadow-2xs overflow-hidden">
                      <TeamCrest
                        crestUrl={null}
                        teamName="Real Sporting"
                        size="sm"
                        isSporting
                      />
                    </div>
                    <div className="relative z-0 flex h-6 w-6 items-center justify-center rounded-full border border-white bg-white shadow-2xs overflow-hidden">
                      <TeamCrest
                        crestUrl={nextMatchOpponentCrestUrl}
                        teamName={nextMatchOpponent ?? dict.lineupBuilder.shareModal.opponentFallback}
                        size="sm"
                      />
                    </div>
                  </div>
                </div>
                <span className="text-sm font-bold text-neutral-900 group-hover:text-[#e2001a] transition-colors truncate">
                  {matchLabel}
                </span>
              </div>
              <span className="shrink-0 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs font-semibold text-neutral-700 group-hover:border-[#e2001a] group-hover:bg-[#e2001a] group-hover:text-white transition-all">
                {dict.lineupBuilder.shareModal.shareAction}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
