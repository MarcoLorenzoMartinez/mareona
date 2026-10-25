/**
 * Computes a clean, concise football display name (e.g. "Rosas", "Yáñez", "Gelabert", "Gaspar").
 * Handles known single-name players, compound nicknames, and extracts the primary football name.
 *
 * @param fullName Full federative name or current display name
 * @returns Clean concise name for tactical tokens
 */
export function getConcisePlayerName(fullName: string): string {
  const trimmed = fullName.trim();
  if (!trimmed) return "";

  // Diccionario canónico de nombres futbolísticos reconocidos del Sporting
  const KNOWN_NICKNAMES: Readonly<Record<string, string>> = {
    "ruben yanez": "Yáñez",
    "yanez": "Yáñez",
    "guillermo rosas": "Rosas",
    "guille rosas": "Rosas",
    "pablo garcia": "P. García",
    "emanuel gularte": "Gularte",
    "diego sanchez": "Diego S.",
    "pablo vazquez": "P. Vázquez",
    "jorge saenz": "Sáenz",
    "jorge": "Sáenz",
    "aimar dunabeitia": "Duñabeitia",
    "iker martinez": "Iker M.",
    "andres cuenca": "Cuenca",
    "nacho martin": "Nacho M.",
    "gaspar campos": "Gaspar",
    "manu rodriguez": "Manu R.",
    "andres ferrari": "Ferrari",
    "cesar gelabert": "Gelabert",
    "konrad de la fuente": "Konrad",
    "egoitz arana": "Arana",
    "alex corredera": "Corredera",
    "alejo sarco": "Sarco",
    "antonio casas": "Casas",
    "juan otero": "Otero",
    "nikita iosifov": "Iosifov",
    "mamadou loum": "Loum",
    "hugo guillamon": "Guillamón",
    "enol prendes": "Enol",
    "miguel conde": "M. Conde",
    "diego matabuena": "Mata",
    "mata": "Mata",
    "christian ferreres": "Ferreres",
    "bruno rubio": "Bruno",
    "borja montes": "Borja M.",
    "pelayo perez": "Pelayo",
    "alex lozano": "Lozano",
    "pablo diez": "P. Díez",
  };

  const normalizedKey = trimmed
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  if (KNOWN_NICKNAMES[normalizedKey]) {
    return KNOWN_NICKNAMES[normalizedKey];
  }

  // Si ya es un nombre corto simple (ej. "Gaspar", "Konrad", "Mata")
  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) {
    return parts[0];
  }

  // Para nombres compuestos estándar (Nombre + Apellido), tomar el apellido
  // O inicial + apellido si hay 2 partes (ej: "Pablo García" -> "P. García")
  if (parts.length === 2) {
    return parts[1];
  }

  // Para 3 o más palabras (ej. "Konrad de la Fuente", "Enol Prendes Rodríguez")
  return parts[0];
}
