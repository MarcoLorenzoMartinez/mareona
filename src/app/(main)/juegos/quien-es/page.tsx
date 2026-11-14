import type { Metadata } from 'next';
import { WhoAreYaClient } from './who-are-ya-client';
import { getTodayDateStr } from '@/lib/who-are-ya/daily';
import playersData from '@/data/who-are-ya/players.json' with { type: 'json' };
import type { WhoAreYaPlayer } from '@/lib/who-are-ya/types';

export const metadata: Metadata = {
  title: '¿Quién es?',
  description: 'Adivina el futbolista histórico o actual del Real Sporting en 6 intentos.',
};

export default function WhoAreYaPage() {
  const players = playersData as WhoAreYaPlayer[];
  const initialDate = getTodayDateStr();

  return <WhoAreYaClient players={players} initialDate={initialDate} />;
}
