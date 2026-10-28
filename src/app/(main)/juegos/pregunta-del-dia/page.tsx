import type { Metadata } from 'next';
import { getTriviaForDate } from '../../../../lib/trivia/engine';
import { TriviaClient } from './trivia-client';

export const metadata: Metadata = {
  title: 'La Pregunta del Día',
  description: 'Desafío diario de historia y curiosidades del Real Sporting de Gijón.',
};

interface PageProps {
  searchParams: Promise<{ date?: string }>;
}

export default async function TriviaPage({ searchParams }: PageProps) {
  const params = await searchParams;

  // Resolve today's challenge in Europe/Madrid timezone
  const todayMadrid = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Madrid',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());

  const targetDate = params.date && /^\d{4}-\d{2}-\d{2}$/.test(params.date)
    ? params.date
    : todayMadrid;

  const challenge = getTriviaForDate(targetDate);

  return (
    <div className="py-2 sm:py-6">
      <TriviaClient challenge={challenge} />
    </div>
  );
}
