import type { HistoricalMatchGoal, HistoricalMatchPlayer } from "@/lib/historical/types";

export type TimelineEventType = "goal" | "yellow" | "red" | "sub";

export interface MatchTimelineEvent {
  readonly type: TimelineEventType;
  readonly minute: number;
  readonly minuteDisplay?: string;
  readonly isHome: boolean;
  readonly primaryText: string;
  readonly secondaryText?: string;
  readonly badge?: string;
  readonly note?: string;
}

const TYPE_PRIORITY: Record<TimelineEventType, number> = {
  goal: 1,
  red: 2,
  yellow: 3,
  sub: 4,
};

/**
 * Builds and chronologically sorts all match events (goals, bookings, subs) from official match data.
 */
export function buildTimelineEvents(
  goals: readonly HistoricalMatchGoal[],
  hStarters: readonly HistoricalMatchPlayer[] = [],
  aStarters: readonly HistoricalMatchPlayer[] = [],
  hBench: readonly HistoricalMatchPlayer[] = [],
  aBench: readonly HistoricalMatchPlayer[] = []
): MatchTimelineEvent[] {
  const events: MatchTimelineEvent[] = goals.map((g) => ({
    type: "goal",
    minute: g.minute,
    minuteDisplay: g.minuteDisplay,
    isHome: g.isHome ?? true,
    primaryText: g.scorer,
    badge: g.score,
    note: g.isPenalty ? "Penalti" : g.isOwnGoal ? "p.p." : undefined,
  }));

  const addCards = (players: readonly HistoricalMatchPlayer[], isHome: boolean) => {
    players.forEach((p) => {
      if (p.yellowCard) events.push({ type: "yellow", minute: p.yellowCard, isHome, primaryText: p.name });
      if (p.redCard) events.push({ type: "red", minute: p.redCard, isHome, primaryText: p.name });
    });
  };
  [hStarters, hBench].forEach((list) => addCards(list, true));
  [aStarters, aBench].forEach((list) => addCards(list, false));

  const addSubs = (starters: readonly HistoricalMatchPlayer[], bench: readonly HistoricalMatchPlayer[], isHome: boolean) => {
    const outs = starters.filter((p) => p.subOut !== undefined).map((p) => ({ ...p, used: false }));
    bench.filter((b) => b.subIn !== undefined).forEach((b) => {
      const m = outs.find((o) => !o.used && o.subOut === b.subIn);
      if (m) m.used = true;
      events.push({ type: "sub", minute: b.subIn!, isHome, primaryText: b.name, secondaryText: m?.name });
    });
  };
  addSubs(hStarters, hBench, true);
  addSubs(aStarters, aBench, false);

  return events.sort((a, b) => a.minute - b.minute || TYPE_PRIORITY[a.type] - TYPE_PRIORITY[b.type]);
}
