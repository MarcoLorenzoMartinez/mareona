// Client: Autocomplete search input for Sporting players, coaches, and club figures
'use client';

import { useState, useRef, useEffect, useId, useCallback } from 'react';
import { searchClubFigures } from '@/lib/trivia/club-figures';

interface TriviaPlayerInputProps {
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
  onSubmit: (resolvedVal?: string) => void;
}

export function TriviaPlayerInput({
  value,
  onChange,
  disabled,
  onSubmit,
}: TriviaPlayerInputProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
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

  const suggestions = searchClubFigures(query, 5);

  const handleSelect = useCallback(
    (selectedName: string) => {
      onChange(selectedName);
      setQuery(selectedName);
      setOpen(false);
      setHighlightedIndex(0);
    },
    [onChange]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!open && suggestions.length > 0) {
        setOpen(true);
        setHighlightedIndex(0);
      } else if (suggestions.length > 0) {
        setHighlightedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
      }
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (suggestions.length > 0) {
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
      }
      return;
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      if (suggestions.length > 0 && open) {
        const target =
          highlightedIndex >= 0 && highlightedIndex < suggestions.length
            ? suggestions[highlightedIndex]
            : suggestions[0];
        handleSelect(target.displayName);
        onSubmit(target.displayName);
        return;
      }
      onSubmit();
      return;
    }

    if (e.key === 'Escape') {
      setOpen(false);
      setHighlightedIndex(0);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <input
        type="text"
        role="combobox"
        aria-expanded={open && suggestions.length > 0}
        aria-controls={listboxId}
        aria-activedescendant={
          open && suggestions.length > 0 ? `${listboxId}-opt-${highlightedIndex}` : undefined
        }
        aria-autocomplete="list"
        disabled={disabled}
        value={query}
        onChange={(e) => {
          const val = e.target.value;
          setQuery(val);
          onChange(val);
          setOpen(true);
          setHighlightedIndex(0);
        }}
        onFocus={() => {
          if (query.trim().length >= 2) {
            setOpen(true);
            setHighlightedIndex(0);
          }
        }}
        onKeyDown={handleKeyDown}
        placeholder="Escribe el nombre o alias..."
        className="w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm text-[var(--foreground)] placeholder-[var(--foreground-muted)] outline-none focus:border-[#e2001a] focus:ring-1 focus:ring-[#e2001a] disabled:bg-[var(--surface)] disabled:text-[var(--foreground-muted)]"
      />

      {open && suggestions.length > 0 && (
        <ul
          id={listboxId}
          role="listbox"
          className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-xl border border-[var(--border)] bg-white py-1 shadow-lg"
        >
          {suggestions.map((p, idx) => {
            const isHighlighted = idx === highlightedIndex;
            return (
              <li
                key={p.bdfId}
                id={`${listboxId}-opt-${idx}`}
                role="option"
                aria-selected={
                  isHighlighted ||
                  value === p.displayName ||
                  value === p.fullName ||
                  value === p.name
                }
                onClick={() => {
                  handleSelect(p.displayName);
                  onSubmit(p.displayName);
                }}
                onMouseEnter={() => setHighlightedIndex(idx)}
                className={`flex cursor-pointer items-center justify-between px-4 py-2.5 text-xs transition-colors ${
                  isHighlighted
                    ? 'bg-[var(--surface-raised,var(--surface))] text-[#e2001a]'
                    : 'hover:bg-[var(--surface)]'
                }`}
              >
                <div className="py-0.5 truncate">
                  <span className="font-bold text-[var(--foreground)]">{p.displayName}</span>
                  {p.subLabel && (
                    <span className="ml-2 text-[var(--foreground-muted)]">({p.subLabel})</span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
