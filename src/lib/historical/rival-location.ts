/**
 * Cleanly formats the geographic origin of a rival club, eliminating redundant
 * uniprovincial community repetitions such as "Asturias (Principado de Asturias)"
 * or "Madrid (Comunidad de Madrid)".
 *
 * @param rival Object containing province, community, country and isInternational.
 * @returns Human-readable, non-redundant geographic location string.
 */
export function formatRivalLocation(rival: {
  readonly isInternational?: boolean;
  readonly country?: string;
  readonly province?: string;
  readonly community?: string;
}): string {
  if (rival.isInternational) {
    return rival.country || "Internacional";
  }

  const prov = rival.province?.trim() ?? "";
  const comm = rival.community?.trim() ?? "";

  if (!prov && !comm) return "España";
  if (!comm) return prov;
  if (!prov) return comm;

  const pNorm = prov.toLowerCase();
  const cNorm = comm.toLowerCase();

  // Deduplicate uniprovincial communities
  if (
    pNorm === cNorm ||
    (pNorm === "asturias" && cNorm.includes("asturias")) ||
    (pNorm === "madrid" && cNorm.includes("madrid")) ||
    (pNorm === "murcia" && cNorm.includes("murcia")) ||
    (pNorm === "cantabria" && cNorm.includes("cantabria")) ||
    (pNorm === "navarra" && cNorm.includes("navarra")) ||
    (pNorm === "la rioja" && cNorm.includes("rioja")) ||
    (pNorm === "illes balears" && cNorm.includes("balears")) ||
    (pNorm === "ceuta" && cNorm.includes("ceuta")) ||
    (pNorm === "melilla" && cNorm.includes("melilla"))
  ) {
    return prov;
  }

  return `${prov} · ${comm}`;
}
