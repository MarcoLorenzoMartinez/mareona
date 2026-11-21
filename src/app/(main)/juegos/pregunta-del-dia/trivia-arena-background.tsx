import Image from 'next/image';
import { areOfficialAssetsEnabled } from '@/lib/legal/official-assets';

interface TriviaArenaBackgroundProps {
  className?: string;
}

/**
 * Atmospheric background backdrop for "La Pregunta del Día".
 * Mirrors Mareona's design system seen in Wordle and Más o Menos,
 * featuring an authentic El Molinón overlay to banish empty AI-template look.
 */
export function TriviaArenaBackground({ className = '' }: TriviaArenaBackgroundProps) {
  const showOfficialAssets = areOfficialAssetsEnabled();
  return (
    <div
      className={`pointer-events-none absolute inset-0 -z-10 select-none overflow-hidden rounded-3xl border border-neutral-200/80 shadow-2xs ${className}`}
      aria-hidden="true"
    >
      {showOfficialAssets && (
        <Image
          src="/stadiums/el-molinon.jpg"
          alt=""
          fill
          sizes="(max-width: 1024px) 100vw, 768px"
          className="object-cover object-center opacity-[0.12] filter grayscale contrast-110"
          priority
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-rose-50/60 via-white/85 to-white" />
    </div>
  );
}
