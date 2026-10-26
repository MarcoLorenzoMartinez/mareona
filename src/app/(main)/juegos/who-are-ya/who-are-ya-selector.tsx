// Client: Autocomplete input for Who Are Ya with accessible keyboard navigation
'use client';

import { useState, useRef, useEffect, useId, useCallback } from 'react';

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
  placeholder = 'Escribe para buscar...',
  disabled = false,
}: WhoAreYaSelectorProps) {
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

  const cleanQuery = query.trim().toLowerCase();
  const filtered = cleanQuery.length > 0
    ? options
        .filter(
          (opt) =>
            opt.label.toLowerCase().includes(cleanQuery) ||
            (opt.sublabel && opt.sublabel.toLowerCase().includes(cleanQuery))
        )
        .slice(0, 6)
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
          placeholder={placeholder}
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
            aria-label="Limpiar búsqueda"
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
          >
            ✕
          </button>
        )}
      </div>

      {open && filtered.length > 0 && (
        <ul
          ref={listRef}
          id={listboxId}
          role="listbox"
          className="absolute z-30 mt-2 max-h-60 w-full overflow-auto rounded-2xl border border-[var(--border)] bg-white py-1.5 shadow-lg animate-in fade-in-50 duration-150"
        >
          {filtered.map((item, idx) => {
            const isHighlighted = idx === highlightedIndex;
            return (
              <li
                key={item.id}
                id={`${listboxId}-opt-${idx}`}
                role="option"
                aria-selected={isHighlighted}
                onClick={() => handleSelectOption(item)}
                onMouseEnter={() => setHighlightedIndex(idx)}
                className={`flex cursor-pointer flex-col px-4 py-2 transition-colors ${
                  isHighlighted ? 'bg-red-50 text-[#e2001a]' : 'hover:bg-[var(--surface)]'
                }`}
              >
                <span
                  className={`text-sm font-semibold ${
                    isHighlighted ? 'text-[#e2001a]' : 'text-[var(--foreground)]'
                  }`}
                >
                  {item.label}
                </span>
                {item.sublabel && (
                  <span
                    className={`text-xs ${
                      isHighlighted ? 'text-[#e2001a]/80' : 'text-[var(--foreground-muted)]'
                    }`}
                  >
                    {item.sublabel}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
