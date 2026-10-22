import type {
  Card,
  CardDecade,
  CardPosition,
  HistoricalCrestEra,
} from "../types.ts";

/**
 * Compact tuple schema for historical player definitions:
 * [suffix, slug, fullName, knownAs, decade, eraLabel, position, pj, def, atq, ovr, photoUrl, crestEra, bio]
 */
export type PlayerTuple = readonly [
  idSuffix: string,
  slug: string,
  fullName: string,
  knownAs: string,
  decade: CardDecade,
  eraLabel: string,
  position: CardPosition,
  matchesPlayed: number,
  defensePower: number,
  attackPower: number,
  ovr: number,
  photoUrl: string,
  historicalCrestEra: HistoricalCrestEra,
  bioSnippet: string,
];

/**
 * Transforms compact player tuples into fully typed Card entities.
 */
export function buildPlayers(tuples: readonly PlayerTuple[]): readonly Card[] {
  return tuples.map(
    ([
      suffix,
      slug,
      fullName,
      knownAs,
      decade,
      eraLabel,
      position,
      matchesPlayed,
      defensePower,
      attackPower,
      ovr,
      photoUrl,
      historicalCrestEra,
      bioSnippet,
    ]) => ({
      id: `00000000-0000-4000-8000-${suffix.padStart(12, "0")}`,
      slug,
      kind: "player" as const,
      fullName,
      knownAs,
      decade,
      eraLabel,
      position,
      matchesPlayed,
      defensePower: Math.min(99, Math.max(30, defensePower)),
      attackPower: Math.min(99, Math.max(30, attackPower)),
      ovr: Math.min(99, Math.max(50, ovr)),
      photoUrl,
      historicalCrestEra,
      bioSnippet,
      isActive: true,
    })
  );
}

/**
 * Parameter definition for authentic commemorative crest card creation.
 */
export interface CrestCardInput {
  readonly id: string;
  readonly slug: string;
  readonly fullName: string;
  readonly knownAs: string;
  readonly decade: CardDecade;
  readonly eraLabel: string;
  readonly photoUrl: string;
  readonly historicalCrestEra: HistoricalCrestEra;
  readonly bioSnippet: string;
  readonly year?: number;
}

/**
 * Creates a commemorative crest card object without competitive stats.
 */
export function c(input: CrestCardInput): Card {
  return {
    id: input.id,
    slug: input.slug,
    kind: "crest",
    fullName: input.fullName,
    knownAs: input.knownAs,
    decade: input.decade,
    eraLabel: input.eraLabel,
    photoUrl: input.photoUrl,
    historicalCrestEra: input.historicalCrestEra,
    bioSnippet: input.bioSnippet,
    isActive: true,
    year: input.year,
  };
}

/**
 * Parameter definition for authentic historical moment card creation.
 */
export interface MomentCardInput {
  readonly id: string;
  readonly slug: string;
  readonly fullName: string;
  readonly knownAs: string;
  readonly decade: CardDecade;
  readonly eraLabel: string;
  readonly photoUrl: string;
  readonly historicalCrestEra: HistoricalCrestEra;
  readonly bioSnippet: string;
  readonly year: number;
}

/**
 * Creates an iconic historical match or milestone card without competitive stats.
 */
export function m(input: MomentCardInput): Card {
  return {
    id: input.id,
    slug: input.slug,
    kind: "moment",
    fullName: input.fullName,
    knownAs: input.knownAs,
    decade: input.decade,
    eraLabel: input.eraLabel,
    photoUrl: input.photoUrl,
    historicalCrestEra: input.historicalCrestEra,
    bioSnippet: input.bioSnippet,
    isActive: true,
    year: input.year,
  };
}
