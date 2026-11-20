// Client: Modal accesible para añadir futbolistas no registrados o canteranos invitados
"use client";

import { useState } from "react";
import { customPlayerSchema, type LineupPlayer } from "@/lib/lineup-builder/types";
import { useModalA11y } from "@/lib/ui/use-modal-a11y";
import { getDictionary } from "@/i18n";

interface CustomPlayerModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onAddPlayer: (player: LineupPlayer) => void;
}

export function CustomPlayerModal({
  isOpen,
  onClose,
  onAddPlayer,
}: CustomPlayerModalProps) {
  const dict = getDictionary();
  const [name, setName] = useState("");
  const [shirtNumber, setShirtNumber] = useState<string>("");
  const [position, setPosition] = useState<"POR" | "DEF" | "MED" | "DEL">("MED");
  const [error, setError] = useState<string | null>(null);

  const { handleBackdropClick } = useModalA11y({ isOpen, onClose });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedNumber = shirtNumber.trim() ? parseInt(shirtNumber.trim(), 10) : null;
    const result = customPlayerSchema.safeParse({
      displayName: name.trim(),
      shirtNumber: Number.isNaN(parsedNumber) ? null : parsedNumber,
      defaultPosition: position,
      category: "custom",
    });

    if (!result.success) {
      setError(result.error.issues[0]?.message ?? dict.lineupBuilder.customPlayerModal.invalidDataFallback);
      return;
    }

    const newPlayer: LineupPlayer = {
      id: `custom-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      displayName: result.data.displayName,
      fullName: result.data.displayName,
      shirtNumber: result.data.shirtNumber ?? null,
      defaultPosition: result.data.defaultPosition,
      category: "custom",
      photoUrl: null,
      isCustom: true,
    };

    onAddPlayer(newPlayer);
    setName("");
    setShirtNumber("");
    setError(null);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="custom-player-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={handleBackdropClick}
    >
      <div
        className="w-full max-w-sm rounded-2xl border border-[var(--border)] bg-white p-6 shadow-xl animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="custom-player-title" className="text-base font-bold text-neutral-900">
          {dict.lineupBuilder.customPlayerModal.title}
        </h2>
        <p className="mt-1 text-xs text-neutral-500">
          {dict.lineupBuilder.customPlayerModal.subtitle}
        </p>

        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
          {error && (
            <div className="rounded-lg bg-red-50 p-2.5 text-xs text-red-700">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="custom-player-name" className="block text-xs font-semibold text-neutral-700">
              {dict.lineupBuilder.customPlayerModal.nameLabel}
            </label>
            <input
              id="custom-player-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={dict.lineupBuilder.customPlayerModal.namePlaceholder}
              className="mt-1 w-full rounded-lg border border-[var(--border)] px-3 py-2 text-sm focus:border-[#e2001a] focus:ring-2 focus:ring-[#e2001a] outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label htmlFor="custom-player-num" className="block text-xs font-semibold text-neutral-700">
                {dict.lineupBuilder.customPlayerModal.numberLabel}
              </label>
              <input
                id="custom-player-num"
                type="number"
                min="1"
                max="99"
                value={shirtNumber}
                onChange={(e) => setShirtNumber(e.target.value)}
                placeholder={dict.lineupBuilder.customPlayerModal.numberPlaceholder}
                className="mt-1 w-full rounded-lg border border-[var(--border)] px-3 py-2 text-sm focus:border-[#e2001a] focus:ring-2 focus:ring-[#e2001a] outline-none tabular-nums"
              />
            </div>

            <div>
              <label htmlFor="custom-player-pos" className="block text-xs font-semibold text-neutral-700">
                {dict.lineupBuilder.customPlayerModal.lineLabel}
              </label>
              <select
                id="custom-player-pos"
                value={position}
                onChange={(e) => setPosition(e.target.value as "POR" | "DEF" | "MED" | "DEL")}
                className="mt-1 w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm focus:border-[#e2001a] focus:ring-2 focus:ring-[#e2001a] outline-none"
              >
                <option value="POR">{dict.lineupBuilder.customPlayerModal.positions.goalkeeper}</option>
                <option value="DEF">{dict.lineupBuilder.customPlayerModal.positions.defender}</option>
                <option value="MED">{dict.lineupBuilder.customPlayerModal.positions.midfielder}</option>
                <option value="DEL">{dict.lineupBuilder.customPlayerModal.positions.forward}</option>
              </select>
            </div>
          </div>

          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] rounded-full px-4 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
            >
              {dict.lineupBuilder.customPlayerModal.cancelButton}
            </button>
            <button
              type="submit"
              className="min-h-[44px] rounded-full bg-[#e2001a] px-5 py-2 text-xs font-bold text-white hover:bg-[#b30015] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] cursor-pointer"
            >
              {dict.lineupBuilder.customPlayerModal.submitButton}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
