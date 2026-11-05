// Client: Pestaña Grada con tertulia de partido (diseño unificado con Social) y calificaciones
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
    <div className="space-y-4">
      {isFinished && (
        <div className="mx-auto flex w-full max-w-2xl justify-center">
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
              className={`min-h-9 rounded-full px-4 text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] ${
                activeSection === "comments"
                  ? "bg-[var(--primary)] text-white shadow-2xs"
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
              className={`min-h-9 rounded-full px-4 text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] ${
                activeSection === "ratings"
                  ? "bg-[var(--primary)] text-white shadow-2xs"
                  : "text-[var(--foreground-muted)] hover:text-neutral-900"
              }`}
            >
              Calificaciones
            </button>
          </div>
        </div>
      )}

      {(!isFinished || activeSection === "comments") && (
        <>
          {isLoading ? (
            <div className="mx-auto w-full max-w-2xl rounded-2xl border border-[var(--border)] bg-white p-10 text-center text-xs text-neutral-400 shadow-2xs">
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
