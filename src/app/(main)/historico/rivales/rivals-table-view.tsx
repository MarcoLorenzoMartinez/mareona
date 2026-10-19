// Client: Vista compacta en tabla editorial de todos los rivales históricos
"use client";

import type { RivalH2HSummary, RivalSortOption } from "@/lib/historical/rivals-types";
import { TeamCrest } from "@/components/media/team-crest";

interface RivalsTableViewProps {
  readonly rivals: readonly RivalH2HSummary[];
  readonly onSelect: (rival: RivalH2HSummary) => void;
  readonly activeSort: RivalSortOption;
  readonly onSortChange: (sort: RivalSortOption) => void;
}

export function RivalsTableView({
  rivals,
  onSelect,
  activeSort,
  onSortChange,
}: RivalsTableViewProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-white shadow-2xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm text-[var(--foreground)]">
          <caption className="sr-only">Historial acumulado contra rivales del Real Sporting</caption>
          <thead className="border-b border-[var(--border)] bg-[var(--surface)] text-[11px] uppercase tracking-wider text-[var(--muted-foreground)] select-none">
            <tr>
              <th scope="col" className="py-2.5 pl-3 pr-1 w-9 text-center font-bold">#</th>
              <th scope="col" className="py-2.5 px-3 font-bold">
                <button
                  type="button"
                  onClick={() => onSortChange("alpha")}
                  className={`inline-flex items-center gap-1 hover:text-[var(--foreground)] transition-colors cursor-pointer ${
                    activeSort === "alpha" ? "text-[var(--primary)] font-black" : ""
                  }`}
                >
                  Rival {activeSort === "alpha" && "↓"}
                </button>
              </th>
              <th scope="col" className="py-2.5 px-3 font-bold hidden md:table-cell">Origen</th>
              <th scope="col" className="py-2.5 px-3 text-right font-bold">
                <button
                  type="button"
                  onClick={() => onSortChange("played")}
                  className={`inline-flex items-center gap-1 hover:text-[var(--foreground)] transition-colors cursor-pointer ml-auto ${
                    activeSort === "played" ? "text-[var(--primary)] font-black" : ""
                  }`}
                >
                  PJ {activeSort === "played" && "↓"}
                </button>
              </th>
              <th scope="col" className="py-2.5 px-2 text-center font-bold">
                <button
                  type="button"
                  onClick={() => onSortChange("won")}
                  className={`inline-flex items-center gap-1 hover:text-[var(--foreground)] transition-colors cursor-pointer ${
                    activeSort === "won" ? "text-[var(--primary)] font-black" : ""
                  }`}
                >
                  V {activeSort === "won" && "↓"}
                </button>
              </th>
              <th scope="col" className="py-2.5 px-2 text-center font-bold">E</th>
              <th scope="col" className="py-2.5 px-2 text-center font-bold">D</th>
              <th scope="col" className="py-2.5 px-3 text-right font-bold hidden sm:table-cell">
                <button
                  type="button"
                  onClick={() => onSortChange("diff")}
                  className={`inline-flex items-center gap-1 hover:text-[var(--foreground)] transition-colors cursor-pointer ml-auto ${
                    activeSort === "diff" ? "text-[var(--primary)] font-black" : ""
                  }`}
                >
                  Goles (Dif) {activeSort === "diff" && "↓"}
                </button>
              </th>
              <th scope="col" className="py-2.5 pl-2 pr-4 text-right font-bold">
                <button
                  type="button"
                  onClick={() => onSortChange("winRate")}
                  className={`inline-flex items-center gap-1 hover:text-[var(--foreground)] transition-colors cursor-pointer ml-auto ${
                    activeSort === "winRate" ? "text-[var(--primary)] font-black" : ""
                  }`}
                >
                  % V {activeSort === "winRate" && "↓"}
                </button>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {rivals.map((rival, index) => {
              const diff = rival.goalDiff;

              return (
                <tr
                  key={rival.name}
                  onClick={() => onSelect(rival)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onSelect(rival);
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-label={`Ver historial con ${rival.name}: ${rival.played} partidos`}
                  className="group hover:bg-neutral-50/80 focus:bg-neutral-50 focus:outline-none transition-colors cursor-pointer"
                >
                  <td className="py-2.5 pl-3 pr-1 text-center font-bold tabular-nums text-[var(--muted-foreground)] text-xs">
                    {index + 1}
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <TeamCrest crestUrl={rival.crestUrl} teamName={rival.name} size="sm" isSporting={false} />
                      <div className="flex flex-col min-w-0">
                        <span className="font-bold text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors truncate">
                          {rival.name}
                        </span>
                        <span className="text-[11px] text-[var(--muted-foreground)] truncate md:hidden">
                          {rival.isInternational ? rival.country : rival.province}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-2.5 px-3 hidden md:table-cell text-xs text-[var(--muted-foreground)] font-medium">
                    {rival.isInternational ? (
                      <span className="font-semibold text-[var(--foreground)]">{rival.country}</span>
                    ) : (
                      <span>{rival.province}</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-right font-black tabular-nums text-[var(--foreground)] text-sm">
                    {rival.played}
                  </td>
                  <td className="py-2.5 px-2 text-center font-bold tabular-nums text-xs text-[var(--foreground)]">
                    {rival.won}
                  </td>
                  <td className="py-2.5 px-2 text-center font-medium tabular-nums text-xs text-[var(--muted-foreground)]">
                    {rival.drawn}
                  </td>
                  <td className="py-2.5 px-2 text-center font-medium tabular-nums text-xs text-[var(--muted-foreground)]">
                    {rival.lost}
                  </td>
                  <td className="py-2.5 px-3 text-right tabular-nums text-xs hidden sm:table-cell">
                    <span className="text-[var(--foreground)]">{rival.goalsFor}:{rival.goalsAgainst}</span>
                    <span
                      className={`ml-1.5 font-medium ${
                        diff > 0 ? "text-emerald-700 font-semibold" : diff < 0 ? "text-red-700" : "text-[var(--muted-foreground)]"
                      }`}
                    >
                      ({diff > 0 ? `+${diff}` : diff})
                    </span>
                  </td>
                  <td className="py-2.5 pl-2 pr-4 text-right">
                    <div className="inline-flex items-center justify-end gap-2">
                      <span className={`text-xs font-bold tabular-nums ${rival.winPercentage >= 50 ? "text-[var(--primary)] font-black" : "text-neutral-700"}`}>
                        {rival.winPercentage}%
                      </span>
                      <div className="hidden sm:block h-1 w-10 rounded-full bg-neutral-200/80 overflow-hidden" aria-hidden="true">
                        <div
                          className="h-full rounded-full bg-[var(--primary)] transition-all"
                          style={{ width: `${rival.winPercentage}%` }}
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
