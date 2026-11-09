"use client"; // Client: Manejo de búsqueda y sincronización con parámetros URL

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";

/**
 * Accessible search bar for filtering users in the administrative table.
 * Debounced submit or Enter updates the URL query parameter `?q=...`.
 */
export function UserSearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";

  const [query, setQuery] = useState(initialQuery);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(() => {
      const trimmed = query.trim();
      const params = new URLSearchParams(searchParams.toString());
      if (trimmed) {
        params.set("q", trimmed);
      } else {
        params.delete("q");
      }
      router.push(`/admin/usuarios?${params.toString()}`);
    });
  }

  function handleClear() {
    setQuery("");
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("q");
      router.push(`/admin/usuarios?${params.toString()}`);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="relative flex w-full max-w-md items-center gap-2">
      <label htmlFor="user-search" className="sr-only">
        Buscar usuario por nombre o identificador
      </label>
      <div className="relative w-full">
        <input
          id="user-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por @usuario o nombre..."
          className="w-full rounded-full border border-[var(--border)] bg-white px-4 py-2 text-sm text-[var(--foreground)] placeholder-[var(--muted-foreground)] transition-colors focus:border-[var(--brand)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Limpiar búsqueda"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          >
            ✕
          </button>
        )}
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-[var(--brand,#e2001a)] px-5 py-2 text-xs font-bold text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2 disabled:opacity-50"
      >
        {isPending ? "Buscando..." : "Buscar"}
      </button>
    </form>
  );
}
