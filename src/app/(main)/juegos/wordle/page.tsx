import type { Metadata } from 'next';
import { getTodayChallenge } from '@/lib/wordle/words';
import { WordleClient } from './wordle-client';

export const metadata: Metadata = {
  title: 'Wordle Sportinguista — Mareona',
  description: 'Adivina la palabra del Real Sporting de hoy en 6 intentos.',
};

export default function WordlePage() {
  const todayChallenge = getTodayChallenge();

  return (
    <main className="w-full py-2">
      <WordleClient initialChallenge={todayChallenge} />
    </main>
  );
}
