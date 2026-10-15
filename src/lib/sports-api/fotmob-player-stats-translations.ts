/**
 * Translation dictionary and helpers for player statistics metrics from FotMob.
 * Translates stat categories and metric titles into canonical Spanish football terminology.
 */

const STAT_GROUPS: Readonly<Record<string, string>> = {
  shooting: "Remates",
  passing: "Pases",
  possession: "Posesión",
  defending: "Defensa",
  goalkeeping: "Portería",
  distribution: "Distribución",
  discipline: "Disciplina",
};

const STAT_TITLES: Readonly<Record<string, string>> = {
  // Remates (Shooting)
  "goals": "Goles",
  "xg": "Goles esperados (xG)",
  "xgot": "xG a puerta (xGOT)",
  "xg excl. penalty": "xG sin penaltis",
  "shots": "Tiros totales",
  "shots on target": "Tiros a puerta",
  "shot conversion %": "Eficacia de tiro (%)",
  "hit woodwork": "Tiros al palo",
  "big chances missed": "Grandes ocasiones falladas",

  // Pases (Passing)
  "assists": "Asistencias",
  "xa": "Asistencias esperadas (xA)",
  "accurate passes": "Pases precisos",
  "pass accuracy": "Precisión de pases (%)",
  "accurate long balls": "Balones largos precisos",
  "long ball accuracy": "Precisión balones largos (%)",
  "line-breaking passes": "Pases entre líneas",
  "chances created": "Ocasiones creadas",
  "big chances created": "Grandes ocasiones creadas",
  "successful crosses": "Centros completados",
  "cross accuracy": "Precisión de centros (%)",
  "passes into final third": "Pases al último tercio",

  // Posesión (Possession)
  "dribbles": "Regates",
  "dribbles success rate": "Éxito en regates (%)",
  "duels won": "Duelos ganados",
  "duels won %": "Duelos ganados (%)",
  "aerials won": "Duelos aéreos ganados",
  "aerials won %": "Duelos aéreos ganados (%)",
  "ground duels won": "Duelos en el suelo ganados",
  "ground duels won %": "Duelos en el suelo ganados (%)",
  "touches": "Toques",
  "touches in opposition box": "Toques en área rival",
  "dispossessed": "Pérdidas de balón",
  "fouls won": "Faltas recibidas",
  "offsides": "Fueras de juego",

  // Defensa (Defending)
  "defensive actions": "Acciones defensivas",
  "tackles": "Entradas con éxito",
  "interceptions": "Intercepciones",
  "fouls committed": "Faltas cometidas",
  "recoveries": "Recuperaciones",
  "possession won final 3rd": "Recuperaciones en 3/4",
  "dribbled past": "Regateado",
  "clearances": "Despejes",
  "headed clearances": "Despejes de cabeza",
  "blocks": "Bloqueos",
  "clean sheets": "Porterías a cero",
  "goals conceded while on pitch": "Goles encajados en el campo",
  "xg against while on pitch": "xG en contra en el campo",

  // Disciplina (Discipline)
  "yellow cards": "Tarjetas amarillas",
  "red cards": "Tarjetas rojas",

  // Portería (Goalkeeping)
  "saves": "Paradas",
  "save percentage": "Eficacia en paradas (%)",
  "goals conceded": "Goles encajados",
  "goals prevented": "Goles evitados",
  "xgot faced": "xGOT recibido",
  "penalties faced": "Penaltis recibidos",
  "penalties saved": "Penaltis parados",
  "high claims": "Salidas por alto",
  "punches": "Despejes de puños",
  "sweeper actions": "Acciones de líbero",
  "conceded from inside box": "Encajados dentro del área",
  "conceded from outside box": "Encajados fuera del área",

  // Generales
  "minutes played": "Minutos jugados",
  "matches started": "Titularidades",
};

/**
 * Translates a stat group category title (e.g. "shooting" -> "Remates").
 *
 * @param rawTitle - Original group title from FotMob.
 * @returns Spanish category title or fallback.
 */
export function translatePlayerStatGroupTitle(rawTitle: string | null | undefined): string {
  if (!rawTitle) return "General";
  const key = rawTitle.trim().toLowerCase();
  return STAT_GROUPS[key] || rawTitle;
}

/**
 * Translates an individual player statistic title (e.g. "Tackles" -> "Entradas con éxito").
 *
 * @param rawTitle - Original statistic metric title from FotMob.
 * @returns Spanish metric title or original title if not found.
 */
export function translatePlayerStatTitle(rawTitle: string | null | undefined): string {
  if (!rawTitle) return "";
  const key = rawTitle.trim().toLowerCase();
  return STAT_TITLES[key] || rawTitle;
}
