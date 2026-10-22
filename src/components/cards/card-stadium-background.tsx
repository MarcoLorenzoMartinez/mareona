import Image from "next/image";

interface CardStadiumBackgroundProps {
  readonly className?: string;
  readonly isLegend?: boolean;
}

/**
 * Full-bleed authentic El Molinón stadium background for Panini Adrenalyn style cards.
 * Features real stadium photography, floodlight flare, and dynamic athletic angles.
 */
export function CardStadiumBackground({
  className = "",
  isLegend = false,
}: CardStadiumBackgroundProps) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 select-none overflow-hidden ${className}`}
      aria-hidden="true"
    >
      {/* 1. Fotografía auténtica de El Molinón */}
      <Image
        src="/stadiums/el-molinon.jpg"
        alt=""
        fill
        sizes="(max-width: 640px) 240px, 320px"
        className="object-cover object-[center_30%] opacity-40 contrast-125 saturate-125"
        priority
      />

      {/* 2. Iluminación deportiva de focos en la parte superior */}
      <div className="absolute -top-16 left-1/2 -translate-x-1/2 h-52 w-64 rounded-full bg-radial from-white/40 via-amber-300/20 to-transparent blur-2xl" />

      {/* 3. Viñeta degradada rojiblanca de alto impacto */}
      <div
        className={`absolute inset-0 ${
          isLegend
            ? "bg-gradient-to-b from-[#1a0003]/80 via-transparent to-[#1a0003]/95"
            : "bg-gradient-to-b from-[#1c0205]/75 via-transparent to-[#1a0003]/90"
        }`}
      />

      {/* 4. Arcos deportivos dorados y rojos dinámicos de velocidad estilo Adrenalyn */}
      <svg
        className="absolute inset-0 h-full w-full opacity-60"
        viewBox="0 0 100 140"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M 0 15 Q 40 40 100 25" fill="none" stroke="#f59e0b" strokeWidth="1.5" />
        <path d="M 0 18 Q 45 44 100 28" fill="none" stroke="#e2001a" strokeWidth="2.5" />
        <path d="M 100 115 Q 60 125 15 140" fill="none" stroke="#f59e0b" strokeWidth="1.5" />
      </svg>

      {/* 5. Trama sutil deportiva de semitonos (halftone) */}
      <div
        className="absolute inset-0 opacity-15"
        style={{
          backgroundImage: "radial-gradient(rgba(255, 255, 255, 0.6) 1px, transparent 1px)",
          backgroundSize: "6px 6px",
        }}
      />
    </div>
  );
}
