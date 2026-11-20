import type { Metadata } from 'next';
import { HigherLowerClient } from './higher-lower-client';
import { getDictionary } from '@/i18n';

const dict = getDictionary();

export const metadata: Metadata = {
  title: dict.games.higherLower.metadata.title,
  description: dict.games.higherLower.metadata.description,
};

export default function HigherLowerPage() {
  return (
    <main className="w-full py-2">
      <HigherLowerClient />
    </main>
  );
}
