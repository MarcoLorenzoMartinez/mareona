// Client: Lista seleccionable de opciones (el estado de selección vive en el diálogo)
"use client";

import type { AttachmentOption } from "@/lib/social/attachment-options";

interface AttachmentOptionListProps {
  readonly options: readonly AttachmentOption[];
  readonly emptyLabel: string;
  readonly onSelect: (option: AttachmentOption) => void;
}

export function AttachmentOptionList({ options, emptyLabel, onSelect }: AttachmentOptionListProps) {
  if (options.length === 0) {
    return <p className="px-4 py-10 text-center text-sm text-neutral-500">{emptyLabel}</p>;
  }

  return (
    <ul className="min-h-0 flex-1 overflow-y-auto overscroll-contain border-t border-[var(--border)] pb-[env(safe-area-inset-bottom)]">
      {options.map((option) => (
        <li key={JSON.stringify(option.ref)} className="border-b border-[var(--border)] last:border-b-0">
          <button
            type="button"
            onClick={() => onSelect(option)}
            className="flex min-h-14 w-full flex-col justify-center px-4 py-2 text-left transition-colors duration-150 hover:bg-[var(--surface)] active:bg-[var(--surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--primary)]"
          >
            <span className="text-sm font-semibold text-neutral-900">{option.title}</span>
            <span className="text-xs text-neutral-500">{option.subtitle}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}
