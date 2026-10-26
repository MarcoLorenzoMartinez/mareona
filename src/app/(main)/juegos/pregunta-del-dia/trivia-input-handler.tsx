// Client: Specialized inputs for seasons, numbers, scores, and text
'use client';

import type { TriviaQuestion } from '../../../../lib/trivia/types';
import { TriviaPlayerInput } from './trivia-player-input';

interface TriviaInputHandlerProps {
  question: TriviaQuestion;
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
  onSubmit: () => void;
}

export function TriviaInputHandler({
  question,
  value,
  onChange,
  disabled,
  onSubmit,
}: TriviaInputHandlerProps) {
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
      <div className="flex flex-col gap-1.5 w-full">
        <input
          type="text"
          disabled={disabled}
          value={value}
          onChange={(e) => {
            const val = e.target.value.replace(/[^0-9\/\-]/g, '');
            onChange(val);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              onSubmit();
            }
          }}
          placeholder="Ej. 1978/79 o 1981"
          maxLength={9}
          className="w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-center text-sm font-semibold tabular-nums text-[var(--foreground)] placeholder-[var(--foreground-muted)] outline-none focus:border-[#e2001a] focus:ring-1 focus:ring-[#e2001a] disabled:bg-[var(--surface)] disabled:text-[var(--foreground-muted)]"
        />
        <span className="text-[11px] text-center text-[var(--foreground-muted)]">
          Formato temporada: 1978/79 (o 1978)
        </span>
      </div>
    );
  }

  if (question.type === 'score') {
    return (
      <div className="flex flex-col gap-1.5 w-full">
        <input
          type="text"
          disabled={disabled}
          value={value}
          onChange={(e) => {
            const val = e.target.value.replace(/[^0-9\s\-\:]/g, '');
            onChange(val);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              onSubmit();
            }
          }}
          placeholder="Ej. 6 - 0"
          className="w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-center text-base font-bold tabular-nums text-[var(--foreground)] placeholder-[var(--foreground-muted)] outline-none focus:border-[#e2001a] focus:ring-1 focus:ring-[#e2001a] disabled:bg-[var(--surface)] disabled:text-[var(--foreground-muted)]"
        />
        <span className="text-[11px] text-center text-[var(--foreground-muted)]">
          Marcador: Sporting - Rival (ej. 6 - 0)
        </span>
      </div>
    );
  }

  if (question.type === 'number') {
    return (
      <div className="flex items-center gap-2 w-full">
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
          className="w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-center text-base font-bold tabular-nums text-[var(--foreground)] placeholder-[var(--foreground-muted)] outline-none focus:border-[#e2001a] focus:ring-1 focus:ring-[#e2001a] disabled:bg-[var(--surface)] disabled:text-[var(--foreground-muted)]"
        />
        {question.unit && (
          <span className="shrink-0 text-xs font-semibold text-[var(--foreground-muted)]">
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
      placeholder={question.formatHint || 'Escribe tu respuesta...'}
      className="w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm text-[var(--foreground)] placeholder-[var(--foreground-muted)] outline-none focus:border-[#e2001a] focus:ring-1 focus:ring-[#e2001a] disabled:bg-[var(--surface)] disabled:text-[var(--foreground-muted)]"
    />
  );
}
