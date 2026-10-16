import { TeamCrest } from "@/components/media/team-crest";

interface TeamHeaderMeta {
  readonly name: string;
  readonly crestUrl?: string | null;
  readonly isSporting: boolean;
}

interface LineupsDesktopHeaderProps {
  readonly homeTeam: TeamHeaderMeta;
  readonly awayTeam: TeamHeaderMeta;
}

/**
 * Desktop tactical pitch header with clean team crests and centered VS separator.
 */
export function LineupsDesktopHeader({ homeTeam, awayTeam }: LineupsDesktopHeaderProps) {
  return (
    <div className="flex items-center justify-between border-b border-[var(--border)] pb-3 mb-4">
      {/* Local */}
      <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 max-w-[44%]">
        <TeamCrest
          crestUrl={homeTeam.crestUrl}
          teamName={homeTeam.name}
          size="sm"
          isSporting={homeTeam.isSporting}
        />
        <span
          className={`text-xs sm:text-sm truncate ${
            homeTeam.isSporting
              ? "font-bold text-[var(--primary)]"
              : "font-bold text-[var(--foreground)]"
          }`}
        >
          {homeTeam.name}
        </span>
      </div>

      {/* VS Separador */}
      <span className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-[9px] sm:text-[10px] font-bold tracking-wider uppercase text-[var(--foreground-muted)] border border-[var(--border)] shrink-0">
        VS
      </span>

      {/* Visitante */}
      <div className="flex items-center justify-end gap-2 sm:gap-2.5 min-w-0 max-w-[44%] text-right">
        <span
          className={`text-xs sm:text-sm truncate ${
            awayTeam.isSporting
              ? "font-bold text-[var(--primary)]"
              : "font-bold text-[var(--foreground)]"
          }`}
        >
          {awayTeam.name}
        </span>
        <TeamCrest
          crestUrl={awayTeam.crestUrl}
          teamName={awayTeam.name}
          size="sm"
          isSporting={awayTeam.isSporting}
        />
      </div>
    </div>
  );
}
