import type { Metadata } from 'next';
import { HigherLowerClient } from './higher-lower-client';

export const metadata: Metadata = {
  title: '¿Mayor o Menor?',
  description: 'Compara futbolistas del Real Sporting por partidos, goles y minutos.',
};

export default function HigherLowerPage() {
  return (
    <main className="w-full py-2">
      <HigherLowerClient />
    </main>
  );
}
