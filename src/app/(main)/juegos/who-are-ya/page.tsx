import type { Metadata } from 'next';
import { WhoAreYaClient } from './who-are-ya-client';
import playersData from '@/data/who-are-ya/players.json' with { type: 'json' };
import kitsData from '@/data/who-are-ya/kits.json' with { type: 'json' };
import type { WhoAreYaPlayer, WhoAreYaKit } from '@/lib/who-are-ya/types';

export const metadata: Metadata = {
  title: 'Who Are Ya? — Mareona',
  description: 'Adivina el jugador o la camiseta histórica del Real Sporting en 6 intentos.',
};

export default function WhoAreYaPage() {
  const players = playersData as WhoAreYaPlayer[];
  const kits = kitsData as WhoAreYaKit[];

  return <WhoAreYaClient players={players} kits={kits} />;
}
