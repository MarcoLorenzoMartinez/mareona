// Client: ¿Quién es? archive modal wrapper using the shared GameArchiveModal
'use client';

import React, { useCallback, useMemo } from 'react';
import { GameArchiveModal, type ChallengeDayStatus } from '@/components/games/game-archive-modal';
import { WHO_ARE_YA_EPOCH_DATE, getTodayDateStr } from '@/lib/who-are-ya/daily';
import { WHO_ARE_YA_STORAGE_PREFIX } from '@/lib/who-are-ya/storage';
import { MAX_ATTEMPTS } from '@/lib/who-are-ya/engine';
import type { PlayerGuessResult } from '@/lib/who-are-ya/types';

interface WhoAreYaArchiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string;
  onSelectDate: (date: string) => void;
}

export function WhoAreYaArchiveModal({
  isOpen,
  onClose,
  selectedDate,
  onSelectDate,
}: WhoAreYaArchiveModalProps) {
  const todayDate = useMemo(() => getTodayDateStr(), []);

  const getStatusForDate = useCallback((dateStr: string): ChallengeDayStatus => {
    try {
      const raw = localStorage.getItem(`${WHO_ARE_YA_STORAGE_PREFIX}${dateStr}`);
      if (raw) {
        const guesses = JSON.parse(raw) as PlayerGuessResult[];
        if (guesses.some((g) => g.isCorrect)) {
          return 'WON';
        }
        if (guesses.length >= MAX_ATTEMPTS) {
          return 'LOST';
        }
      }
    } catch {
      // quota fallback
    }
    return 'UNPLAYED';
  }, []);

  return (
    <GameArchiveModal
      isOpen={isOpen}
      onClose={onClose}
      selectedDate={selectedDate}
      onSelectDate={onSelectDate}
      epochDate={WHO_ARE_YA_EPOCH_DATE}
      todayDate={todayDate}
      getStatusForDate={getStatusForDate}
    />
  );
}
