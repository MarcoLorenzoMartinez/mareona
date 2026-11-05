import { AttachmentShell } from "./attachment-shell";
import type { ResolvedStatAttachment } from "@/lib/social/attachments/types";

export function StatAttachment({ data }: { readonly data: ResolvedStatAttachment }) {
  return (
    <AttachmentShell
      href={data.href}
      label={`Estadística del equipo: ${data.label}, ${data.value}`}
    >
      <p className="text-xs text-neutral-500">
        {data.category} · Temporada {data.seasonLabel}
      </p>
      <p className="mt-0.5 text-sm font-semibold text-neutral-900">{data.label}</p>
      <div className="mt-1.5 flex items-center gap-2.5">
        <span className="font-sans text-2xl font-bold leading-none tabular-nums text-neutral-900">
          {data.value}
        </span>
        {data.rank !== null && (
          <span className="rounded-full border border-[var(--border)] px-2.5 py-0.5 font-sans text-xs font-semibold tabular-nums text-neutral-700">
            {data.rank}º de 22 en la liga
          </span>
        )}
      </div>
    </AttachmentShell>
  );
}
