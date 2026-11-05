// Client: Botón que abre el selector y carga las opciones bajo demanda (una vez por sesión)
"use client";

import { useState } from "react";
import { Paperclip } from "lucide-react";
import { getAttachmentOptions } from "@/lib/social/attachment-options";
import type { AttachmentOption, AttachmentOptions } from "@/lib/social/attachment-options";
import { AttachmentPickerDialog } from "./attachment-picker-dialog";

interface AttachmentPickerButtonProps {
  readonly onSelect: (option: AttachmentOption) => void;
  readonly disabled?: boolean;
}

export function AttachmentPickerButton({ onSelect, disabled }: AttachmentPickerButtonProps) {
  const [options, setOptions] = useState<AttachmentOptions | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const open = async () => {
    setIsOpen(true);
    if (options || isLoading) return;
    setIsLoading(true);
    try {
      setOptions(await getAttachmentOptions());
    } catch {
      setOptions({ stats: [], players: [], matches: [], seasons: [] });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => void open()}
        disabled={disabled}
        aria-label="Adjuntar dato de la temporada"
        className="flex h-11 w-11 items-center justify-center rounded-full text-[var(--primary)] transition-colors duration-150 hover:bg-[var(--surface)] active:scale-95 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
      >
        <Paperclip className="h-5 w-5" aria-hidden="true" />
      </button>

      {isOpen && options && (
        <AttachmentPickerDialog
          options={options}
          onSelect={(option) => {
            onSelect(option);
            setIsOpen(false);
          }}
          onClose={() => setIsOpen(false)}
        />
      )}
      {isOpen && !options && (
        <div
          role="status"
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 text-sm font-semibold text-white"
        >
          Cargando…
        </div>
      )}
    </>
  );
}
