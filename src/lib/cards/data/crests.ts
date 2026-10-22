import type { Card } from "../types.ts";
import { c } from "./builder.ts";

/**
 * Commemorative historical crest cards collection.
 * Conforms strictly to the 5 genuine canonical design eras of Real Sporting de Gijón.
 * Zero duplicate graphics or artificial decade replicas.
 */
export const HISTORICAL_CRESTS: readonly Card[] = [
  c({
    id: "00000000-0000-4000-8000-000000000001",
    slug: "escudo-fundacional-1912",
    fullName: "Escudo Fundacional con Corona Real",
    knownAs: "Escudo Fundacional",
    decade: "1920s",
    eraLabel: "1912 – 1931",
    photoUrl: "/crests/historical/sporting-1905.png",
    historicalCrestEra: "1905",
    bioSnippet: "El primer emblema oficial diseñado por Anselmo López tras la concesión del título Real por Alfonso XIII.",
    year: 1912,
  }),
  c({
    id: "00000000-0000-4000-8000-000000000002",
    slug: "escudo-republicano-1931",
    fullName: "Escudo Circular Republicano con Corona Mural",
    knownAs: "Escudo Republicano",
    decade: "1930s",
    eraLabel: "1931 – 1939",
    photoUrl: "/crests/historical/sporting-republic.png",
    historicalCrestEra: "republic",
    bioSnippet: "Emblema circular adoptado durante la II República con corona mural y siglas entrelazadas.",
    year: 1931,
  }),
  c({
    id: "00000000-0000-4000-8000-000000000003",
    slug: "escudo-real-gijon-1941",
    fullName: "Escudo Real Gijón C.F.",
    knownAs: "Real Gijón C.F.",
    decade: "1950s",
    eraLabel: "1941 – 1970",
    photoUrl: "/crests/historical/sporting-classic-1950.png",
    historicalCrestEra: "classic_1950",
    bioSnippet: "Insignia con la gran 'G' puntiaguda impuesta tras la prohibición estatal de extranjerismos en 1941.",
    year: 1941,
  }),
  c({
    id: "00000000-0000-4000-8000-000000000004",
    slug: "escudo-eurosporting-1970",
    fullName: "Escudo Clásico EuroSporting",
    knownAs: "Escudo EuroSporting",
    decade: "1980s",
    eraLabel: "1970 – 1997",
    photoUrl: "/crests/historical/sporting-golden-1980.png",
    historicalCrestEra: "golden_1980",
    bioSnippet: "Restitución del nombre histórico 'Sporting', las dos finales de Copa y las noches europeas con Quini.",
    year: 1970,
  }),
  c({
    id: "00000000-0000-4000-8000-000000000005",
    slug: "escudo-oficial-1997",
    fullName: "Escudo Oficial Real Sporting de Gijón",
    knownAs: "Escudo Oficial",
    decade: "2020s",
    eraLabel: "1997 – Presente",
    photoUrl: "/crests/historical/sporting-modern.png",
    historicalCrestEra: "modern",
    bioSnippet: "Blasón corporativo canónico rojiblanco con corona real timbrada que defiende el club hoy en día.",
    year: 1997,
  }),
] as const;
