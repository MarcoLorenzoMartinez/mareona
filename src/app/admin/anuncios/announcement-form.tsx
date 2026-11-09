"use client"; // Client: Formulario interactivo para emisión de avisos y activación de modo solo lectura

import { useState, useTransition } from "react";
import { saveAnnouncementAction } from "@/lib/admin/system-actions";
import { toast } from "@/lib/ui/toast";
import type { SystemAnnouncement } from "@/lib/admin/types";

interface AnnouncementFormProps {
  readonly currentAnnouncement: SystemAnnouncement | null;
}

/**
 * Interactive administrative form for broadcasting announcements and configuring emergency wall lock.
 */
export function AnnouncementForm({ currentAnnouncement }: AnnouncementFormProps) {
  const [message, setMessage] = useState(currentAnnouncement?.message ?? "");
  const [type, setType] = useState<"info" | "warning" | "alert">(currentAnnouncement?.type ?? "info");
  const [isActive, setIsActive] = useState(currentAnnouncement?.isActive ?? false);
  const [readOnlyWall, setReadOnlyWall] = useState(currentAnnouncement?.readOnlyWall ?? false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) {
      toast.error("El mensaje del aviso no puede estar vacío");
      return;
    }

    startTransition(async () => {
      const res = await saveAnnouncementAction({
        message: message.trim(),
        type,
        isActive,
        readOnlyWall,
      });

      if (res.success) {
        toast.success("Configuración de aviso guardada correctamente");
      } else {
        toast.error("Error al guardar el aviso", { description: res.error });
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-xs">
      <h2 className="text-base font-bold text-[var(--foreground)]">
        Aviso Global para Aficionados
      </h2>
      <p className="mt-1 text-xs text-[var(--muted-foreground)]">
        Publica una franja visible en la cabecera de todas las páginas de Mareona.
      </p>

      <div className="mt-4 space-y-4">
        <div>
          <label htmlFor="announcement-msg" className="block text-xs font-semibold text-[var(--foreground)]">
            Mensaje del aviso (máx. 300 caracteres)
          </label>
          <textarea
            id="announcement-msg"
            rows={3}
            maxLength={300}
            required
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ej: La porra del partido contra el Burgos ya está disponible..."
            className="mt-1 w-full rounded-xl border border-[var(--border)] p-3 text-sm text-[var(--foreground)] focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="announcement-type" className="block text-xs font-semibold text-[var(--foreground)]">
              Nivel de prioridad
            </label>
            <select
              id="announcement-type"
              value={type}
              onChange={(e) => setType(e.target.value as "info" | "warning" | "alert")}
              className="mt-1 w-full rounded-xl border border-[var(--border)] bg-white p-2.5 text-sm text-[var(--foreground)] focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]"
            >
              <option value="info">Informativo (Neutro)</option>
              <option value="warning">Atención (Ámbar)</option>
              <option value="alert">Urgente / Incidencia (Rojo)</option>
            </select>
          </div>

          <div className="flex items-center gap-3 pt-4 sm:pt-6">
            <input
              id="is-active-toggle"
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-4 w-4 rounded border-[var(--border)] text-[var(--brand)] focus:ring-[var(--brand)]"
            />
            <label htmlFor="is-active-toggle" className="text-sm font-medium text-[var(--foreground)]">
              Mostrar franja en cabecera
            </label>
          </div>

          <div className="flex items-center gap-3 pt-4 sm:pt-6">
            <input
              id="readonly-wall-toggle"
              type="checkbox"
              checked={readOnlyWall}
              onChange={(e) => setReadOnlyWall(e.target.checked)}
              className="h-4 w-4 rounded border-[var(--border)] text-[var(--brand)] focus:ring-[var(--brand)]"
            />
            <label htmlFor="readonly-wall-toggle" className="text-sm font-medium text-[var(--foreground)]">
              Poner muro social en solo lectura
            </label>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-[var(--brand,#e2001a)] px-6 py-2 text-xs font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {isPending ? "Guardando..." : "Guardar y Aplicar Aviso"}
          </button>
        </div>
      </div>
    </form>
  );
}
