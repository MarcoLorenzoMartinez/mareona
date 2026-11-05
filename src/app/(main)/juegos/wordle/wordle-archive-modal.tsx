// Client: Wordle archive modal wrapper using the shared GameArchiveModal
'use client';

import React, { useCallback, useMemo } from 'react';
import { GameArchiveModal, type ChallengeDayStatus } from '@/components/games/game-archive-modal';
import { WORDLE_EPOCH_DATE, getTodayChallenge } from '@/lib/wordle/words';
import { STORAGE_KEY_PREFIX } from '@/lib/wordle/storage';

interface WordleArchiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string;
  onSelectDate: (date: string) => void;
}

export function WordleArchiveModal({
  isOpen,
  onClose,
  selectedDate,
  onSelectDate,
}: WordleArchiveModalProps) {
  const todayDate = useMemo(() => getTodayChallenge().id, []);

  const getStatusForDate = useCallback((dateStr: string): ChallengeDayStatus => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}${dateStr}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.status === 'WON') return 'WON';
        if (parsed.status === 'LOST') return 'LOST';
      }
    } catch {
      // localStorage fallback
    }
    return 'UNPLAYED';
  }, []);

  return (
    <GameArchiveModal
      isOpen={isOpen}
      onClose={onClose}
      selectedDate={selectedDate}
      onSelectDate={onSelectDate}
      epochDate={WORDLE_EPOCH_DATE}
      todayDate={todayDate}
      getStatusForDate={getStatusForDate}
    />
  );
}
