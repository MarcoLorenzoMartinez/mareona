// Client: Specialized numeric inputs for Trivia season and score questions
'use client';

import { useRef } from 'react';
import { getDictionary } from '@/i18n';

interface SplitNumericInputProps {
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
  onSubmit: () => void;
}

export function TriviaSeasonInput({
  value,
  onChange,
  disabled,
  onSubmit,
}: SplitNumericInputProps) {
  const dict = getDictionary();
  const endYearInputRef = useRef<HTMLInputElement>(null);

  const slashIndex = value.indexOf('/');
  const startYear = slashIndex !== -1 ? value.slice(0, slashIndex) : value;
  const endYear = slashIndex !== -1 ? value.slice(slashIndex + 1) : '';

  const handleStartChange = (val: string) => {
    const clean = val.replace(/\D/g, '').slice(0, 4);

    // Auto-compute or propose 2-digit end year if 4 digits are completed and endYear is empty
    let nextEnd = endYear;
    if (clean.length === 4 && !nextEnd) {
      const nextYr = (parseInt(clean, 10) + 1) % 100;
      nextEnd = String(nextYr).padStart(2, '0');
    }

    const combined = nextEnd ? `${clean}/${nextEnd}` : clean;
    onChange(combined);

    if (clean.length === 4) {
      endYearInputRef.current?.focus();
      endYearInputRef.current?.select();
    }
  };

  const handleEndChange = (val: string) => {
    const clean = val.replace(/\D/g, '').slice(0, 2);
    const combined = startYear ? `${startYear}/${clean}` : clean;
    onChange(combined);
  };

  return (
    <div className="flex items-center justify-center gap-3 w-full py-2">
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        disabled={disabled}
        value={startYear}
        onChange={(e) => handleStartChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            onSubmit();
          }
        }}
        placeholder={dict.games.trivia.inputs.seasonStartPlaceholder}
        maxLength={4}
        aria-label={dict.games.trivia.inputs.seasonStartAria}
        className="h-14 w-28 rounded-2xl border-2 border-[var(--border)] bg-white text-center font-sans text-xl font-bold tabular-nums text-[var(--foreground)] placeholder:text-neutral-300 outline-none focus:border-[#e2001a] focus:ring-2 focus:ring-[#e2001a]/20 disabled:bg-[var(--surface)] disabled:text-[var(--foreground-muted)] transition-all shadow-2xs"
      />

      <span className="text-2xl font-bold text-neutral-300 select-none">/</span>

      <input
        ref={endYearInputRef}
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        disabled={disabled}
        value={endYear}
        onChange={(e) => handleEndChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Backspace' && !endYear) {
            e.preventDefault();
            // Backspace on empty end slot returns to start slot
            onChange(startYear.slice(0, -1));
          } else if (e.key === 'Enter') {
            e.preventDefault();
            onSubmit();
          }
        }}
        placeholder={dict.games.trivia.inputs.seasonEndPlaceholder}
        maxLength={2}
        aria-label={dict.games.trivia.inputs.seasonEndAria}
        className="h-14 w-20 rounded-2xl border-2 border-[var(--border)] bg-white text-center font-sans text-xl font-bold tabular-nums text-[var(--foreground)] placeholder:text-neutral-300 outline-none focus:border-[#e2001a] focus:ring-2 focus:ring-[#e2001a]/20 disabled:bg-[var(--surface)] disabled:text-[var(--foreground-muted)] transition-all shadow-2xs"
      />
    </div>
  );
}

export function TriviaScoreInput({
  value,
  onChange,
  disabled,
  onSubmit,
}: SplitNumericInputProps) {
  const dict = getDictionary();
  const awayScoreInputRef = useRef<HTMLInputElement>(null);

  const dashIndex = value.indexOf('-');
  const homeScore = dashIndex !== -1 ? value.slice(0, dashIndex).trim() : value.trim();
  const awayScore = dashIndex !== -1 ? value.slice(dashIndex + 1).trim() : '';

  const handleHomeChange = (val: string) => {
    const clean = val.replace(/\D/g, '').slice(0, 2);
    onChange(`${clean} - ${awayScore}`);
    if (clean.length >= 1) {
      awayScoreInputRef.current?.focus();
      awayScoreInputRef.current?.select();
    }
  };

  const handleAwayChange = (val: string) => {
    const clean = val.replace(/\D/g, '').slice(0, 2);
    onChange(`${homeScore} - ${clean}`);
  };

  return (
    <div className="flex items-center justify-center gap-3 w-full py-2">
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        disabled={disabled}
        value={homeScore}
        onChange={(e) => handleHomeChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            onSubmit();
          }
        }}
        placeholder="0"
        maxLength={2}
        aria-label={dict.games.trivia.inputs.homeGoalsAria}
        className="h-14 w-20 rounded-2xl border-2 border-[var(--border)] bg-white text-center font-sans text-2xl font-bold tabular-nums text-[var(--foreground)] placeholder:text-neutral-300 outline-none focus:border-[#e2001a] focus:ring-2 focus:ring-[#e2001a]/20 disabled:bg-[var(--surface)] disabled:text-[var(--foreground-muted)] transition-all shadow-2xs"
      />

      <span className="text-2xl font-bold text-neutral-300 select-none">-</span>

      <input
        ref={awayScoreInputRef}
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        disabled={disabled}
        value={awayScore}
        onChange={(e) => handleAwayChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Backspace' && !awayScore) {
            onChange('');
          } else if (e.key === 'Enter') {
            e.preventDefault();
            onSubmit();
          }
        }}
        placeholder="0"
        maxLength={2}
        aria-label={dict.games.trivia.inputs.awayGoalsAria}
        className="h-14 w-20 rounded-2xl border-2 border-[var(--border)] bg-white text-center font-sans text-2xl font-bold tabular-nums text-[var(--foreground)] placeholder:text-neutral-300 outline-none focus:border-[#e2001a] focus:ring-2 focus:ring-[#e2001a]/20 disabled:bg-[var(--surface)] disabled:text-[var(--foreground-muted)] transition-all shadow-2xs"
      />
    </div>
  );
}
