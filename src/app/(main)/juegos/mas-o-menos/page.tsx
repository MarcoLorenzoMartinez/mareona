import type { Metadata } from 'next';
import { HigherLowerClient } from './higher-lower-client';

export const metadata: Metadata = {
  title: '¿Más o Menos?',
  description: 'Compara futbolistas del Real Sporting por partidos, goles y minutos.',
};

export default function HigherLowerPage() {
  return (
    <main className="w-full py-2">
      <HigherLowerClient />
    </main>
  );
}
