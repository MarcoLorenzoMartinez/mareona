// Client: Specialized inputs for seasons, numbers, scores, and text
'use client';

import type { TriviaQuestion } from '../../../../lib/trivia/types';
import { TriviaPlayerInput } from './trivia-player-input';
import { TriviaSeasonInput, TriviaScoreInput } from './trivia-numeric-inputs';
import { getDictionary } from '@/i18n';

interface TriviaInputHandlerProps {
  question: TriviaQuestion;
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
  onSubmit: (resolvedVal?: string) => void;
}

export function TriviaInputHandler({
  question,
  value,
  onChange,
  disabled,
  onSubmit,
}: TriviaInputHandlerProps) {
  const dict = getDictionary();

  if (question.type === 'player') {
    return (
      <TriviaPlayerInput
        value={value}
        onChange={onChange}
        disabled={disabled}
        onSubmit={onSubmit}
      />
    );
  }

  if (question.type === 'season') {
    return (
      <TriviaSeasonInput
        value={value}
        onChange={onChange}
        disabled={disabled}
        onSubmit={() => onSubmit()}
      />
    );
  }

  if (question.type === 'score') {
    return (
      <TriviaScoreInput
        value={value}
        onChange={onChange}
        disabled={disabled}
        onSubmit={() => onSubmit()}
      />
    );
  }

  if (question.type === 'number') {
    return (
      <div className="flex items-center justify-center gap-2 w-full py-2">
        <input
          type="number"
          inputMode="numeric"
          pattern="[0-9]*"
          disabled={disabled}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              onSubmit();
            }
          }}
          placeholder="0"
          className="h-14 w-32 rounded-2xl border-2 border-[var(--border)] bg-white text-center font-sans text-2xl font-bold tabular-nums text-[var(--foreground)] placeholder:text-neutral-300 outline-none focus:border-[#e2001a] focus:ring-2 focus:ring-[#e2001a]/20 disabled:bg-[var(--surface)] disabled:text-[var(--foreground-muted)] transition-all shadow-2xs"
        />
        {question.unit && (
          <span className="shrink-0 text-sm font-semibold text-[var(--foreground-muted)]">
            {question.unit}
          </span>
        )}
      </div>
    );
  }

  // Default free-form text with generous normalization
  return (
    <input
      type="text"
      disabled={disabled}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          onSubmit();
        }
      }}
      placeholder={question.formatHint || dict.games.trivia.inputs.defaultPlaceholder}
      className="w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm text-[var(--foreground)] placeholder-[var(--foreground-muted)] outline-none focus:border-[#e2001a] focus:ring-1 focus:ring-[#e2001a] disabled:bg-[var(--surface)] disabled:text-[var(--foreground-muted)]"
    />
  );
}
