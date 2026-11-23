export default function PerfilLoading() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 animate-pulse" aria-busy="true" aria-label="Cargando perfil...">
      <div className="flex items-center gap-4 rounded-2xl border border-[var(--border)] bg-white p-6 shadow-2xs">
        <div className="h-16 w-16 shrink-0 rounded-full bg-neutral-200" />
        <div className="flex-1 space-y-2">
          <div className="h-5 w-40 rounded bg-neutral-200" />
          <div className="h-3.5 w-28 rounded bg-neutral-100" />
        </div>
      </div>
      <div className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-2xs space-y-3">
        <div className="h-4 w-32 rounded bg-neutral-200" />
        <div className="h-10 rounded-lg bg-neutral-100" />
        <div className="h-10 rounded-lg bg-neutral-100" />
      </div>
    </div>
  );
}
