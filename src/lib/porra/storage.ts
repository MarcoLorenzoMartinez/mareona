import type { PorraPrediction, PorraLeaderboardEntry } from './types';

export const PORRA_STORAGE_PREFIX = 'mareona_porra_prediction_';

export const DEMO_LEADERBOARD: PorraLeaderboardEntry[] = [
  { rank: 1, userName: 'PelayoGijon', avatarSeed: 'pelayo', totalPoints: 48, exactScoresCount: 6, outcomesCount: 14 },
  { rank: 2, userName: 'QuiniEterno', avatarSeed: 'quini', totalPoints: 44, exactScoresCount: 5, outcomesCount: 13 },
  { rank: 3, userName: 'MareonaNorte', avatarSeed: 'norte', totalPoints: 41, exactScoresCount: 4, outcomesCount: 15 },
  { rank: 4, userName: 'ElMolinon1905', avatarSeed: 'molinon', totalPoints: 37, exactScoresCount: 3, outcomesCount: 14 },
  { rank: 5, userName: 'GuaheRojiblanco', avatarSeed: 'guahe', totalPoints: 34, exactScoresCount: 4, outcomesCount: 10 },
  { rank: 6, userName: 'CimavillaRSG', avatarSeed: 'cima', totalPoints: 32, exactScoresCount: 3, outcomesCount: 11 },
  { rank: 7, userName: 'PimiSporting', avatarSeed: 'pimi', totalPoints: 29, exactScoresCount: 2, outcomesCount: 12 },
  { rank: 8, userName: 'Rojiblanco81', avatarSeed: 'roji', totalPoints: 26, exactScoresCount: 2, outcomesCount: 11 },
];

export function getStoredPrediction(matchId: string): PorraPrediction | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(`${PORRA_STORAGE_PREFIX}${matchId}`);
    if (!raw) return null;
    return JSON.parse(raw) as PorraPrediction;
  } catch {
    return null;
  }
}

export function saveStoredPrediction(prediction: PorraPrediction): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(
      `${PORRA_STORAGE_PREFIX}${prediction.matchId}`,
      JSON.stringify(prediction)
    );
  } catch {
    // quota fallback
  }
}
