// Client: Autocomplete search input for Sporting players and coaches
'use client';

import { useState, useRef, useEffect, useId } from 'react';
import historicalPlayers from '@/data/historical/club-all-time-players.json' with { type: 'json' };

interface PlayerRecord {
  bdfId: number;
  name: string;
  fullName: string;
  position?: string;
  totalPlayed: number;
}

const PLAYERS_LIST: PlayerRecord[] = (historicalPlayers as PlayerRecord[]).filter(
  (p) => p.name && p.totalPlayed > 0
);

interface TriviaPlayerInputProps {
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
  onSubmit: () => void;
}

export function TriviaPlayerInput({
  value,
  onChange,
  disabled,
  onSubmit,
}: TriviaPlayerInputProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value);
  const containerRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();

  const [prevValue, setPrevValue] = useState(value);
  if (value !== prevValue) {
    setPrevValue(value);
    setQuery(value);
  }

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const cleanQ = query.trim().toLowerCase();
  const suggestions = cleanQ.length >= 2
    ? PLAYERS_LIST.filter(
        (p) =>
          p.name.toLowerCase().includes(cleanQ) ||
          p.fullName.toLowerCase().includes(cleanQ)
      ).slice(0, 5)
    : [];

  return (
    <div ref={containerRef} className="relative w-full">
      <input
        type="text"
        role="combobox"
        aria-expanded={open && suggestions.length > 0}
        aria-controls={listboxId}
        aria-autocomplete="list"
        disabled={disabled}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          onChange(e.target.value);
          setOpen(true);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            onSubmit();
          }
        }}
        placeholder="Escribe el nombre o alias..."
        className="w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm text-[var(--foreground)] placeholder-[var(--foreground-muted)] outline-none focus:border-[#e2001a] focus:ring-1 focus:ring-[#e2001a] disabled:bg-[var(--surface)] disabled:text-[var(--foreground-muted)]"
      />

      {open && suggestions.length > 0 && (
        <ul
          id={listboxId}
          role="listbox"
          className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-xl border border-[var(--border)] bg-white py-1 shadow-lg"
        >
          {suggestions.map((p) => (
            <li
              key={p.bdfId}
              role="option"
              aria-selected={value === p.fullName || value === p.name}
              onClick={() => {
                onChange(p.fullName);
                setQuery(p.fullName);
                setOpen(false);
              }}
              className="flex cursor-pointer items-center justify-between px-4 py-2.5 text-xs hover:bg-[var(--surface)] transition-colors"
            >
              <div className="py-0.5">
                <span className="font-bold text-[var(--foreground)]">{p.name}</span>
                <span className="ml-2 text-[var(--foreground-muted)]">({p.fullName})</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
