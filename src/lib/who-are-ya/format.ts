/**
 * Mapping of historical player nationalities to ISO 3166-1 alpha-2 country codes.
 */
export const NATIONALITY_ISO_CODE: Record<string, string> = {
  'España': 'es',
  'Alemania': 'de',
  'Angola': 'ao',
  'Argelia': 'dz',
  'Argentina': 'ar',
  'Bosnia-Herzegovina': 'ba',
  'Brasil': 'br',
  'Bulgaria': 'bg',
  'Camerún': 'cm',
  'Catar': 'qa',
  'Chile': 'cl',
  'Colombia': 'co',
  'Costa Rica': 'cr',
  'Costa de Marfil': 'ci',
  'Croacia': 'hr',
  'Cuba': 'cu',
  'Dinamarca': 'dk',
  'Ecuador': 'ec',
  'Eslovaquia': 'sk',
  'Finlandia': 'fi',
  'Francia': 'fr',
  'Ghana': 'gh',
  'Grecia': 'gr',
  'Inglaterra': 'gb-eng',
  'Irlanda': 'ie',
  'Italia': 'it',
  'Marruecos': 'ma',
  'Montenegro': 'me',
  'México': 'mx',
  'Nigeria': 'ng',
  'Panamá': 'pa',
  'Paraguay': 'py',
  'Países Bajos': 'nl',
  'Polonia': 'pl',
  'Portugal': 'pt',
  'Rumanía': 'ro',
  'Rusia': 'ru',
  'Senegal': 'sn',
  'Serbia': 'rs',
  'Suecia': 'se',
  'Ucrania': 'ua',
  'Uruguay': 'uy',
  'Venezuela': 've',
};

/**
 * Returns a high-res, cross-platform vector/SVG flag URL from FlagCDN.
 */
export function getNationalityFlagUrl(nationality: string): string {
  const code = NATIONALITY_ISO_CODE[nationality] || 'es';
  return `https://flagcdn.com/w80/${code}.png`;
}

/**
 * Short abbreviations for football positions.
 */
export const POSITION_ABBR: Record<string, string> = {
  'Portero': 'POR',
  'Defensa': 'DEF',
  'Centrocampista': 'MED',
  'Delantero': 'DEL',
};

export function getPositionAbbr(position: string): string {
  return POSITION_ABBR[position] || position.slice(0, 3).toUpperCase();
}
