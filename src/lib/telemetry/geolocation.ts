/**
 * Maps incoming server headers (e.g. from Vercel Edge CDN) into clean Spanish province names.
 * Ensures privacy compliance: operates on aggregated region codes without storing IP addresses.
 */

const REGION_CODE_MAP: Readonly<Record<string, string>> = {
  AS: "Asturias",
  MD: "Madrid",
  CL: "Castilla y León",
  LE: "León",
  GA: "Galicia",
  CB: "Cantabria",
  PV: "País Vasco",
  CT: "Cataluña",
  AN: "Andalucía",
  VC: "Comunitat Valenciana",
  AR: "Aragón",
  MC: "Murcia",
  EX: "Extremadura",
  CM: "Castilla-La Mancha",
  CN: "Canarias",
  IB: "Illes Balears",
  NC: "Navarra",
  RI: "La Rioja",
};

const ASTURIAN_CITIES = new Set(["gijon", "gijón", "oviedo", "aviles", "avilés", "mieres", "langreo", "siero"]);

/**
 * Resolves the primary Spanish province or fallback name for a visit.
 */
export function resolveProvinceName(regionCode?: string | null, city?: string | null): string {
  if (city && ASTURIAN_CITIES.has(city.toLowerCase().trim())) {
    return "Asturias";
  }

  if (regionCode) {
    const upper = regionCode.toUpperCase().trim();
    if (REGION_CODE_MAP[upper]) {
      return REGION_CODE_MAP[upper];
    }
  }

  return "Desconocida";
}

/**
 * Maps a country code (ISO 3166-1 alpha-2) to its Spanish localized display name.
 */
export function resolveCountryName(countryCode?: string | null): string {
  if (!countryCode) return "Desconocido";
  const code = countryCode.toUpperCase().trim();

  const COUNTRY_MAP: Record<string, string> = {
    ES: "España",
    MX: "México",
    GB: "Reino Unido",
    UK: "Reino Unido",
    FR: "Francia",
    DE: "Alemania",
    US: "Estados Unidos",
    AR: "Argentina",
    CH: "Suiza",
    BE: "Bélgica",
  };

  return COUNTRY_MAP[code] || "Otros";
}
