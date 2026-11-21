import type { Metadata } from 'next';
import { getTodayChallenge } from '@/lib/wordle/words';
import { WordleClient } from './wordle-client';
import { getDictionary } from '@/i18n';

const dict = getDictionary();

export const metadata: Metadata = {
  title: dict.games.wordle.metadata.title,
  description: dict.games.wordle.metadata.description,
};

export default function WordlePage() {
  const todayChallenge = getTodayChallenge();

  return (
    <div className="w-full py-2">
      <WordleClient initialChallenge={todayChallenge} />
    </div>
  );
}
