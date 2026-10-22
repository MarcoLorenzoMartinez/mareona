interface CardCommemorativeHudProps {
  readonly title: string;
  readonly subtitle: string;
  readonly kind: "crest" | "moment";
}

function getAdaptiveTitleStyle(title: string): string {
  const len = title.length;
  if (len <= 11) {
    return "text-xs sm:text-sm tracking-wider";
  }
  if (len <= 16) {
    return "text-[10px] sm:text-xs tracking-normal";
  }
  return "text-[8.5px] sm:text-[10px] tracking-tight";
}

/**
 * Commemorative plate for non-competitive cards (crests and historical moments).
 * Displays title and era/year without stats or ratings, conforming to club collection rules.
 */
export function CardCommemorativeHud({
  title,
  subtitle,
  kind,
}: CardCommemorativeHudProps) {
  const titleStyle = getAdaptiveTitleStyle(title);

  return (
    <div className="relative z-10 w-full shrink-0 select-none pt-1">
      {/* Placa Heritage Grabada en Oro y Rojo (sin puntos suspensivos) */}
      <div className="relative flex flex-col items-center justify-center overflow-hidden rounded-none border border-amber-300/60 bg-gradient-to-r from-[#990011] via-[#e2001a] to-[#990011] px-1 py-1 text-center shadow-xs">
        <h3
          className={`whitespace-nowrap overflow-hidden font-sans font-black uppercase text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] leading-tight ${titleStyle}`}
          title={title}
        >
          {title}
        </h3>
        <p className="mt-0.5 whitespace-nowrap overflow-hidden font-sans font-bold text-[9px] sm:text-[10px] uppercase tracking-widest text-amber-200">
          {subtitle}
        </p>
      </div>

      {/* Franja de Tipo Conmemorativo */}
      <div className="mt-1 flex items-center justify-center rounded-none border border-amber-400/50 bg-amber-950/20 py-1 text-center shadow-2xs">
        <span className="font-sans text-[8.5px] font-black tracking-widest text-amber-300 uppercase">
          {kind === "crest" ? "CROMO DE ESCUDO HISTÓRICO" : "MOMENTO HISTÓRICO DEL CLUB"}
        </span>
      </div>
    </div>
  );
}
