import { PlayerPhoto } from "@/components/media/player-photo";
import { AttachmentShell } from "./attachment-shell";
import type { ResolvedPlayerAttachment } from "@/lib/social/attachments/types";

export function PlayerAttachment({ data }: { readonly data: ResolvedPlayerAttachment }) {
  const dorsal = data.shirtNumber !== null ? `#${data.shirtNumber} · ` : "";

  return (
    <AttachmentShell href={data.href} label={`Ficha de ${data.name}`}>
      <div className="flex items-center gap-3">
        <PlayerPhoto photoUrl={data.photoUrl} playerName={data.name} size="sm" className="shrink-0 rounded-full" />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-neutral-900">{data.name}</p>
          <p className="text-xs text-neutral-500">
            {dorsal}
            {data.positionLabel}
          </p>
          <p className="mt-0.5 font-sans text-xs tabular-nums text-neutral-700">
            {data.appearances} partidos · {data.goals} goles · {data.assists} asistencias
          </p>
        </div>
      </div>
    </AttachmentShell>
  );
}
