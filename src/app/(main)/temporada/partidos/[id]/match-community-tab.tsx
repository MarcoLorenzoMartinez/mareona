// Client: Pestaña Grada con tertulia de partido y calificaciones unificadas (MVP + Notas)
"use client";

import { useState, useEffect } from "react";
import { MatchCommentsThread } from "./match-comments-thread";
import { MatchPlayerRatings } from "./match-player-ratings";
import { getMatchComments } from "@/lib/match-community/actions";
import type { DomainMatchDetail } from "@/lib/sports-api/types";
import type { MatchComment } from "@/lib/match-community/types";

interface MatchCommunityTabProps {
  readonly match: DomainMatchDetail;
}

type SubSection = "comments" | "ratings";

export function MatchCommunityTab({ match }: MatchCommunityTabProps) {
  const isFinished = match.status === "finished";
  const [activeSection, setActiveSection] = useState<SubSection>("comments");
  const [comments, setComments] = useState<readonly MatchComment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      setIsLoading(true);
      const res = await getMatchComments(match.externalId);
      if (isMounted) {
        setComments(res);
        setIsLoading(false);
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, [match.externalId]);

  return (
    <div className="space-y-5">
      {/* Selector de subsecciones en partidos finalizados */}
      {isFinished ? (
        <div className="flex justify-center">
          <div
            role="tablist"
            aria-label="Secciones de la grada"
            className="inline-flex rounded-full border border-[var(--border)] bg-[var(--surface)] p-1 shadow-2xs"
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeSection === "comments"}
              onClick={() => setActiveSection("comments")}
              className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
                activeSection === "comments"
                  ? "bg-[var(--primary)] text-white shadow-xs"
                  : "text-[var(--foreground-muted)] hover:text-neutral-900"
              }`}
            >
              Tertulia
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeSection === "ratings"}
              onClick={() => setActiveSection("ratings")}
              className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
                activeSection === "ratings"
                  ? "bg-[var(--primary)] text-white shadow-xs"
                  : "text-[var(--foreground-muted)] hover:text-neutral-900"
              }`}
            >
              Calificaciones
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-neutral-100 bg-neutral-50/70 p-3.5 text-center text-xs text-[var(--foreground-muted)]">
          Las calificaciones y el MVP del partido se abrirán al finalizar el encuentro. ¡Comenta el partido en directo con la afición!
        </div>
      )}

      {/* Renderizado de contenido según la sección */}
      {(!isFinished || activeSection === "comments") && (
        <>
          {isLoading ? (
            <div className="p-8 text-center text-xs text-neutral-400">
              Cargando comentarios...
            </div>
          ) : (
            <MatchCommentsThread
              matchId={match.externalId}
              initialComments={comments}
            />
          )}
        </>
      )}

      {isFinished && activeSection === "ratings" && (
        <MatchPlayerRatings match={match} />
      )}
    </div>
  );
}
