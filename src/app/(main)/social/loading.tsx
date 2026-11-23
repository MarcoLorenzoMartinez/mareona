export default function SocialLoading() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 py-4 sm:py-6 animate-pulse" aria-busy="true">
      <div className="h-10 w-56 rounded-full bg-neutral-200" />
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-[var(--border)] bg-white p-4 shadow-2xs space-y-3"
        >
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-neutral-200" />
            <div className="h-4 w-32 rounded bg-neutral-200" />
          </div>
          <div className="h-4 w-full rounded bg-neutral-200" />
          <div className="h-4 w-3/4 rounded bg-neutral-200" />
        </div>
      ))}
    </div>
  );
}
