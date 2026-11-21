"use client"; // Client: Contenedor global de notificaciones toast accesible y ligero

import { useEffect, useState } from "react";
import type { ToastItem } from "@/lib/ui/toast";

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    const handleToast = (e: Event) => {
      const custom = e as CustomEvent<ToastItem>;
      if (!custom.detail) return;
      const item = custom.detail;
      setToasts((prev) => [...prev, item]);

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== item.id));
      }, 3800);
    };

    window.addEventListener("mareona_toast_notify", handleToast);
    return () => window.removeEventListener("mareona_toast_notify", handleToast);
  }, []);

  return (
    <div
      aria-live="polite"
      aria-label="Notificaciones"
      className="fixed bottom-20 sm:bottom-4 right-4 z-[60] flex flex-col gap-2 max-w-sm w-full pointer-events-none select-none px-3"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className="pointer-events-auto flex items-start gap-3 rounded-xl border border-[var(--border)] bg-white p-3.5 shadow-xl animate-in slide-in-from-bottom-3 fade-in duration-200"
        >
          <span
            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
              t.type === "success"
                ? "bg-[#e2001a] text-white"
                : t.type === "error"
                  ? "bg-red-700 text-white"
                  : "bg-neutral-800 text-white"
            }`}
          >
            {t.type === "success" ? "✓" : t.type === "error" ? "✕" : "ℹ"}
          </span>
          <div className="flex flex-col gap-0.5 flex-1 pr-1">
            <span className="text-xs font-bold text-[var(--foreground)]">{t.message}</span>
            {t.description && (
              <span className="text-[11px] text-[var(--foreground-muted)] leading-tight">
                {t.description}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
