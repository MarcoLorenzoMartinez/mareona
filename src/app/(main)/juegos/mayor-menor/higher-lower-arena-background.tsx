import Image from 'next/image';

interface HigherLowerArenaBackgroundProps {
  className?: string;
}

/**
 * Atmospheric background backdrop for the Higher or Lower match arena.
 * Uses authentic El Molinón photography in subtle monochrome/warm contrast
 * beneath a clean neutral overlay to eliminate flat white AI-template aesthetics
 * while adhering to Mareona's official light theme and WCAG AA contrast standards.
 */
export function HigherLowerArenaBackground({
  className = '',
}: HigherLowerArenaBackgroundProps) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 -z-10 select-none overflow-hidden rounded-3xl border border-neutral-200/80 shadow-inner ${className}`}
      aria-hidden="true"
    >
      {/* 1. Fotografía auténtica de El Molinón con mayor presencia */}
      <Image
        src="/stadiums/el-molinon.jpg"
        alt=""
        fill
        sizes="(max-width: 1024px) 100vw, 900px"
        className="object-cover object-center opacity-[0.16] filter grayscale contrast-115"
        priority
      />

      {/* 2. Velo suave con sutil tinte rojiblanco superior que da profundidad */}
      <div className="absolute inset-0 bg-gradient-to-b from-rose-50/50 via-neutral-50/60 to-white/95" />
    </div>
  );
}
