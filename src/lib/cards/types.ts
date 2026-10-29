/**
 * Domain types for Mareona Historical Cards Collection and Duels.
 * Conforms strictly to AGENTS.md clean code and TypeScript standards.
 */

export type CardPosition = "goalkeeper" | "defender" | "midfielder" | "forward";

export type CardKind = "player" | "crest" | "moment" | "coach";

export type CardDecade =
  | "1920s"
  | "1930s"
  | "1940s"
  | "1950s"
  | "1960s"
  | "1970s"
  | "1980s"
  | "1990s"
  | "2000s"
  | "2010s"
  | "2020s";

export type CardStatKey = "matches_played" | "attack_power" | "defense_power" | "ovr";

export type HistoricalCrestEra =
  | "1905"
  | "republic"
  | "classic_1950"
  | "golden_1980"
  | "modern";

export interface Card {
  readonly id: string;
  readonly slug: string;
  readonly kind?: CardKind;
  readonly fullName: string;
  readonly knownAs: string;
  readonly decade: CardDecade;
  readonly eraLabel: string;
  readonly position?: CardPosition;
  readonly matchesPlayed?: number;
  readonly attackPower?: number;
  readonly defensePower?: number;
  readonly ovr?: number;
  readonly photoUrl: string;
  readonly historicalCrestUrl?: string | null;
  readonly historicalCrestEra: HistoricalCrestEra;
  readonly bioSnippet?: string | null;
  readonly isActive: boolean;
  readonly year?: number;
}

export interface UserCardSummary {
  readonly card: Card;
  readonly quantity: number;
  readonly acquiredAt: string;
  readonly isDuplicate: boolean;
}

export type TacticalFormation =
  | "4-3-3"
  | "4-4-2"
  | "3-5-2"
  | "4-5-1"
  | "3-4-3"
  | "5-3-2"
  | "5-2-3"
  | "4-2-3-1";

export interface TacticalSlotRequirement {
  readonly goalkeepers: number;
  readonly defenders: number;
  readonly midfielders: number;
  readonly forwards: number;
}

export interface PackOpeningResult {
  readonly cardId: string;
  readonly slug: string;
  readonly knownAs: string;
  readonly position: CardPosition;
  readonly decade: CardDecade;
  readonly photoUrl: string;
  readonly ovr: number;
  readonly isNew: boolean;
}

export interface DuelRoundCardChoice {
  readonly cardId: string;
  readonly statKey: CardStatKey;
}

export interface DuelRoundResolution {
  readonly roundNumber: number;
  readonly hostCard: Card;
  readonly guestCard: Card;
  readonly contestedStat: CardStatKey;
  readonly hostValue: number;
  readonly guestValue: number;
  readonly winner: "host" | "guest" | "tie";
}

export type PackTier = "aficionado" | "rojiblanco" | "leyenda";

export interface PackTierConfig {
  readonly tier: PackTier;
  readonly name: string;
  readonly cardCount: number;
  readonly subtitle: string;
  readonly description: string;
  readonly minOvrGuaranteed?: number;
  readonly legendGuaranteed?: boolean;
}

export interface UserPackInventory {
  readonly aficionado: number;
  readonly rojiblanco: number;
  readonly leyenda: number;
}

export interface DailyMissionState {
  readonly todayDate: string;
  readonly hasClaimedDailyLogin: boolean;
  readonly hasClaimedDailyGame: boolean;
  readonly isMatchday: boolean;
}
