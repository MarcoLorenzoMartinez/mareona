// Client: Accessible dropdown listbox for Who Are Ya autocomplete
'use client';

import type { RefObject } from 'react';
import type { SelectorOption } from './who-are-ya-selector';

interface WhoAreYaSelectorListProps {
  listRef: RefObject<HTMLUListElement | null>;
  listboxId: string;
  options: SelectorOption[];
  highlightedIndex: number;
  onSelect: (option: SelectorOption) => void;
  onHighlight: (index: number) => void;
}

export function WhoAreYaSelectorList({
  listRef,
  listboxId,
  options,
  highlightedIndex,
  onSelect,
  onHighlight,
}: WhoAreYaSelectorListProps) {
  return (
    <ul
      ref={listRef}
      id={listboxId}
      role="listbox"
      className="absolute z-30 mt-2 max-h-60 w-full overflow-auto overscroll-contain rounded-2xl border border-[var(--border)] bg-white py-1.5 shadow-lg animate-in fade-in-50 duration-150"
    >
      {options.map((item, idx) => {
        const isHighlighted = idx === highlightedIndex;
        return (
          <li
            key={item.id}
            id={`${listboxId}-opt-${idx}`}
            role="option"
            aria-selected={isHighlighted}
            onClick={() => onSelect(item)}
            onMouseEnter={() => onHighlight(idx)}
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
  );
}
