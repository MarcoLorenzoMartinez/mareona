import Image from "next/image";
import { areOfficialAssetsEnabled } from "@/lib/legal/official-assets";

interface CardStadiumBackgroundProps {
  readonly className?: string;
  readonly isOwned?: boolean;
}

/**
 * Heritage-style subtle stadium backdrop for Topps/Panini Classic collection cards.
 * Combines authentic El Molinón photography in warm sepia/monochrome tone
 * with delicate paper/cardstock texture and lighting.
 */
export function CardStadiumBackground({
  className = "",
  isOwned = true,
}: CardStadiumBackgroundProps) {
  const showOfficialAssets = areOfficialAssetsEnabled();
  return (
    <div
      className={`pointer-events-none absolute inset-0 select-none overflow-hidden ${className}`}
      aria-hidden="true"
    >
      {/* 1. Fotografía auténtica de El Molinón en tono noble y cálido */}
      {showOfficialAssets && (
        <Image
          src="/stadiums/el-molinon.jpg"
          alt=""
          fill
          sizes="(max-width: 640px) 240px, 320px"
          className={`object-cover object-center filter ${
            isOwned
              ? "opacity-25 contrast-110 saturate-50 mix-blend-multiply"
              : "opacity-15 grayscale contrast-125"
          }`}
        />
      )}

      {/* 2. Degradado sutil para dar volumen a la ventana del cromo */}
      <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/60 via-transparent to-neutral-900/30" />

      {/* 3. Sombra interior profunda de bisel de marco */}
      <div className="absolute inset-0 shadow-[inset_0_2px_8px_rgba(0,0,0,0.5)]" />
    </div>
  );
}
