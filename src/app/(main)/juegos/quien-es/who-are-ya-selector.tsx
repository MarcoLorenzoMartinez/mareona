// Client: Autocomplete input for Who Are Ya with accessible keyboard navigation
'use client';

import { useState, useRef, useEffect, useId, useCallback } from 'react';
import { matchesSearchQuery } from '@/lib/utils/search-utils';
import { getDictionary } from '@/i18n';
import { WhoAreYaSelectorList } from './who-are-ya-selector-list';

export interface SelectorOption {
  id: string | number;
  label: string;
  sublabel?: string;
}

interface WhoAreYaSelectorProps {
  options: SelectorOption[];
  onSelect: (option: SelectorOption) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function WhoAreYaSelector({
  options,
  onSelect,
  placeholder,
  disabled = false,
}: WhoAreYaSelectorProps) {
  const dict = getDictionary();
  const resolvedPlaceholder = placeholder ?? dict.games.whoAreYa.selectorDefaultPlaceholder;
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const listboxId = useId();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sincroniza el scroll automático para que el elemento activo sea siempre visible
  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const activeEl = listRef.current.querySelector<HTMLElement>(`#${listboxId}-opt-${highlightedIndex}`);
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [highlightedIndex, listboxId]);

  const cleanQuery = query.trim();
  const filtered = cleanQuery.length > 0
    ? options.filter(
        (opt) =>
          matchesSearchQuery(opt.label, cleanQuery) ||
          (opt.sublabel && matchesSearchQuery(opt.sublabel, cleanQuery))
      )
    : [];

  const handleSelectOption = useCallback(
    (opt: SelectorOption) => {
      onSelect(opt);
      setQuery('');
      setOpen(false);
      setHighlightedIndex(-1);
    },
    [onSelect]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open || filtered.length === 0) {
      if (e.key === 'ArrowDown' && cleanQuery.length > 0) {
        setOpen(true);
        setHighlightedIndex(0);
        e.preventDefault();
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev < filtered.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : filtered.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < filtered.length) {
        handleSelectOption(filtered[highlightedIndex]);
      } else if (filtered.length > 0) {
        handleSelectOption(filtered[0]);
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
      setHighlightedIndex(-1);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-md mx-auto">
      <div className="relative">
        <input
          type="text"
          role="combobox"
          aria-expanded={open && filtered.length > 0}
          aria-controls={listboxId}
          aria-activedescendant={
            highlightedIndex >= 0 ? `${listboxId}-opt-${highlightedIndex}` : undefined
          }
          aria-autocomplete="list"
          disabled={disabled}
          placeholder={resolvedPlaceholder}
          value={query}
          onKeyDown={handleKeyDown}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setHighlightedIndex(-1);
          }}
          onFocus={() => {
            if (cleanQuery.length > 0) setOpen(true);
          }}
          className="w-full rounded-full border border-[var(--border)] bg-white px-5 py-2.5 text-sm text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] shadow-2xs focus:border-[#e2001a] focus:outline-none focus:ring-2 focus:ring-[#e2001a]/20 disabled:opacity-50 transition-all"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setOpen(false);
              setHighlightedIndex(-1);
            }}
            aria-label={dict.games.whoAreYa.clearSearchAria}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
          >
            ✕
          </button>
        )}
      </div>

      {open && filtered.length > 0 && (
        <WhoAreYaSelectorList
          listRef={listRef}
          listboxId={listboxId}
          options={filtered}
          highlightedIndex={highlightedIndex}
          onSelect={handleSelectOption}
          onHighlight={setHighlightedIndex}
        />
      )}
    </div>
  );
}
