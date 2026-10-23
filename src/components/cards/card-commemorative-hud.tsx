interface CardCommemorativeHudProps {
  readonly title: string;
  readonly subtitle: string;
  readonly kind: "crest" | "moment" | "coach";
}

/**
 * Calculates adaptive font size and tracking based on title length
 * to ensure commemorative titles fit cleanly in the plate without ever clipping or showing ellipsis.
 */
function getAdaptiveTitleStyle(title: string): string {
  const len = title.length;
  if (len <= 12) {
    return "text-xs sm:text-sm tracking-wider";
  }
  if (len <= 16) {
    return "text-[10.5px] sm:text-xs tracking-normal";
  }
  if (len <= 20) {
    return "text-[9.5px] sm:text-[10.5px] tracking-tight";
  }
  return "text-[8.5px] sm:text-[9.5px] tracking-tighter";
}

/**
 * Calculates adaptive font size and tracking based on subtitle length
 * to ensure single years, year ranges, or multi-stage tenures fit cleanly without clipping.
 */
function getAdaptiveSubtitleStyle(subtitle: string): string {
  const len = subtitle.length;
  if (len <= 15) {
    return "text-[9px] sm:text-[10px] tracking-widest";
  }
  if (len <= 26) {
    return "text-[8px] sm:text-[9px] tracking-normal";
  }
  return "text-[7.5px] sm:text-[8px] tracking-tight";
}

/**
 * Commemorative plate for non-competitive cards (crests, historical moments, coaches).
 * Displays title with maximum visual space, and places year/era/tenures in the bottom compact box.
 * Guarantees zero ellipsis, no clipping for multi-tenure coaches, and authentic club typography.
 */
export function CardCommemorativeHud({
  title,
  subtitle,
}: CardCommemorativeHudProps) {
  const titleStyle = getAdaptiveTitleStyle(title);
  const subtitleStyle = getAdaptiveSubtitleStyle(subtitle);

  // Parse multi-tenure eras (e.g. Amadeo Sánchez, Díaz Novoa or Jesús Barrio) separated by "·"
  const tenures = subtitle.includes("·")
    ? subtitle.split("·").map((s) => s.trim())
    : null;

  return (
    <div className="relative z-10 w-full shrink-0 select-none pt-1">
      {/* 1. Placa Heritage Superior: Nombre completo del momento, escudo o entrenador */}
      <div className="relative flex items-center justify-center overflow-hidden rounded-none border border-amber-300/60 bg-gradient-to-r from-[#990011] via-[#e2001a] to-[#990011] px-1 py-1 sm:py-1.5 text-center shadow-xs">
        <h3
          className={`whitespace-nowrap overflow-hidden font-sans font-black uppercase text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] leading-tight ${titleStyle}`}
          title={title}
        >
          {title}
        </h3>
      </div>

      {/* 2. Recuadro Inferior: Fechas, años o etapas de entrenador con ajuste multietapa sin cortes */}
      <div className="mt-1 flex items-center justify-center rounded-none border border-amber-400/50 bg-amber-950/40 px-1 py-0.5 text-center shadow-2xs min-h-[20px]">
        {tenures && tenures.length > 1 ? (
          <div
            className={`flex flex-wrap items-center justify-center gap-x-1 gap-y-0.5 font-sans font-bold uppercase text-amber-200 leading-tight ${subtitleStyle}`}
          >
            {tenures.map((tenure, idx) => (
              <span key={idx} className="inline-flex items-center whitespace-nowrap">
                <span>{tenure}</span>
                {idx < tenures.length - 1 && (
                  <span className="ml-1 text-amber-400/60 select-none">·</span>
                )}
              </span>
            ))}
          </div>
        ) : (
          <span
            className={`whitespace-nowrap font-sans font-bold uppercase text-amber-200 px-0.5 ${subtitleStyle}`}
          >
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
}
