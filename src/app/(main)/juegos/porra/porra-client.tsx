// Client: Contenedor interactivo principal de La Porra
'use client';

import React, { useState } from 'react';
import { PorraHeader } from './porra-header';
import { PorraMatchCard } from './porra-match-card';
import { PorraLeaderboard } from './porra-leaderboard';
import {
  getStoredPrediction,
  saveStoredPrediction,
  DEMO_LEADERBOARD,
} from '@/lib/porra/storage';
import type { PorraMatch, PorraPrediction } from '@/lib/porra/types';

interface PorraClientProps {
  currentMatch: PorraMatch;
  availablePlayers: string[];
}

export function PorraClient({
  currentMatch,
  availablePlayers,
}: PorraClientProps) {
  const [prediction, setPrediction] = useState<PorraPrediction | null>(() =>
    getStoredPrediction(currentMatch.id)
  );

  const handleSavePrediction = (newPred: PorraPrediction) => {
    setPrediction(newPred);
    saveStoredPrediction(newPred);
  };

  return (
    <div className="flex flex-col gap-6 max-w-xl mx-auto w-full">
      <PorraHeader />

      <PorraMatchCard
        match={currentMatch}
        existingPrediction={prediction}
        onSavePrediction={handleSavePrediction}
        availablePlayers={availablePlayers}
      />

      <PorraLeaderboard
        entries={DEMO_LEADERBOARD}
        currentUserScore={prediction ? 28 : undefined}
      />
    </div>
  );
}
