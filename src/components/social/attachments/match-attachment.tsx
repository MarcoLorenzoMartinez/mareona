import { TeamCrest } from "@/components/media/team-crest";
import { CANONICAL_SPORTING_NAME } from "@/lib/sports-api/types";
import { formatAttachmentDate, formatScoreLine } from "@/lib/social/attachments/format";
import { AttachmentShell } from "./attachment-shell";
import type { ResolvedMatchAttachment } from "@/lib/social/attachments/types";

function TeamSide({ name, crestUrl, align }: { readonly name: string; readonly crestUrl: string | null; readonly align: "left" | "right" }) {
  const isSporting = name === CANONICAL_SPORTING_NAME;
  return (
    <div className={`flex min-w-0 flex-1 items-center gap-2 ${align === "right" ? "flex-row-reverse text-right" : ""}`}>
      <TeamCrest crestUrl={crestUrl} teamName={name} size="sm" isSporting={isSporting} />
      <span className={`truncate text-sm ${isSporting ? "font-bold" : "font-medium"} text-neutral-900`}>{name}</span>
    </div>
  );
}

function CenterBadge({ data }: { readonly data: ResolvedMatchAttachment }) {
  if (data.status === "scheduled" || data.homeScore === null || data.awayScore === null) {
    return <span className="shrink-0 text-xs font-semibold text-neutral-500">vs</span>;
  }
  return (
    <span className="shrink-0 rounded-full bg-neutral-900 px-2.5 py-0.5 font-sans text-sm font-bold tabular-nums text-white">
      {data.homeScore} - {data.awayScore}
    </span>
  );
}

export function MatchAttachment({ data }: { readonly data: ResolvedMatchAttachment }) {
  const meta = [
    data.isHistorical ? "Partido histórico" : null,
    data.competition,
    data.roundLabel,
    formatAttachmentDate(data.kickoffAt),
  ].filter(Boolean);

  return (
    <AttachmentShell
      href={data.href}
      label={`Partido: ${formatScoreLine(data.homeName, data.awayName, data.homeScore, data.awayScore)}`}
    >
      <p className="mb-2 flex flex-wrap items-center gap-x-1.5 text-xs text-neutral-500">
        {data.status === "live" && (
          <span className="rounded-full bg-[var(--primary)] px-2 py-0.5 font-bold text-white">En directo</span>
        )}
        {meta.join(" · ")}
      </p>
      <div className="flex items-center gap-2.5">
        <TeamSide name={data.homeName} crestUrl={data.homeCrestUrl} align="left" />
        <CenterBadge data={data} />
        <TeamSide name={data.awayName} crestUrl={data.awayCrestUrl} align="right" />
      </div>
    </AttachmentShell>
  );
}
