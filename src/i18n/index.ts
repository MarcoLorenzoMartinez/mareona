import { es, type Dictionary } from "./dictionaries/es.ts";

export const SUPPORTED_LOCALES = ["es"] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "es";

const dictionaries: Record<Locale, Dictionary> = {
  es,
};

/**
 * Returns the strongly-typed dictionary for the requested locale.
 * Defaults to Spanish ("es") if no locale is provided.
 *
 * @param locale Target locale identifier.
 * @returns Fully typed dictionary with zero runtime latency.
 */
export function getDictionary(locale: Locale = DEFAULT_LOCALE): Dictionary {
  return dictionaries[locale] ?? dictionaries[DEFAULT_LOCALE];
}

export type { Dictionary };
