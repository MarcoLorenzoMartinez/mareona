import React from 'react';
import type { PlayerGuessResult, StatComparison } from '@/lib/who-are-ya/types';

interface WhoAreYaPlayerGridProps {
  guesses: PlayerGuessResult[];
}

function StatTile({
  label,
  value,
  isMatch,
  comparison,
}: {
  label: string;
  value: string | number;
  isMatch: boolean;
  comparison?: StatComparison;
}) {
  const isCorrect = isMatch || comparison === 'equal';
  const bgColor = isCorrect
    ? 'bg-emerald-600 text-white border-emerald-600'
    : 'bg-[var(--surface)] text-[var(--foreground)] border-[var(--border)]';

  return (
    <div
      className={`flex flex-col items-center justify-center rounded-xl border p-2 text-center transition-all ${bgColor}`}
    >
      <span className="text-[10px] font-medium opacity-80 uppercase tracking-wider">{label}</span>
      <div className="flex items-center gap-1">
        <span className="text-xs font-bold tabular-nums">{value}</span>
        {comparison && comparison !== 'equal' && (
          <span className="text-xs font-bold text-amber-500">
            {comparison === 'higher' ? '↑' : '↓'}
          </span>
        )}
      </div>
    </div>
  );
}

export function WhoAreYaPlayerGrid({ guesses }: WhoAreYaPlayerGridProps) {
  if (guesses.length === 0) return null;

  return (
    <div className="flex flex-col gap-2.5 w-full max-w-2xl mx-auto">
      {guesses.map((guess, idx) => (
        <div
          key={`${guess.player.bdfId}-${idx}`}
          className="flex flex-col gap-2 rounded-2xl border border-[var(--border)] bg-white p-3 shadow-2xs animate-in fade-in-50 slide-in-from-bottom-2 duration-200"
        >
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-2 px-1">
            <span className="text-sm font-bold text-[var(--foreground)]">
              {guess.player.name}
            </span>
            <span className="text-xs text-[var(--foreground-muted)]">
              {guess.player.fullName}
            </span>
          </div>

          <div className="grid grid-cols-6 gap-1.5 sm:gap-2">
            <StatTile
              label="País"
              value={guess.player.nationality}
              isMatch={guess.nationalityMatch}
            />
            <StatTile
              label="Posición"
              value={guess.player.position}
              isMatch={guess.positionMatch}
            />
            <StatTile
              label="Partidos"
              value={guess.matchesPlayed.value}
              isMatch={guess.matchesPlayed.comparison === 'equal'}
              comparison={guess.matchesPlayed.comparison}
            />
            <StatTile
              label="Goles"
              value={guess.goals.value}
              isMatch={guess.goals.comparison === 'equal'}
              comparison={guess.goals.comparison}
            />
            <StatTile
              label="Debut"
              value={guess.startYear.value}
              isMatch={guess.startYear.comparison === 'equal'}
              comparison={guess.startYear.comparison}
            />
            <StatTile
              label="Último"
              value={guess.endYear.value}
              isMatch={guess.endYear.comparison === 'equal'}
              comparison={guess.endYear.comparison}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
