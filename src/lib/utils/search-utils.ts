/**
 * Search and text normalization utilities for accent-insensitive,
 * diacritic-insensitive, and case-insensitive matching across Mareona.
 */

const SPECIAL_CHAR_MAP: Record<string, string> = {
  'đ': 'd',
  'ł': 'l',
  'ø': 'o',
  'ß': 'ss',
  'æ': 'ae',
  'œ': 'oe',
};

/**
 * Normalizes a string by stripping accents, diacritics, and special characters.
 * E.g., "Šćepović" -> "scepovic", "Joaquín" -> "joaquin", "Molinón" -> "molinon".
 */
export function normalizeSearchText(text?: string | null): string {
  if (!text) return '';
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[đłøßæœ]/g, (char) => SPECIAL_CHAR_MAP[char] || char)
    .trim();
}

/**
 * Checks whether target string contains the query string, ignoring case,
 * accents, diacritics, and special Latin characters.
 */
export function matchesSearchQuery(
  target?: string | null,
  query?: string | null
): boolean {
  if (!target || !query) return false;
  const cleanTarget = normalizeSearchText(target);
  const cleanQuery = normalizeSearchText(query);
  if (!cleanQuery) return false;
  return cleanTarget.includes(cleanQuery);
}
