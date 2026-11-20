import type { Metadata } from 'next';
import { WhoAreYaClient } from './who-are-ya-client';
import { getTodayDateStr } from '@/lib/who-are-ya/daily';
import playersData from '@/data/who-are-ya/players.json' with { type: 'json' };
import type { WhoAreYaPlayer } from '@/lib/who-are-ya/types';
import { getDictionary } from '@/i18n';

const dict = getDictionary();

export const metadata: Metadata = {
  title: dict.games.whoAreYa.metadata.title,
  description: dict.games.whoAreYa.metadata.description,
};

export default function WhoAreYaPage() {
  const players = playersData as WhoAreYaPlayer[];
  const initialDate = getTodayDateStr();

  return <WhoAreYaClient players={players} initialDate={initialDate} />;
}
