import { Suspense } from 'react';
import type { Metadata } from 'next';
import { getTriviaForDate, TRIVIA_EPOCH_DATE } from '../../../../lib/trivia/engine';
import { TriviaClient } from './trivia-client';
import { getDictionary } from '@/i18n';

const dict = getDictionary();

export const metadata: Metadata = {
  title: dict.games.trivia.metadata.title,
  description: dict.games.trivia.metadata.description,
};

interface PageProps {
  searchParams: Promise<{ date?: string }>;
}

async function TriviaContent({ searchParams }: PageProps) {
  const params = await searchParams;

  // Resolve challenge in Europe/Madrid timezone
  const todayMadrid = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Madrid',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());

  const effectiveToday = todayMadrid < TRIVIA_EPOCH_DATE ? TRIVIA_EPOCH_DATE : todayMadrid;
  const requestedDate = params.date && /^\d{4}-\d{2}-\d{2}$/.test(params.date)
    ? params.date
    : effectiveToday;
  const targetDate =
    requestedDate < TRIVIA_EPOCH_DATE
      ? TRIVIA_EPOCH_DATE
      : requestedDate > effectiveToday
        ? effectiveToday
        : requestedDate;

  const challenge = getTriviaForDate(targetDate);

  return <TriviaClient challenge={challenge} />;
}

export default function TriviaPage(props: PageProps) {
  return (
    <div className="py-2 sm:py-6">
      <Suspense fallback={<div className="min-h-[400px] animate-pulse rounded-2xl bg-neutral-100/60" />}>
        <TriviaContent {...props} />
      </Suspense>
    </div>
  );
}
