// Client: Selector modal de datos de Temporada con búsqueda, pestañas y carga bajo demanda
"use client";

import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import { getHistoricalMatchOptions } from "@/lib/social/attachment-options";
import type { AttachmentOption, AttachmentOptions } from "@/lib/social/attachment-options";
import { AttachmentOptionList } from "./attachment-option-list";

type PickerTab = "stat" | "player" | "match" | "historical";

const TABS: readonly { readonly id: PickerTab; readonly label: string }[] = [
  { id: "stat", label: "Estadística" },
  { id: "player", label: "Jugador" },
  { id: "match", label: "Partido" },
  { id: "historical", label: "Histórico" },
];

interface AttachmentPickerDialogProps {
  readonly options: AttachmentOptions;
  readonly onSelect: (option: AttachmentOption) => void;
  readonly onClose: () => void;
}

export function AttachmentPickerDialog({ options, onSelect, onClose }: AttachmentPickerDialogProps) {
  const [tab, setTab] = useState<PickerTab>("stat");
  const [query, setQuery] = useState("");
  const [seasonId, setSeasonId] = useState("");
  const [historical, setHistorical] = useState<readonly AttachmentOption[]>([]);
  const [isLoadingSeason, setIsLoadingSeason] = useState(false);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const handleSeasonChange = async (id: string) => {
    setSeasonId(id);
    setHistorical([]);
    if (!id) return;
    setIsLoadingSeason(true);
    setHistorical(await getHistoricalMatchOptions(id));
    setIsLoadingSeason(false);
  };

  const visible = useMemo(() => {
    const source =
      tab === "stat" ? options.stats : tab === "player" ? options.players : tab === "match" ? options.matches : historical;
    const q = query.trim().toLowerCase();
    return q ? source.filter((o) => `${o.title} ${o.subtitle}`.toLowerCase().includes(q)) : source;
  }, [tab, query, options, historical]);

  const emptyLabel =
    tab === "historical" && !seasonId
      ? "Elige una temporada"
      : isLoadingSeason
        ? "Cargando…"
        : query
          ? "Sin resultados"
          : "No hay datos disponibles en este momento";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Adjuntar dato de la temporada"
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[85dvh] w-full max-w-lg flex-col rounded-t-2xl bg-white sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 pt-3">
          <h2 className="text-base font-bold text-neutral-900">Adjuntar dato</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="flex h-11 w-11 items-center justify-center rounded-full text-neutral-600 hover:bg-[var(--surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div role="tablist" aria-label="Tipo de dato" className="flex gap-1.5 overflow-x-auto px-4 pb-2">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={`min-h-9 shrink-0 rounded-full border px-3.5 text-sm transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] ${
                tab === t.id
                  ? "border-[var(--primary)] bg-[var(--primary)] font-bold text-white"
                  : "border-[var(--border)] font-semibold text-neutral-700 hover:bg-[var(--surface)]"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex gap-2 px-4 pb-2">
          {tab === "historical" && (
            <select
              aria-label="Temporada"
              value={seasonId}
              onChange={(e) => void handleSeasonChange(e.target.value)}
              className="min-h-11 rounded-full border border-[var(--border)] bg-white px-3 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
            >
              <option value="">Temporada</option>
              {options.seasons.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          )}
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar"
            aria-label="Buscar"
            className="min-h-11 min-w-0 flex-1 rounded-full border border-[var(--border)] bg-white px-4 text-base placeholder:text-neutral-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
          />
        </div>

        <AttachmentOptionList options={visible} emptyLabel={emptyLabel} onSelect={onSelect} />
      </div>
    </div>
  );
}
