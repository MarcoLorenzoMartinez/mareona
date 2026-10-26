// Client: Autocomplete input for Who Are Ya with accessible keyboard navigation
'use client';

import { useState, useRef, useEffect, useId } from 'react';

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
  const containerRef = useRef<HTMLDivElement>(null);
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

  const handleSelectOption = (opt: SelectorOption) => {
    onSelect(opt);
    setQuery('');
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-md mx-auto">
      <div className="relative">
        <input
          type="text"
          role="combobox"
          aria-expanded={open && filtered.length > 0}
          aria-controls={listboxId}
          aria-autocomplete="list"
          disabled={disabled}
          placeholder={placeholder}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
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
          id={listboxId}
          role="listbox"
          className="absolute z-30 mt-2 max-h-60 w-full overflow-auto rounded-2xl border border-[var(--border)] bg-white py-1.5 shadow-lg animate-in fade-in-50 duration-150"
        >
          {filtered.map((item) => (
            <li
              key={item.id}
              role="option"
              aria-selected={false}
              onClick={() => handleSelectOption(item)}
              className="flex cursor-pointer flex-col px-4 py-2 hover:bg-[var(--surface)] transition-colors"
            >
              <span className="text-sm font-semibold text-[var(--foreground)]">{item.label}</span>
              {item.sublabel && (
                <span className="text-xs text-[var(--foreground-muted)]">{item.sublabel}</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
