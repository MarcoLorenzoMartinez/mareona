// Client: Hook para carga bajo demanda de enfrentamientos históricos de un rival
"use client";

import { useState, useEffect, useMemo } from "react";
import type { RivalH2HMatch, RivalH2HSummary } from "@/lib/historical/rivals-types";
import { getRivalMatchesAction } from "./rival-matches-action";

export function useRivalMatches(selectedRival: RivalH2HSummary | null): RivalH2HSummary | null {
  const [matchesByName, setMatchesByName] = useState<Record<string, readonly RivalH2HMatch[]>>({});

  useEffect(() => {
    if (!selectedRival || selectedRival.matches.length > 0 || matchesByName[selectedRival.name]) return;
    let active = true;
    void getRivalMatchesAction(selectedRival.name).then((loaded) => {
      if (active) {
        setMatchesByName((prev) => ({ ...prev, [selectedRival.name]: loaded }));
      }
    });
    return () => {
      active = false;
    };
  }, [selectedRival, matchesByName]);

  return useMemo(() => {
    if (!selectedRival) return null;
    if (selectedRival.matches.length > 0) return selectedRival;
    const loaded = matchesByName[selectedRival.name];
    if (!loaded) return selectedRival;
    return { ...selectedRival, matches: [...loaded], allMatches: [...loaded] };
  }, [selectedRival, matchesByName]);
}
