import { searchAdminUsers } from "@/lib/admin/user-actions";
import { UserSearchBar } from "./user-search-bar";
import { UserRowCard } from "./user-row-card";

export const metadata = {
  title: "Gestión de Usuarios | Mareona Admin",
  description: "Búsqueda y control disciplinario de aficionados y cuentas en Mareona",
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
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[var(--foreground)]">
            Usuarios y Disciplina
          </h1>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Gestión de perfiles, control de sanciones y restablecimiento de fotos de avatar.
          </p>
        </div>

        <UserSearchBar />
      </div>

      <div className="flex items-center justify-between border-t border-[var(--border)] pt-4 text-xs text-[var(--muted-foreground)]">
        <span>
          {query ? `Resultados para "${query}"` : "Cuentas registradas recientemente"}
        </span>
        <span className="tabular-nums font-semibold text-[var(--foreground)]">
          {users.length} usuario{users.length === 1 ? "" : "s"}
        </span>
      </div>

      {users.length === 0 ? (
        <div
          className="rounded-2xl border border-[var(--border)] bg-white p-8 text-center text-[var(--muted-foreground)]"
          role="status"
        >
          <p className="text-base font-semibold text-[var(--foreground)]">
            No se encontraron usuarios
          </p>
          <p className="mt-1 text-sm">
            Prueba a buscar por otro término o limpia el buscador para ver las cuentas recientes.
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
