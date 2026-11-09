import { Suspense } from "react";
import { searchAdminUsers } from "@/lib/admin/user-actions";
import { UserSearchBar } from "./user-search-bar";
import { UserRowCard } from "./user-row-card";

export const metadata = {
  title: "Usuarios | Mareona Admin",
  description: "Búsqueda y control disciplinario de cuentas",
};

interface UsersAdminPageProps {
  readonly searchParams: Promise<{ q?: string }>;
}

/**
 * Server page for user accounts inspection and disciplinary management.
 */
export default async function UsersAdminPage({ searchParams }: UsersAdminPageProps) {
  const params = await searchParams;
  const query = params.q?.trim() || "";
  const users = await searchAdminUsers(query);

  return (
    <div className="space-y-6 py-2">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="text-lg font-bold tracking-tight text-[var(--foreground)]">
          Usuarios
        </h1>

        <Suspense fallback={<div className="h-10 w-full max-w-md animate-pulse rounded-full bg-neutral-100" />}>
          <UserSearchBar />
        </Suspense>
      </div>

      <div className="flex items-center justify-between border-t border-[var(--border)] pt-4 text-xs text-[var(--muted-foreground)]">
        <span>
          {query ? `Resultados para "${query}"` : "Cuentas recientes"}
        </span>
        <span className="tabular-nums font-semibold text-[var(--foreground)]">
          {users.length} usuario{users.length === 1 ? "" : "s"}
        </span>
      </div>

      {users.length === 0 ? (
        <div
          className="rounded-xl border border-[var(--border)] bg-white p-8 text-center text-[var(--muted-foreground)]"
          role="status"
        >
          <p className="text-sm font-semibold text-[var(--foreground)]">
            No se encontraron usuarios
          </p>
        </div>
      ) : (
        <div className="space-y-3" role="feed" aria-label="Listado de usuarios">
          {users.map((user) => (
            <UserRowCard key={user.id} user={user} />
          ))}
        </div>
      )}
    </div>
  );
}
