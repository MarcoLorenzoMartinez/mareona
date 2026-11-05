// Client: Trivia archive modal wrapper using the shared GameArchiveModal
'use client';

import React, { useCallback, useMemo } from 'react';
import { GameArchiveModal, type ChallengeDayStatus } from '@/components/games/game-archive-modal';
import { TRIVIA_EPOCH_DATE, getTriviaTodayDateStr } from '@/lib/trivia/engine';
import { TRIVIA_STORAGE_PREFIX } from '@/lib/trivia/storage';
import type { TriviaPlayerAttempt } from '@/lib/trivia/types';

interface TriviaArchiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string;
  onSelectDate: (date: string) => void;
  attemptVersion?: number;
}

export function TriviaArchiveModal({
  isOpen,
  onClose,
  selectedDate,
  onSelectDate,
  attemptVersion,
}: TriviaArchiveModalProps) {
  const todayDate = useMemo(() => getTriviaTodayDateStr(), []);

  const getStatusForDate = useCallback((dateStr: string): ChallengeDayStatus => {
    try {
      const raw = localStorage.getItem(`${TRIVIA_STORAGE_PREFIX}${dateStr}`);
      if (raw) {
        const attempt = JSON.parse(raw) as TriviaPlayerAttempt;
        return attempt.isCorrect ? 'WON' : 'LOST';
      }
    } catch {
      // storage fallback
    }
    return 'UNPLAYED';
  }, []);

  return (
    <GameArchiveModal
      isOpen={isOpen}
      onClose={onClose}
      selectedDate={selectedDate}
      onSelectDate={onSelectDate}
      epochDate={TRIVIA_EPOCH_DATE}
      todayDate={todayDate}
      getStatusForDate={getStatusForDate}
      attemptVersion={attemptVersion}
    />
  );
}
