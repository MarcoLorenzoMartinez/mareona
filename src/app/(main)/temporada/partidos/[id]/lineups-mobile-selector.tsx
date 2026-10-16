// Client: Accessible mobile team pill selector for tactical lineups
"use client";

import { TeamCrest } from "@/components/media/team-crest";

interface TeamSelectorMeta {
  readonly name: string;
  readonly crestUrl?: string | null;
  readonly isSporting: boolean;
  readonly formation?: string;
}

interface LineupsMobileSelectorProps {
  readonly homeTeam: TeamSelectorMeta;
  readonly awayTeam: TeamSelectorMeta;
  readonly activeTeam: "home" | "away";
  readonly onSelectTeam: (team: "home" | "away") => void;
}

export function LineupsMobileSelector({
  homeTeam,
  awayTeam,
  activeTeam,
  onSelectTeam,
}: LineupsMobileSelectorProps) {
  const teams: Array<{ readonly key: "home" | "away"; readonly meta: TeamSelectorMeta }> = [
    { key: "home", meta: homeTeam },
    { key: "away", meta: awayTeam },
  ];

  return (
    <div
      role="radiogroup"
      aria-label="Seleccionar equipo en campo táctico"
      className="grid grid-cols-2 gap-1 rounded-full border border-[var(--border)] bg-[var(--surface)] p-1 shadow-2xs"
    >
      {teams.map(({ key, meta }) => {
        const isSelected = activeTeam === key;
        return (
          <button
            key={key}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => onSelectTeam(key)}
            className={`inline-flex min-h-[40px] items-center justify-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] cursor-pointer ${
              isSelected
                ? "bg-[var(--primary)] text-white shadow-xs font-bold"
                : "text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
            }`}
          >
            <TeamCrest
              crestUrl={meta.crestUrl}
              teamName={meta.name}
              size="sm"
              isSporting={meta.isSporting}
            />
            <span className="truncate max-w-[100px] sm:max-w-[130px]">{meta.name}</span>
            {meta.formation && (
              <span
                className={`text-[10px] font-sans tabular-nums opacity-90 ${
                  isSelected ? "text-white" : "text-[var(--foreground-muted)]"
                }`}
              >
                ({meta.formation})
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
