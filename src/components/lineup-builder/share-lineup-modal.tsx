// Client: Modal para compartir la alineación en Tertulia Social o Grada de Partido
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/lib/ui/toast";
import { useAuth } from "@/context/auth-context";
import {
  encodeSharedLineup,
  saveLocalSharedLineup,
  type SharedLineupData,
} from "@/lib/lineup-builder/shared-lineup-codec";
import { createSocialPost } from "@/lib/social/actions";
import { createMatchComment } from "@/lib/match-community/actions";
import { ShareLineupForm, type ShareDestination } from "./share-lineup-form";

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
  const [destination, setDestination] = useState<ShareDestination>("social");
  const [userComment, setUserComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const encodedTag = encodeSharedLineup(lineup);
  const maxCommentLength = Math.max(50, 490 - encodedTag.length);
  const remainingChars = maxCommentLength - userComment.length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      openAuthModal("signin");
      return;
    }

    setIsSubmitting(true);
    saveLocalSharedLineup(lineup);

    const messagePrefix = userComment.trim() || `Mi alineación para el partido (${lineup.formationKey})`;
    const fullBody = `${messagePrefix}\n\n${encodedTag}`;

    try {
      if (destination === "social") {
        const res = await createSocialPost({ body: fullBody });
        if (!res.success) {
          toast.error(res.error ?? "No se pudo compartir en la tertulia");
          setIsSubmitting(false);
          return;
        }
        toast.success("¡Alineación compartida en la Tertulia!");
        onClose();
        router.push("/social");
      } else if (destination === "match" && nextMatchId) {
        const res = await createMatchComment({
          matchId: nextMatchId,
          body: fullBody,
        });
        if (!res.success) {
          toast.error(res.error ?? "No se pudo compartir en la grada");
          setIsSubmitting(false);
          return;
        }
        toast.success("¡Alineación compartida en la Grada del partido!");
        onClose();
        router.push(`/temporada/partidos/${nextMatchId}`);
      }
    } catch {
      toast.error("Ocurrió un error inesperado al compartir");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-lineup-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-white p-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150"
      >
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
          <h2 id="share-lineup-title" className="text-base font-bold text-neutral-900">
            Compartir Mi Once
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal"
            className="rounded-full p-1 text-neutral-500 hover:bg-neutral-100 transition-colors"
          >
            ✕
          </button>
        </div>

        <ShareLineupForm
          destination={destination}
          onDestinationChange={setDestination}
          userComment={userComment}
          onCommentChange={setUserComment}
          maxCommentLength={maxCommentLength}
          remainingChars={remainingChars}
          lineup={lineup}
          nextMatchId={nextMatchId}
          nextMatchOpponent={nextMatchOpponent}
          isSubmitting={isSubmitting}
          onClose={onClose}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}
